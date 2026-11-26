import fs from 'fs';
import path from 'path';
import ts from 'typescript';

/**
 * QA-V-08, sin base de datos. a) a d) según el encargo; e) ejecuta AuthService y los componentes
 * reales con dobles de Angular y del navegador. No sustituye la comprobación visual.
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
const src = path.join(raiz, 'app', 'frontend', 'src', 'app');
const leer = (...partes: string[]) => fs.readFileSync(path.join(src, ...partes), 'utf8');
/** Cuerpo de un método de clase (sangría de dos espacios) */
const metodo = (fuente: string, nombre: string) =>
  new RegExp(`\\n  (?:private )?${nombre}\\([^\\n]*\\{\\r?\\n([\\s\\S]*?)\\r?\\n  \\}`).exec(fuente)?.[1] ?? '';
const enOrden = (cuerpo: string, antes: string, despues: string) => {
  const a = cuerpo.indexOf(antes);
  const d = cuerpo.indexOf(despues);
  return a >= 0 && d >= 0 && a < d;
};

// ---------------------------------------------------------------------------
// Carga del frontend con dobles
// ---------------------------------------------------------------------------
const rx = require('rxjs');
function signal<T>(inicial: T) {
  let valor = inicial;
  return Object.assign(() => valor, { set: (v: T) => { valor = v; } });
}
class HttpClient {}
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
  '@angular/common/http': { HttpClient },
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

const local = new Map<string, string>();
const sesion = new Map<string, string>();
const borradosLocal: string[] = [];
const almacen = (m: Map<string, string>, alBorrar: (k: string) => void) => ({
  getItem: (k: string) => m.get(k) ?? null,
  setItem: (k: string, v: string) => void m.set(k, v),
  removeItem: (k: string) => { alBorrar(k); m.delete(k); }
});
let recargas = 0;
const oyentes: Record<string, () => void> = {};
const documento = {
  cookie: '', visibilityState: 'visible',
  addEventListener: (e: string, f: () => void) => { oyentes[e] = f; }
};
const ventana = {
  location: { reload: () => { recargas++; } },
  addEventListener: (e: string, f: () => void) => { oyentes[e] = f; }
};
for (const [nombre, valor] of Object.entries({
  document: documento,
  window: ventana,
  localStorage: almacen(local, (k) => borradosLocal.push(k)),
  sessionStorage: almacen(sesion, () => undefined)
})) {
  Object.defineProperty(globalThis, nombre, { value: valor, configurable: true });
}

const { compararIdentidad } = cargar('services', 'identidad-sesion.util.ts');
const { AuthService } = cargar('services', 'auth.service.ts');
const { VentasApiService } = cargar('services', 'ventas.service.ts');
const { VentaComponent } = cargar('components', 'venta', 'venta.component.ts');
const { HistorialComponent } = cargar('components', 'historial', 'historial.component.ts');

console.log('a) compararIdentidad');
for (const [memoria, servidor, esperado] of [
  [null, null, 'sin-sesion'], [5, null, 'sin-sesion'], [null, 5, 'nueva'],
  [5, 5, 'igual'], [5, 7, 'cambio'], [7, 5, 'cambio']
] as [number | null, number | null, string][]) {
  caso(`${memoria}/${servidor} → ${esperado}`, compararIdentidad(memoria, servidor) === esperado);
}

const venta = leer('components', 'venta', 'venta.component.ts');
const historial = leer('components', 'historial', 'historial.component.ts');
const auth = leer('services', 'auth.service.ts');

console.log('b) confirmarVenta comprueba antes de guardar y de enviar (lectura de fuente)');
const confirmar = metodo(venta, 'confirmarVenta');
caso('comprobarIdentidad va antes de guardar la pendiente (localStorage.setItem)',
  enOrden(confirmar, 'comprobarIdentidad(', 'guardarVentaPendienteLocal(')
  && /localStorage\.setItem/.test(metodo(venta, 'guardarVentaPendienteLocal')) && !/localStorage\.setItem/.test(confirmar));
caso('comprobarIdentidad va antes de ventasService.confirmarVenta',
  enOrden(confirmar, 'comprobarIdentidad(', 'enviarConfirmacion(')
  && /ventasService\.confirmarVenta/.test(metodo(venta, 'enviarConfirmacion')) && !/ventasService\./.test(confirmar));
caso('el bloqueo se activa antes de comprobar', enOrden(confirmar, 'confirmando.set(true)', 'comprobarIdentidad('));

