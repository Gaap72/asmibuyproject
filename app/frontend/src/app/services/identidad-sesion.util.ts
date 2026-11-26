export type ResultadoIdentidad = 'igual' | 'cambio' | 'sin-sesion' | 'nueva';

/**
 * Compara la cuenta que muestra la pestaña con la que autentica el servidor (QA-V-08).
 * La cookie de sesión se comparte entre pestañas, así que pueden dejar de coincidir.
 */
export function compararIdentidad(idEnMemoria: number | null, idServidor: number | null): ResultadoIdentidad {
  if (idServidor === null) return 'sin-sesion';
  if (idEnMemoria === null) return 'nueva';
  return idEnMemoria === idServidor ? 'igual' : 'cambio';
}
