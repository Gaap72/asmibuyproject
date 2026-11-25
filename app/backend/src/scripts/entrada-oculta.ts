/**
 * Lectura de contraseñas sin eco por terminal (DCU-02).
 * Solo usa módulos de Node. Con TTY no muestra nada mientras se escribe;
 * sin TTY (entrada redirigida) lee la primera línea de stdin.
 */
import { StringDecoder } from 'string_decoder';

export interface EntradaLegible extends NodeJS.ReadableStream {
  isTTY?: boolean;
  setRawMode?: (modo: boolean) => unknown;
}

function leerLineaSinTTY(entrada: EntradaLegible): Promise<string> {
  return new Promise((resolver, rechazar) => {
    const decoder = new StringDecoder('utf8');
    let acumulado = '';
    const limpiar = () => {
      entrada.removeListener('data', alDato);
      entrada.removeListener('end', alFin);
      entrada.removeListener('error', alError);
    };
    const alDato = (chunk: Buffer | string) => {
      acumulado += typeof chunk === 'string' ? chunk : decoder.write(chunk);
      const salto = acumulado.indexOf('\n');
      if (salto >= 0) {
        limpiar();
        entrada.pause();
        resolver(acumulado.slice(0, salto).replace(/\r/g, ''));
      }
    };
    const alFin = () => {
      limpiar();
      resolver(acumulado.replace(/[\r\n]/g, ''));
    };
    const alError = (err: Error) => {
      limpiar();
      rechazar(err);
    };
    entrada.on('data', alDato);
    entrada.on('end', alFin);
    entrada.on('error', alError);
    entrada.resume();
  });
}

function leerLineaTTY(pregunta: string, entrada: EntradaLegible, salida: NodeJS.WritableStream): Promise<string> {
  return new Promise((resolver, rechazar) => {
    const decoder = new StringDecoder('utf8');
    const caracteres: string[] = [];
    let modoRawActivo = false;

    const restaurar = () => {
      entrada.removeListener('data', alDato);
      entrada.removeListener('error', alError);
      try {
        if (modoRawActivo && typeof entrada.setRawMode === 'function') entrada.setRawMode(false);
      } finally {
        modoRawActivo = false;
        entrada.pause();
      }
    };

    const alError = (err: Error) => {
      try {
        restaurar();
      } finally {
        salida.write('\n');
      }
      rechazar(err);
    };

    const alDato = (chunk: Buffer | string) => {
      try {
        const texto = typeof chunk === 'string' ? chunk : decoder.write(chunk);
        for (let i = 0; i < texto.length; i++) {
          const c = texto[i];
          if (c === '\r' || c === '\n') {
            const resultado = caracteres.join('');
            restaurar();
            salida.write('\n');
            resolver(resultado);
            return;
          }
          if (c === '\x03') {
            restaurar();
            salida.write('\n');
            process.exit(130);
          }
          if (c === '\x7f' || c === '\b') {
            caracteres.pop();
            continue;
          }
          if (c === '\x1b') {
            // Secuencia de escape (flechas, etc.): se ignora hasta su letra final
            i++;
            if (texto[i] === '[' || texto[i] === 'O') {
              i++;
              while (i < texto.length && !/[A-Za-z~]/.test(texto[i])) i++;
            }
            continue;
          }
          if (c >= ' ') caracteres.push(c);
        }
      } catch (err) {
        alError(err as Error);
      }
    };

    try {
      salida.write(pregunta);
      if (typeof entrada.setRawMode === 'function') {
        entrada.setRawMode(true);
        modoRawActivo = true;
      }
      entrada.on('data', alDato);
      entrada.on('error', alError);
      entrada.resume();
    } catch (err) {
      alError(err as Error);
    }
  });
}

export async function leerPassword(
  pregunta: string,
  entrada: EntradaLegible = process.stdin,
  salida: NodeJS.WritableStream = process.stdout
): Promise<string> {
  if (entrada.isTTY) return leerLineaTTY(pregunta, entrada, salida);
  return leerLineaSinTTY(entrada);
}

export async function leerPasswordConfirmada(
  entrada: EntradaLegible = process.stdin,
  salida: NodeJS.WritableStream = process.stdout
): Promise<string> {
  if (!entrada.isTTY) return leerLineaSinTTY(entrada);
  const primera = await leerLineaTTY('Contraseña: ', entrada, salida);
  const segunda = await leerLineaTTY('Repite la contraseña: ', entrada, salida);
  if (primera !== segunda) throw new Error('Las contraseñas no coinciden');
  return primera;
}