console.log('c) La anulación comprueba antes de enviar (lectura de fuente)');
const anular = metodo(historial, 'procesarAnulacion');
caso('procesarAnulacion bloquea, comprueba y después envía',
  enOrden(anular, 'anulando.set(true)', 'comprobarIdentidad(') && enOrden(anular, 'comprobarIdentidad(', 'enviarAnulacion(')
  && !/anularVenta\(/.test(anular));
caso('anularVenta solo se llama desde enviarAnulacion',
  /ventasService\.anularVenta/.test(metodo(historial, 'enviarAnulacion')) && (historial.match(/\.anularVenta\(/g) ?? []).length === 1);

console.log('d) manejarCambioDeIdentidad no borra la venta pendiente (lectura de fuente)');
const manejar = metodo(auth, 'manejarCambioDeIdentidad');
caso('existe y no llama a localStorage.removeItem ni usa localStorage', manejar.length > 0 && !/localStorage/.test(manejar));

console.log('e) Comportamiento con dobles');
const PENDIENTE_A = 'asmibuy_venta_pendiente:5';
type Me = number | 401 | 0 | 500;
function entorno() {
  local.clear(); sesion.clear(); borradosLocal.length = 0; recargas = 0;
  const enviados: string[] = [];
  const navegaciones: any[] = [];
  const estado = { me: 5 as Me, consultas: 0, retener: null as any };
  const http = {
    get: (url: string) => {
      if (!url.endsWith('/auth/me')) return rx.EMPTY;
      estado.consultas++;
      if (estado.retener) return estado.retener;
      if (estado.me === 401 || estado.me === 0 || estado.me === 500) return rx.throwError(() => ({ status: estado.me }));
      return rx.of({ usuario: { id: estado.me, perfil: 'ADMINISTRADOR' } });
    }
  };
  proveedores.set(HttpClient, http);
  proveedores.set(Router, { url: '/venta', navigate: (...a: any[]) => navegaciones.push(a) });
  proveedores.set(DestroyRef, {});
  const servicio = new AuthService();
  proveedores.set(AuthService, servicio);
  proveedores.set(VentasApiService, {
    confirmarVenta: () => { enviados.push('confirmar'); return rx.EMPTY; },
    anularVenta: () => { enviados.push('anular'); return rx.EMPTY; },
    listarHistorial: () => rx.EMPTY
  });
  const v = new VentaComponent();
  v.carrito.set([{ platillo: { id: 1, nombre: 'QA', precio: '100.00' }, cantidad: 1 }]);
  v.cotizacion.set({ total: '100.00', partidas: [] });
  const h = new HistorialComponent();
  h.ordenAAnular.set({ id: 9 });
  h.motivoAnulacion = 'QA';
  return { servicio, v, h, estado, enviados, navegaciones };
}

for (const [nombre, me] of [['otra cuenta', 7], ['sesión terminada', 401]] as [string, Me][]) {
  const { v, h, estado, enviados, navegaciones } = entorno();
  local.set('asmibuy_venta_pendiente:7', 'de-otra-cuenta');
  estado.me = me;
  v.confirmarVenta();
  const redirige = navegaciones[0]?.[1]?.queryParams?.motivo === 'sesion-expirada';
  caso(`confirmar con ${nombre}: no guarda, no envía y libera el bloqueo`,
    !local.has(PENDIENTE_A) && enviados.length === 0 && !v.confirmando() && v.ventaPendienteClave() === null);
  caso(`confirmar con ${nombre}: ${me === 7 ? 'recarga con aviso' : 'va al login'}`,
    me === 7 ? recargas === 1 && sesion.size === 1 : recargas === 0 && redirige);
  caso(`${nombre}: no se borra nada de localStorage`, borradosLocal.length === 0 && local.get('asmibuy_venta_pendiente:7') === 'de-otra-cuenta');
  const otro = entorno();
  otro.estado.me = me;
  otro.h.procesarAnulacion();
  caso(`anular con ${nombre}: no envía y libera el bloqueo`, otro.enviados.length === 0 && !otro.h.anulando());
}
for (const [nombre, me] of [['otra cuenta', 7], ['sesión terminada', 401], ['la misma cuenta', 5]] as [string, Me][]) {
  const { v, estado, enviados } = entorno();
  const solicitud = JSON.stringify({ claveIdempotencia: 'previa', metodoPago: 'EFECTIVO', items: [], cotizacionAceptada: {} });
  local.set(PENDIENTE_A, solicitud);
  v.revisarVentaPendienteLocal();
  estado.me = me;
  v.reintentarVentaPendiente();
  caso(me === 5
    ? 'reintentar con la misma cuenta: reenvía la pendiente'
    : `reintentar con ${nombre}: no reenvía, conserva la pendiente y libera el envío`,
    me === 5
      ? enviados.join() === 'confirmar' && local.get(PENDIENTE_A) === solicitud
      : enviados.length === 0 && local.get(PENDIENTE_A) === solicitud && v.ventaPendienteClave() === 'previa'
        && !v.confirmando() && borradosLocal.length === 0);
}
for (const [nombre, me] of [['la misma cuenta', 5], ['error de red', 0], ['error 500', 500]] as [string, Me][]) {
  const { v, h, estado, enviados } = entorno();
  estado.me = me;
  v.confirmarVenta();
  h.procesarAnulacion();
  caso(`${nombre}: guarda la pendiente y envía venta y anulación`,
    local.has(PENDIENTE_A) && enviados.join() === 'confirmar,anular' && recargas === 0);
}
{
  const { v, h, estado, enviados } = entorno();
  const respuesta = new rx.Subject();
  estado.retener = respuesta;
  const antes = estado.consultas;
  v.confirmarVenta(); v.confirmarVenta();
  h.procesarAnulacion(); h.procesarAnulacion();
  caso('doble clic: una sola comprobación por operación y nada enviado todavía',
    estado.consultas - antes === 2 && enviados.length === 0);
  respuesta.next({ usuario: { id: 5 } });
  caso('doble clic: una sola venta y una sola anulación', enviados.join() === 'confirmar,anular');
}
{
  const { servicio, estado } = entorno();
  const antes = estado.consultas;
  estado.me = 7;
  oyentes['focus'](); oyentes['visibilitychange'](); oyentes['focus']();
  caso('al volver a la pestaña comprueba una sola vez en 3 s y recarga', estado.consultas - antes === 1 && recargas === 1);
  caso('el aviso se entrega una sola vez',
    /cambió a otra cuenta/.test(servicio.consumirAvisoCambioCuenta()) && servicio.consumirAvisoCambioCuenta() === '');
}
{
  const { servicio, estado } = entorno();
  servicio.usuarioActual.set(null);
  const antes = estado.consultas;
  oyentes['focus']();
  caso('sin usuario en memoria no consulta', estado.consultas === antes);
}

console.log(`\nTotal: ${total - fallos}/${total} PASS`);
process.exit(fallos > 0 ? 1 : 0);
