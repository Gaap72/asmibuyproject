process.env.NODE_ENV = 'test';
delete process.env.DATABASE_URL;
delete process.env.TEST_DATABASE_URL;

import path from 'path';
import { spawnSync } from 'child_process';
import { AuthService } from '../services/auth.service';

const MSG = 'La contraseña debe tener al menos 6 caracteres.';
let total = 0;
let fallos = 0;
function caso(nombre: string, ok: boolean): void {
  total++;
  if (!ok) fallos++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${nombre}`);
}

async function mensajeDeRechazo(fn: () => Promise<unknown>): Promise<string | null> {
  try {
    await fn();
    return null;
  } catch (e: any) {
    return e.message;
  }
}

async function main(): Promise<void> {
  console.log('QA-L-04 · longitud mínima al crear cuentas (sin base de datos)');
  caso('a) crear con 3 caracteres rechaza con el mensaje', (await mensajeDeRechazo(() => AuthService.crearCuentaNominal('N', 'a@asmibuy.invalid', 'abc', 'TRABAJADOR'))) === MSG);
  caso('b) crear con 6 espacios rechaza', (await mensajeDeRechazo(() => AuthService.crearCuentaNominal('N', 'b@asmibuy.invalid', '      ', 'TRABAJADOR'))) === MSG);
  const ok = await AuthService.crearCuentaNominal('N', 'c@asmibuy.invalid', 'abcdef', 'TRABAJADOR');
  caso('c) crear con 6 caracteres crea la cuenta en memoria', ok.correo === 'c@asmibuy.invalid' && ok.activo === true);
  caso('d) restablecerPassword con 3 caracteres sigue rechazando igual', (await mensajeDeRechazo(() => AuthService.restablecerPassword(ok.id, 'abc'))) === MSG);

  const env = { ...process.env, NODE_ENV: 'test' } as NodeJS.ProcessEnv;
  delete env.DATABASE_URL;
  delete env.TEST_DATABASE_URL;
  const r = spawnSync(process.execPath, [path.join(__dirname, 'mantenimiento-cuentas.js'), 'crear', 'N', 'n@asmibuy.invalid', 'TRABAJADOR'], {
    input: 'abc\n',
    env,
    encoding: 'utf8'
  });
  const salida = `${r.stdout}${r.stderr}`;
  caso('e) mantenimiento-cuentas crear con "abc": código 1', r.status === 1);
  caso('e) la salida contiene el mensaje de longitud', salida.includes(MSG));
  caso('e) la salida no contiene la contraseña', !/\babc\b/.test(salida));

  console.log(`\nTotal: ${total - fallos}/${total} PASS`);
  process.exit(fallos > 0 ? 1 : 0);
}
main();
