import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import { construirDetalleConexion } from '../config/database';

let total = 0;
let fallos = 0;
function caso(nombre: string, ok: boolean): void {
  total++;
  if (!ok) fallos++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${nombre}`);
}

// Raíz del repo, tanto desde src/scripts como desde dist/scripts
const raiz = path.resolve(__dirname, '..', '..', '..', '..');
const interceptores = path.join(raiz, 'app', 'frontend', 'src', 'app', 'interceptors');

console.log('a) Texto del health (QA-L-03)');
const hora = '2026-11-25T00:00:00.000Z';
const local = construirDetalleConexion('postgresql://u:p@127.0.0.1:5432/db', hora);
caso('127.0.0.1 no menciona Supabase', !/supabase/i.test(local));
caso('127.0.0.1 indica (local) y conserva la hora', local.startsWith('Conectado a PostgreSQL (local).') && local.includes(hora));
const sb = construirDetalleConexion('postgresql://u:p@db.abc.supabase.co:5432/db', hora);
caso('host supabase.co indica (Supabase)', sb.includes('(Supabase)'));
caso('host supabase.com indica (Supabase)', construirDetalleConexion('postgresql://u:p@aws-0.pooler.supabase.com:6543/db', hora).includes('(Supabase)'));
caso('host que solo contiene "supabase" en otro dominio no cuenta', !construirDetalleConexion('postgresql://u:p@supabase.evil.example/db', hora).includes('(Supabase)'));
caso('el detalle no revela el host', !local.includes('127.0.0.1') && !sb.includes('abc'));

console.log('b) Decisión del interceptor (QA-L-02)');
const fuenteUtil = fs.readFileSync(path.join(interceptores, 'sesion-expirada.util.ts'), 'utf8');
const js = ts.transpileModule(fuenteUtil, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const modulo: { exports: { debeRedirigirPorSesion?: (u: string, s: number) => boolean } } = { exports: {} };
new Function('module', 'exports', js)(modulo, modulo.exports);
const debe = modulo.exports.debeRedirigirPorSesion!;
caso('401 en /api/v1/inventario/avisos redirige', debe('/api/v1/inventario/avisos', 401) === true);
caso('401 en URL absoluta con query redirige', debe('http://localhost:3000/api/v1/ventas?x=1', 401) === true);
caso('401 en /api/v1/auth/login no redirige', debe('/api/v1/auth/login', 401) === false);
caso('401 en /api/v1/auth/me no redirige', debe('/api/v1/auth/me', 401) === false);
caso('401 en /api/v1/auth/logout no redirige', debe('/api/v1/auth/logout', 401) === false);
caso('403 no redirige', debe('/api/v1/inventario/avisos', 403) === false);
caso('500 no redirige', debe('/api/v1/inventario/avisos', 500) === false);
caso('401 fuera de /api/v1/ no redirige', debe('/assets/x.json', 401) === false);

console.log('c) Venta pendiente intacta (QA-L-02)');
const interceptor = fs
  .readFileSync(path.join(interceptores, 'sesion-expirada.interceptor.ts'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*$/gm, ''); // solo código, sin comentarios
const auth = fs.readFileSync(path.join(raiz, 'app', 'frontend', 'src', 'app', 'services', 'auth.service.ts'), 'utf8');
const limpieza = /limpiarSesionLocal\(\): void \{([\s\S]*?)\n  \}/.exec(auth)?.[1] ?? '';
caso('limpiarSesionLocal existe y solo anula usuarioActual', /usuarioActual\.set\(null\)/.test(limpieza) && !/http|localStorage|sessionStorage/.test(limpieza));
caso('el interceptor no toca localStorage ni la clave pendiente', !/localStorage|sessionStorage|asmibuy_venta_pendiente/.test(interceptor));
caso('el interceptor no llama a logout() del servidor', !/\.logout\(/.test(interceptor));
caso('el interceptor relanza el error', /throwError\(\(\) => err\)/.test(interceptor));

console.log(`\nTotal: ${total - fallos}/${total} PASS`);
process.exit(fallos > 0 ? 1 : 0);
