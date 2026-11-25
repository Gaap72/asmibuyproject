import { PassThrough } from 'stream';
import { spawnSync } from 'child_process';
import path from 'path';
import crypto from 'crypto';
import { leerPassword, leerPasswordConfirmada, EntradaLegible } from './entrada-oculta';

let total = 0;
let fallos = 0;
function caso(nombre: string, ok: boolean): void {
  total++;
  if (!ok) fallos++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${nombre}`);
}

interface TTYSimulada extends PassThrough {
  isTTY: boolean;
  setRawMode: (modo: boolean) => void;
  llamadasRaw: boolean[];
}

function crearTTY(): TTYSimulada {
  const e = new PassThrough() as TTYSimulada;
  e.isTTY = true;
  e.llamadasRaw = [];
  e.setRawMode = (modo: boolean) => {
    e.llamadasRaw.push(modo);
  };
  return e;
}

function crearSalida(): { flujo: PassThrough; texto: () => string } {
  const flujo = new PassThrough();
  let acumulado = '';
  flujo.on('data', (d) => (acumulado += d.toString()));
  return { flujo, texto: () => acumulado };
}

const esperar = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function esperarSalida(texto: () => string, fragmento: string): Promise<void> {
  for (let i = 0; i < 100 && !texto().includes(fragmento); i++) await esperar(5);
}

function ejecutarUtilidad(args: string[]) {
  const env = { ...process.env };
  delete env.DATABASE_URL;
  return spawnSync(process.execPath, [path.join(__dirname, 'mantenimiento-cuentas.js'), ...args], {
    env,
    input: '',
    encoding: 'utf8',
    timeout: 30000
  });
}

async function main(): Promise<void> {
  console.log('=== DCU-02: contraseña oculta en mantenimiento-cuentas ===');

  // a) Sin TTY, LF
  const e1 = new PassThrough();
  const p1 = leerPassword('Contraseña: ', e1 as unknown as EntradaLegible, new PassThrough());
  e1.write('secreta123\n');
  caso('a) sin TTY lee la primera línea (LF)', (await p1) === 'secreta123');

  // b) Sin TTY, CRLF
  const e2 = new PassThrough();
  const p2 = leerPassword('Contraseña: ', e2 as unknown as EntradaLegible, new PassThrough());
  e2.write('secreta123\r\n');
  caso('b) sin TTY quita el retorno de carro (CRLF)', (await p2) === 'secreta123');

  // c) TTY simulada: abc, Retroceso, d, Enter
  const e3 = crearTTY();
  const s3 = crearSalida();
  const p3 = leerPassword('Contraseña: ', e3 as unknown as EntradaLegible, s3.flujo);
  await esperarSalida(s3.texto, 'Contraseña: ');
  e3.write('abc');
  e3.write('\x7f');
  e3.write('d');
  e3.write('\r');
  const r3 = await p3;
  const salida3 = s3.texto();
  caso('c) TTY: devuelve "abd" tras Retroceso', r3 === 'abd');
  caso('c) TTY: la salida contiene la pregunta', salida3.includes('Contraseña: '));
  caso('c) TTY: la salida no muestra lo escrito', !salida3.includes('abc') && !salida3.includes('abd'));
  caso(
    'c) TTY: setRawMode(true) y luego setRawMode(false)',
    e3.llamadasRaw.length === 2 && e3.llamadasRaw[0] === true && e3.llamadasRaw[1] === false
  );

  // d) Confirmación con dos líneas distintas
  const uno = 'clave-' + crypto.randomBytes(4).toString('hex');
  const dos = 'otra-' + crypto.randomBytes(4).toString('hex');
  const e4 = crearTTY();
  const s4 = crearSalida();
  const p4 = leerPasswordConfirmada(e4 as unknown as EntradaLegible, s4.flujo);
  await esperarSalida(s4.texto, 'Contraseña: ');
  e4.write(uno + '\r');
  await esperarSalida(s4.texto, 'Repite la contraseña: ');
  e4.write(dos + '\r');
  let mensaje = '';
  try {
    await p4;
  } catch (err) {
    mensaje = (err as Error).message;
  }
  caso('d) contraseñas distintas rechazan con «Las contraseñas no coinciden»', mensaje === 'Las contraseñas no coinciden');
  caso('d) el mensaje y la salida no contienen las contraseñas', !mensaje.includes(uno) && !mensaje.includes(dos) && !s4.texto().includes(uno) && !s4.texto().includes(dos));
  caso('d) setRawMode se restauró tras el error', e4.llamadasRaw[e4.llamadasRaw.length - 1] === false);

  // e) Forma antigua: sale con 1 antes de tocar la base de datos y no repite el valor
  const valor = 'v-' + crypto.randomBytes(6).toString('hex');
  const crearViejo = ejecutarUtilidad(['crear', 'N', 'n@asmibuy.invalid', valor, 'TRABAJADOR']);
  const salidaCrear = `${crearViejo.stdout}${crearViejo.stderr}`;
  caso('e) crear con contraseña como argumento termina con código 1', crearViejo.status === 1);
  caso('e) crear antiguo muestra «ya no se acepta como argumento»', salidaCrear.includes('ya no se acepta como argumento'));
  caso('e) crear antiguo no repite el valor', !salidaCrear.includes(valor));

  const passViejo = ejecutarUtilidad(['password', '1', valor]);
  const salidaPass = `${passViejo.stdout}${passViejo.stderr}`;
  caso('e) password con contraseña como argumento termina con código 1', passViejo.status === 1);
  caso('e) password antiguo muestra «ya no se acepta como argumento»', salidaPass.includes('ya no se acepta como argumento'));
  caso('e) password antiguo no repite el valor', !salidaPass.includes(valor));

  // f) Perfil inválido: error de perfil sin pedir contraseña
  const perfilMalo = ejecutarUtilidad(['crear', 'N', 'n@asmibuy.invalid', 'PERFIL_MALO']);
  const salidaPerfil = `${perfilMalo.stdout}${perfilMalo.stderr}`;
  caso('f) perfil inválido termina con código 1', perfilMalo.status === 1);
  caso('f) perfil inválido muestra el error de perfil', salidaPerfil.includes('El perfil debe ser exactamente'));
  caso('f) perfil inválido no pide contraseña', !salidaPerfil.includes('Contraseña:'));

  console.log(`\nRESULTADO DCU-02: ${total - fallos}/${total} EXITOSAS`);
  process.exit(fallos > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Error inesperado:', err);
  process.exit(1);
});
