/**
 * Decisión pura (sin Angular) para el interceptor de sesión expirada (QA-L-02).
 * Solo un 401 de la API que no pertenezca al flujo de autenticación implica sesión terminada.
 */
const RUTAS_AUTH_EXENTAS = ['/api/v1/auth/login', '/api/v1/auth/me', '/api/v1/auth/logout'];

export function debeRedirigirPorSesion(url: string, status: number): boolean {
  if (status !== 401) return false;
  const ruta = url.split('?')[0].split('#')[0];
  const indice = ruta.indexOf('/api/v1/');
  if (indice < 0) return false;
  const rutaApi = ruta.substring(indice);
  return !RUTAS_AUTH_EXENTAS.includes(rutaApi);
}
