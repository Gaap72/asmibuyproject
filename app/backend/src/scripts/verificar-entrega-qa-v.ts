import fs from 'fs';
import path from 'path';
import ts from 'typescript';

/**
 * QA-V-03 y QA-V-05, sin base de datos. Los servicios y VentaComponent se transpilan desde el
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
cargar('app', 'services', 'inventario.service.ts');
const { VentaComponent } = cargar('app', 'components', 'venta', 'venta.component.ts');

// ---------------------------------------------------------------------------
// Entorno: servicios y componente reales sobre un HttpClient falso
// ---------------------------------------------------------------------------
const COTIZACION = { subtotalBruto: '200.00', descuentoTotal: '0.00', total: '200.00', partidas: [] };
const CLAVE = 'asmibuy_venta_pendiente:7';
const MENSAJE = 'Tu sesión cambió en otra pestaña. Pulsa Confirmar de nuevo.';

interface Peticion { url: string; cuerpo: any; token: string }
type Falla = { status: number; error?: { codigo: string; mensaje?: string } } | null;

function entorno() {
  almacen.clear();
  documento.cookie = 'asmibuy_csrf=viejo';
  const peticiones: Peticion[] = [];
  const control: { fallaVenta: Falla; alConfirmar: () => void } = { fallaVenta: null, alConfirmar: () => undefined };

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
      if (url.endsWith('/cotizar')) return rx.of(COTIZACION);
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

console.log('b) y c) Avisos y formularios de Gestión (QA-V-06, QA-V-07)');
console.log('  OMITIDO bloqueado por PR #7/#8: no cuenta en el total');

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

console.log(`\nTotal: ${total - fallos}/${total} PASS`);
process.exit(fallos > 0 ? 1 : 0);
