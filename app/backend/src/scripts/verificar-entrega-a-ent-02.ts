import express from 'express';
import http from 'http';
import { AddressInfo } from 'net';
import { LoginRateLimiter } from '../services/login-rate-limiter';

let total = 0;
let fallos = 0;
function caso(nombre: string, ok: boolean): void {
  total++;
  if (!ok) fallos++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${nombre}`);
}

function fallar(ip: string, correo: string, veces: number): void {
  for (let i = 0; i < veces; i++) LoginRateLimiter.registrarFallo(ip, correo);
}

function pedirIp(puerto: number, cabeceras: Record<string, string>): Promise<string> {
  return new Promise((resolver, rechazar) => {
    http.get({ host: '127.0.0.1', port: puerto, path: '/ip', headers: cabeceras }, (res) => {
      let cuerpo = '';
      res.on('data', (d) => (cuerpo += d));
      res.on('end', () => resolver(cuerpo));
    }).on('error', rechazar);
  });
}

async function ipDeApp(trustProxy: number | undefined): Promise<string> {
  const app = express();
  if (trustProxy !== undefined) app.set('trust proxy', trustProxy);
  app.get('/ip', (req, res) => { res.send(req.ip); });
  const servidor = http.createServer(app);
  await new Promise<void>((ok) => servidor.listen(0, '127.0.0.1', ok));
  try {
    const puerto = (servidor.address() as AddressInfo).port;
    return await pedirIp(puerto, { 'X-Forwarded-For': '203.0.113.7' });
  } finally {
    await new Promise<void>((ok) => servidor.close(() => ok()));
  }
}

async function main(): Promise<void> {
  console.log('=== A-ENT-02: límite de intentos de login y trust proxy ===');

  LoginRateLimiter.resetear();
  fallar('10.0.0.1', 'a@x.com', 5);
  const a = LoginRateLimiter.verificarBloqueo('10.0.0.1', 'a@x.com');
  caso('a) 5 fallos del mismo correo desde la misma IP bloquean con espera > 0', a.bloqueado && a.reintentarEnSegundos > 0);

  LoginRateLimiter.resetear();
  fallar('10.0.0.1', 'usuarioA@x.com', 5);
  const b = LoginRateLimiter.verificarBloqueo('10.0.0.1', 'usuarioB@x.com');
  caso('b) otro usuario desde la misma IP no queda bloqueado', !b.bloqueado);

  LoginRateLimiter.resetear();
  for (let i = 0; i < 19; i++) LoginRateLimiter.registrarFallo('10.0.0.1', `u${i}@x.com`);
  const c19 = LoginRateLimiter.verificarBloqueo('10.0.0.1', 'nuevo@x.com');
  caso('c) 19 fallos con correos distintos no bloquean la IP', !c19.bloqueado);
  LoginRateLimiter.registrarFallo('10.0.0.1', 'u19@x.com');
  const c20 = LoginRateLimiter.verificarBloqueo('10.0.0.1', 'nuevo@x.com');
  caso('c) al llegar a 20 fallos la IP queda bloqueada', c20.bloqueado && c20.reintentarEnSegundos > 0);

  LoginRateLimiter.resetear();
  fallar('10.0.0.1', 'a@x.com', 5);
  const d = LoginRateLimiter.verificarBloqueo('10.0.0.2', 'otro@x.com');
  caso('d) otra IP no queda bloqueada', !d.bloqueado);

  LoginRateLimiter.resetear();
  fallar('10.0.0.1', 'a@x.com', 3);
  LoginRateLimiter.limpiarExito('10.0.0.1', 'a@x.com');
  const e = LoginRateLimiter.verificarBloqueo('10.0.0.1', 'a@x.com');
  caso('e) limpiarExito reinicia el contador del correo', !e.bloqueado && e.intentosRestantes === LoginRateLimiter.MAX_INTENTOS_SIN_BLOQUEO);

  const conProxy = await ipDeApp(1);
  caso(`f) con trust proxy = 1, req.ip toma X-Forwarded-For (${conProxy})`, conProxy === '203.0.113.7');
  const sinProxy = await ipDeApp(undefined);
  caso(`f) sin trust proxy, req.ip ignora X-Forwarded-For (${sinProxy})`, sinProxy !== '203.0.113.7');

  LoginRateLimiter.resetear();
  console.log(`\nRESULTADO A-ENT-02: ${total - fallos}/${total} EXITOSAS`);
  process.exit(fallos > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Error inesperado:', err);
  process.exit(1);
});
