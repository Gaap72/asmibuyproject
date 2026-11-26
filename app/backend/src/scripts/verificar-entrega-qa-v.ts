import fs from 'fs';
import path from 'path';
import ts from 'typescript';

/**
 * QA-V-03 a QA-V-07, sin base de datos. Los servicios y componentes se transpilan desde el
 * fuente y se ejecutan con dobles de Angular, HttpClient y almacenamiento del navegador.
 * No sustituye la comprobación visual en navegador.
 */

let total = 0;
let fallos = 0;
function caso(nombre: string, ok: boolean): void {
  total++;
  if (!ok) fallos++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${nombre}`);
}

// Raíz del repo, tanto desde src/scripts como desde dist/scripts
const raiz = path.resolve(__dirname, '..', '..', '..', '..');
const src = path.join(raiz, 'app', 'frontend', 'src');
const leer = (...partes: string[]) => fs.readFileSync(path.join(src, ...partes), 'utf8');

const rx = require('rxjs');

// ---------------------------------------------------------------------------
// Dobles del navegador y de Angular
// ---------------------------------------------------------------------------
const documento = { cookie: '', getElementById: () => null };
const almacen = new Map<string, string>();
const almacenamiento = {
  getItem: (k: string) => almacen.get(k) ?? null,
  setItem: (k: string, v: string) => void almacen.set(k, v),
  removeItem: (k: string) => void almacen.delete(k)
};
for (const [nombre, valor] of Object.entries({ document: documento, localStorage: almacenamiento, sessionStorage: almacenamiento })) {
  Object.defineProperty(globalThis, nombre, { value: valor, configurable: true });
}

function signal<T>(inicial: T) {
  let valor = inicial;
  return Object.assign(() => valor, { set: (v: T) => { valor = v; } });
}

class HttpClient {}
class HttpHeaders {
  constructor(public valores: Record<string, string> = {}) {}
}
class Router {}
class DestroyRef {}

const proveedores = new Map<unknown, unknown>();
const sinDecorador = () => () => undefined;
const dobles: Record<string, unknown> = {
  rxjs: rx,
  '@angular/core': {
    Injectable: sinDecorador, Component: sinDecorador, DestroyRef, signal,
    computed: (fn: () => unknown) => fn,
    inject: (token: unknown) => proveedores.get(token)
  },
  '@angular/core/rxjs-interop': { takeUntilDestroyed: () => (origen: unknown) => origen },
  '@angular/common': { CommonModule: {} },
  '@angular/common/http': { HttpClient, HttpHeaders },
  '@angular/forms': { FormsModule: {} },
  '@angular/router': { Router }
};

function cargar(...partes: string[]): any {
  const js = ts.transpileModule(leer(...partes), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, experimentalDecorators: true }
  }).outputText;
  const modulo = { exports: {} };
  const requerir = (id: string) => dobles[id] ?? dobles[path.posix.basename(id)] ?? {};
  new Function('module', 'exports', 'require', js)(modulo, modulo.exports, requerir);
  dobles[partes[partes.length - 1].replace(/\.ts$/, '')] = modulo.exports;
  return modulo.exports;
}

const { AuthService } = cargar('app', 'services', 'auth.service.ts');
const { PromocionesApiService } = cargar('app', 'services', 'promociones.service.ts');
const { VentasApiService } = cargar('app', 'services', 'ventas.service.ts');
const { InventarioApiService } = cargar('app', 'services', 'inventario.service.ts');
const { VentaComponent, actualizarLineasCarrito, hayLineasDesactualizadas } =
  cargar('app', 'components', 'venta', 'venta.component.ts');
const gestion = cargar('app', 'components', 'gestion', 'gestion.component.ts');

// ---------------------------------------------------------------------------
// Entorno: servicios y componente reales sobre un HttpClient falso
// ---------------------------------------------------------------------------
const COTIZACION = { subtotalBruto: '200.00', descuentoTotal: '0.00', total: '200.00', partidas: [] };
const CLAVE = 'asmibuy_venta_pendiente:7';
const MENSAJE = 'Tu sesión cambió en otra pestaña. Pulsa Confirmar de nuevo.';

interface Peticion { url: string; cuerpo: any; token: string }
type Falla = { status: number; error?: { codigo: string; mensaje?: string; detalles?: unknown } } | null;

function entorno() {
  almacen.clear();
  documento.cookie = 'asmibuy_csrf=viejo';
  const peticiones: Peticion[] = [];
  const control = {
    fallaVenta: null as Falla,
    alConfirmar: (): void => undefined,
    cotizacion: COTIZACION as any,
    catalogo: [] as any[],
    recargas: 0
  };
  proveedores.set(InventarioApiService, {
    listarPlatillosPublicos: () => { control.recargas++; return rx.of(control.catalogo); }
  });

  const http = {
    get: (url: string) => {
      peticiones.push({ url, cuerpo: null, token: '' });
      if (url.endsWith('/csrf')) return rx.of({ csrfToken: 'pedido' });
      return rx.of({ usuario: { id: 7, nombre: 'QA', perfil: 'TRABAJADOR', activo: true } });
    },
    post: (url: string, cuerpo: any, opciones: any) => {
      const cabeceras = opciones?.headers;
      const token: string = (cabeceras?.valores ?? cabeceras ?? {})['X-CSRF-Token'] ?? '';
      peticiones.push({ url, cuerpo, token });
      // Igual que validarCSRF: la cabecera debe coincidir con la cookie vigente
      const cookie = /asmibuy_csrf=([^;]+)/.exec(documento.cookie)?.[1];
      if (token !== cookie) return rx.throwError(() => ({ status: 403, error: { codigo: 'CSRF_INVALIDO' } }));
      if (url.endsWith('/cotizar')) return rx.of(control.cotizacion);
      if (url.endsWith('/confirmar')) {
        control.alConfirmar();
        const falla = control.fallaVenta;
        if (falla) return rx.throwError(() => falla);
        return rx.of({ folio: 'ORD-QA', usuarioId: 7 });
      }
      return rx.of({ exito: true });
    }
  };

  proveedores.set(HttpClient, http);
  proveedores.set(Router, { navigate: () => undefined });
  proveedores.set(DestroyRef, {});
  const auth = new AuthService();
  proveedores.set(AuthService, auth);
  proveedores.set(PromocionesApiService, new PromocionesApiService());
  proveedores.set(VentasApiService, new VentasApiService());
  const venta = new VentaComponent();
  venta.carrito.set([{ platillo: { id: 1, nombre: 'QA', precio: '100.00' }, cantidad: 2 }]);
  venta.cotizacion.set(COTIZACION);

  const confirmaciones = () => peticiones.filter((p) => p.url.endsWith('/confirmar'));
  return { auth, venta, peticiones, control, confirmaciones };
}

const emitido = (obs: any): string => {
  let valor = '';
  obs.subscribe((v: string) => { valor = v; });
  return valor;
};
const rechazoCsrf: Falla = { status: 403, error: { codigo: 'CSRF_INVALIDO' } };

console.log('a) Metadescripción (QA-V-05)');
const index = leer('index.html');
caso('index.html tiene la meta description acordada',
  /<meta name="description" content="Asmibuy: punto de venta e inventario para restaurante, web móvil\.">/.test(index));
caso('está en head, después del viewport',
  /<head>[\s\S]*name="viewport"[^>]*>\s*<meta name="description"[\s\S]*<\/head>/.test(index));

console.log('b) Encabezados de Avisos (QA-V-06)');
{
  const avisos = leer('app', 'components', 'avisos', 'avisos.component.ts');
  caso('no queda ningún h4', !/<h4[\s>]|\bh4\s*\{/.test(avisos));
  caso('el nombre del insumo es h3 y conserva su estilo',
    /<h3>\{\{ aviso\.nombre \}\}<\/h3>/.test(avisos) && /\.aviso-details h3 \{[^}]*font-size: 0\.98rem/.test(avisos));
  const niveles = [...avisos.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  caso('los niveles son h2 y h3, sin saltos', niveles.join(',') === '2,3');
  caso('conserva la etiqueta «Inactivo» (QA-V-01)', /Inactivo/.test(avisos) && /aviso-inactivo/.test(avisos));
}

console.log('c) Errores por campo en Gestión (QA-V-07)');
const plantilla = leer('app', 'components', 'gestion', 'gestion.component.ts');
{
  const formularios = [...plantilla.matchAll(/<form \(ngSubmit\)="(\w+)\(\)">([\s\S]*?)<\/form>/g)];
  caso(`hay 5 formularios (encontrados: ${formularios.length})`, formularios.length === 5);
  for (const [, nombre, cuerpo] of formularios) {
    const invalidos = (cuerpo.match(/\[attr\.aria-invalid\]=/g) ?? []).length;
    const descritos = (cuerpo.match(/\[attr\.aria-describedby\]=/g) ?? []).length;
    const salidas = (cuerpo.match(/\(blur\)="tocarCampo\(/g) ?? []).length;
    caso(`${nombre}: ${invalidos} aria-invalid, ${descritos} aria-describedby y ${salidas} salidas de campo`,
      invalidos > 0 && invalidos === descritos && invalidos === salidas);
  }
  const referidos = [...plantilla.matchAll(/\? '([\w-]+-error)' : null/g)].map((m) => m[1]);
  caso(`cada id descrito tiene su mensaje con icono (${referidos.length} fijos y los de la receta)`,
    referidos.length > 0 && new Set(referidos).size === referidos.length
    && referidos.every((id) => new RegExp(`id="${id}" class="campo-error">\\s*<span aria-hidden="true" class="material-symbols-rounded">error</span>`).test(plantilla))
    && /id="receta-\{\{i\}\}-error" class="campo-error/.test(plantilla));
  caso('el mensaje usa el color de error', /\.campo-error \{[^}]*color: var\(--color-error\)/.test(plantilla));
  caso('las 5 alertas de modal conservan role="alert"', (plantilla.match(/notif-modal" role="alert"/g) ?? []).length === 5);
  caso('conserva los objetivos de 44 px (QA-V-02)', /var\(--touch-target-min\)/.test(plantilla));
}
{
  const vacios = [
    ...gestion.validarIngrediente({ nombre: ' ' }),
    ...gestion.validarPlatillo({ nombre: '', precio: '', receta: [{ ingredienteId: 0, cantidad: '' }] }),
    ...gestion.validarEntrada({ ingredienteId: 0, cantidad: '' }),
    ...gestion.validarAjuste({ ingredienteId: 0, cantidad: '', motivo: '' }),
    ...gestion.validarPromocion({ nombre: '', platilloId: 0, tipo: 'PORCENTAJE', porcentaje: '', n: 2, m: 1, duracion: 'TEMPORAL', fechaInicioLocal: '', fechaFinLocal: '' }),
    ...gestion.validarPromocion({ nombre: 'x', platilloId: 1, tipo: 'NXM', porcentaje: '', n: 0, m: 0, duracion: 'PERMANENTE', fechaInicioLocal: '', fechaFinLocal: '' })
  ] as { campo: string; mensaje: string }[];
  const campos = [...new Set(vacios.map((e) => e.campo))];
  caso(`los ${campos.length} campos validados existen en la plantilla y tienen mensaje`,
    campos.length === 17 && campos.every((c) => plantilla.includes(`id="${c.replace(/-0$/, '-{{i}}')}"`)));
  const promo = (cambios: object) => gestion.validarPromocion({
    nombre: 'x', platilloId: 1, tipo: 'NXM', porcentaje: '15', n: 2, m: 1,
    duracion: 'PERMANENTE', fechaInicioLocal: '', fechaFinLocal: '', ...cambios
  }).map((e: { campo: string }) => e.campo).join(',');
  caso('promoción válida sin errores', promo({}) === '');
  caso('NxM marca solo el campo que falla', promo({ n: null }) === 'promo-n' && promo({ m: null }) === 'promo-m' && promo({ n: 2, m: 2 }) === 'promo-n');
  caso('fechas en orden inverso marcan el fin',
    promo({ duracion: 'TEMPORAL', fechaInicioLocal: '2026-01-02T10:00', fechaFinLocal: '2026-01-01T10:00' }) === 'promo-fin');
  caso('una fila de receta válida basta, como antes',
    gestion.validarPlatillo({ nombre: 'x', precio: '1', receta: [{ ingredienteId: 0, cantidad: '' }, { ingredienteId: 1, cantidad: '2' }] }).length === 0);
}
{
  const enfocados: string[] = [];
  (documento as any).getElementById = (id: string) => ({ focus: () => enfocados.push(id) });
  let altas = 0;
  proveedores.set(InventarioApiService, { crearIngrediente: () => { altas++; return rx.EMPTY; } });
  const g = new gestion.GestionComponent();
  const temporizador = globalThis.setTimeout;
  // El foco (sin demora) se ejecuta al momento; el borrado de la alerta se ignora
  (globalThis as any).setTimeout = (fn: () => void, ms?: number) => { if (!ms) fn(); };
  g.abrirModalIngrediente();
  caso('al abrir no hay mensajes', g.errorDe('ing-nombre') === '');
  g.tocarCampo('ing-nombre');
  caso('al salir del campo vacío aparece su mensaje', g.errorDe('ing-nombre') === 'El nombre del insumo es obligatorio.');
  g.formIngrediente.nombre = 'Pan';
  caso('al corregirlo desaparece', g.errorDe('ing-nombre') === '');
  g.cerrarModales();
  g.tocarCampo('ing-nombre');
  g.abrirModalIngrediente();
  caso('cerrar el modal olvida los campos visitados', g.errorDe('ing-nombre') === '');
  g.guardarIngrediente();
  caso('al enviar: resumen, mensaje en el campo y sin llamada a la API',
    g.mensajeError() === 'El nombre del insumo es obligatorio.' && g.errorDe('ing-nombre') === g.mensajeError() && altas === 0);
  caso('el foco va al campo inválido', enfocados.join() === 'ing-nombre');
  g.cerrarModales();
  g.abrirModalAjuste();
  g.formAjuste.ingredienteId = 1;
  g.guardarAjuste();
  caso('ajuste: foco en el primer inválido y todos los inválidos marcados',
    enfocados[enfocados.length - 1] === 'aj-cant' && !!g.errorDe('aj-mot') && !g.errorDe('aj-ing'));
  globalThis.setTimeout = temporizador;
}

console.log('d) Token CSRF: la cookie antes que el signal (QA-V-03)');
{
  const { auth, peticiones } = entorno();
  auth.csrfToken.set('viejo');
  documento.cookie = 'otra=1; asmibuy_csrf=nuevo';
  caso('asegurarCsrfToken emite el token de la cookie', emitido(auth.asegurarCsrfToken()) === 'nuevo');
  caso('asegurarCsrfToken actualiza el signal', auth.csrfToken() === 'nuevo');
  documento.cookie = '';
  caso('sin cookie usa el signal', emitido(auth.asegurarCsrfToken()) === 'nuevo' && !peticiones.some((p) => p.url.endsWith('/csrf')));
  auth.csrfToken.set('');
  caso('sin cookie ni signal pide /auth/csrf', emitido(auth.asegurarCsrfToken()) === 'pedido' && peticiones.some((p) => p.url.endsWith('/auth/csrf')));
  auth.csrfToken.set('viejo');
  documento.cookie = 'asmibuy_csrf=nuevo';
  auth.logout();
  const salida = peticiones.find((p) => p.url.endsWith('/logout'));
  caso('las cabeceras de logout llevan el token de la cookie', salida?.token === 'nuevo' && auth.csrfToken() === 'nuevo');
}

console.log('e) Venta con token renovado en otra pestaña (QA-V-03)');
{
  const { venta, confirmaciones, peticiones } = entorno();
  documento.cookie = 'asmibuy_csrf=nuevo';
  venta.recalcularCotizacion();
  const cot = peticiones.find((p) => p.url.endsWith('/cotizar'));
  caso('cotizar envía el token nuevo y conserva el total', cot?.token === 'nuevo' && venta.cotizacion()?.total === '200.00' && !venta.mensajeError());
  documento.cookie = 'asmibuy_csrf=otro';
  venta.confirmarVenta();
  caso('confirmar envía el token vigente y la venta se completa', confirmaciones()[0]?.token === 'otro' && venta.ordenComprobante()?.folio === 'ORD-QA');
}
{
  const { venta, control, confirmaciones } = entorno();
  control.fallaVenta = rechazoCsrf;
  venta.confirmarVenta();
  caso('403 CSRF_INVALIDO en el primer envío borra su pendiente', !almacen.has(CLAVE));
  caso('libera el bloqueo y muestra el mensaje', venta.ventaPendienteClave() === null && !venta.confirmando() && venta.mensajeAlerta() === MENSAJE);
  caso('conserva carrito y total', venta.carrito().length === 1 && venta.cotizacion()?.total === '200.00');
  control.fallaVenta = null;
  documento.cookie = 'asmibuy_csrf=nuevo';
  venta.confirmarVenta();
  const [primera, segunda] = confirmaciones();
  caso('la segunda confirmación usa el token nuevo y se completa', segunda?.token === 'nuevo' && venta.ordenComprobante()?.folio === 'ORD-QA');
  caso('la segunda confirmación usa una clave nueva', !!segunda && primera.cuerpo.claveIdempotencia !== segunda.cuerpo.claveIdempotencia);
}
{
  const { venta, control } = entorno();
  control.fallaVenta = { status: 0 };
  venta.confirmarVenta();
  const pendiente = almacen.get(CLAVE);
  control.fallaVenta = rechazoCsrf;
  venta.reintentarVentaPendiente();
  caso('403 CSRF en un reintento tras respuesta incierta conserva el pendiente',
    !!pendiente && almacen.get(CLAVE) === pendiente && !!venta.ventaPendienteClave() && venta.mensajeAlerta() !== MENSAJE);
}
{
  const { venta, control } = entorno();
  const solicitud = JSON.stringify({ claveIdempotencia: 'previa', metodoPago: 'EFECTIVO', items: [], cotizacionAceptada: COTIZACION });
  almacen.set(CLAVE, solicitud);
  venta.revisarVentaPendienteLocal();
  control.fallaVenta = rechazoCsrf;
  venta.reintentarVentaPendiente();
  caso('403 CSRF al reintentar un pendiente restaurado lo conserva',
    almacen.get(CLAVE) === solicitud && venta.ventaPendienteClave() === 'previa');
}
{
  const { venta, control } = entorno();
  const ajena = JSON.stringify({ claveIdempotencia: 'de-otra-pestana' });
  control.alConfirmar = () => almacen.set(CLAVE, ajena);
  control.fallaVenta = rechazoCsrf;
  venta.confirmarVenta();
  caso('si el pendiente guardado es de otra operación no se borra ni se libera',
    almacen.get(CLAVE) === ajena && !!venta.ventaPendienteClave());
}
for (const [nombre, falla] of [
  ['403 con otro código', { status: 403, error: { codigo: 'ORIGEN_NO_PERMITIDO' } }],
  ['error de red', { status: 0 }],
  ['error 500', { status: 500, error: { codigo: 'ERROR_INTERNO' } }]
] as [string, Falla][]) {
  const { venta, control } = entorno();
  control.fallaVenta = falla;
  venta.confirmarVenta();
  caso(`${nombre} sigue siendo incierto y conserva el pendiente`, almacen.has(CLAVE) && !!venta.ventaPendienteClave());
}

console.log('f) Catálogo y carrito tras recotizar (QA-V-04)');
const VIEJO = { id: 1, nombre: 'QA', precio: '100.00' };
const NUEVO = { id: 1, nombre: 'QA Doble', precio: '120.00' };
const partida = (nombrePlatillo: string, precioUnitario: string) => ({ platilloId: 1, nombrePlatillo, precioUnitario });
{
  const carrito = [{ platillo: VIEJO, cantidad: 3 }, { platillo: { id: 2, nombre: 'Otro', precio: '5.00' }, cantidad: 1 }];
  const lineas = actualizarLineasCarrito(carrito, [NUEVO]);
  caso('actualiza nombre y precio por id y conserva la cantidad',
    lineas[0].platillo.nombre === 'QA Doble' && lineas[0].platillo.precio === '120.00' && lineas[0].cantidad === 3);
  caso('no vacía ni quita líneas ausentes del catálogo', lineas.length === 2 && lineas[1] === carrito[1]);
  caso('no muta el carrito original', carrito[0].platillo.nombre === 'QA');
  caso('detecta precio o nombre distintos en la cotización',
    hayLineasDesactualizadas(carrito, [partida('QA', '110.00')]) && hayLineasDesactualizadas(carrito, [partida('Nuevo', '100.00')]));
  caso('mismo valor con otro formato no recarga', !hayLineasDesactualizadas(carrito, [partida('QA', '100')]));
}
for (const [nombre, detalles] of [
  ['con nueva cotización', { nuevaCotizacion: { ...COTIZACION, total: '240.00', partidas: [partida('QA Doble', '120.00')] } }],
  ['sin nueva cotización', null]
] as [string, unknown][]) {
  const { venta, control } = entorno();
  control.catalogo = [NUEVO];
  control.cotizacion = { ...COTIZACION, total: '240.00', partidas: [partida('QA Doble', '120.00')] };
  control.fallaVenta = { status: 409, error: { codigo: 'COTIZACION_DESACTUALIZADA', detalles } };
  venta.confirmarVenta();
  const [linea] = venta.carrito();
  caso(`COTIZACION_DESACTUALIZADA ${nombre}: recarga catálogo y actualiza la línea`,
    control.recargas >= 1 && venta.platillos()[0]?.precio === '120.00' && linea.platillo.precio === '120.00'
    && linea.platillo.nombre === 'QA Doble' && linea.cantidad === 2 && venta.cotizacion()?.total === '240.00');
}
{
  const { venta, control } = entorno();
  control.catalogo = [NUEVO];
  control.cotizacion = { ...COTIZACION, partidas: [partida('QA Doble', '120.00')] };
  venta.recalcularCotizacion();
  caso('una recotización con valores nuevos recarga el catálogo una vez',
    control.recargas === 1 && venta.carrito()[0].platillo.precio === '120.00');
  venta.recalcularCotizacion();
  caso('con los valores ya vigentes no vuelve a recargar', control.recargas === 1);
}

console.log(`\nTotal: ${total - fallos}/${total} PASS`);
process.exit(fallos > 0 ? 1 : 0);
