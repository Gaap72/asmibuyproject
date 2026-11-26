import { Injector, inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { rutaInternaSegura } from '../guards/auth.guard';
import { debeRedirigirPorSesion } from './sesion-expirada.util';

/**
 * Ante un 401 de la API (fuera de login/me/logout) la sesión terminó: se limpia el estado local
 * y se lleva al login conservando la ruta actual. No toca localStorage, por lo que la venta
 * pendiente (asmibuy_venta_pendiente:<usuarioId>) sobrevive. El error se relanza al componente.
 *
 * AuthService se obtiene solo dentro de catchError: su constructor hace la petición a /auth/me,
 * que pasa por este interceptor; pedirlo aquí arriba crea una dependencia circular (NG0200) y
 * al recargar cualquier pantalla la sesión parecía cerrada.
 */
export const sesionExpiradaInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);
  const router = inject(Router);
  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && debeRedirigirPorSesion(req.url, err.status)) {
        const rutaActual = router.url;
        if (!rutaActual.startsWith('/login')) {
          injector.get(AuthService).limpiarSesionLocal();
          router.navigate(['/login'], {
            queryParams: { volver: rutaInternaSegura(rutaActual), motivo: 'sesion-expirada' }
          });
        }
      }
      return throwError(() => err);
    })
  );
};
