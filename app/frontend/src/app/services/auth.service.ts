import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map, timeout } from 'rxjs';
import { Router } from '@angular/router';
import { compararIdentidad, ResultadoIdentidad } from './identidad-sesion.util';

const CLAVE_AVISO_CAMBIO = 'asmibuy_aviso_cambio_cuenta';
const AVISO_CAMBIO = 'La sesión cambió a otra cuenta en otra pestaña. Se recargó para evitar operar con la cuenta equivocada.';

export interface UsuarioDTO {
  id: number;
  nombre: string;
  correo: string;
  perfil: 'ADMINISTRADOR' | 'TRABAJADOR';
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly baseUrl = '/api/v1/auth';

  // Reactividad moderna con Signals (Angular 21)
  usuarioActual = signal<UsuarioDTO | null>(null);
  csrfToken = signal<string>('');
  cargando = signal<boolean>(true);

  estaAutenticado = computed(() => !!this.usuarioActual());
  esAdmin = computed(() => this.usuarioActual()?.perfil === 'ADMINISTRADOR');
  esTrabajador = computed(() => this.usuarioActual()?.perfil === 'TRABAJADOR');

  constructor() {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/asmibuy_csrf=([^;]+)/);
      if (match) {
        this.csrfToken.set(match[1]);
      }
    }
    this.verificarSesionInicial();
    this.vigilarIdentidad();
  }

  private ultimaRevisionIdentidad = 0;

  /** Al volver a la pestaña se comprueba que la sesión siga siendo de la misma cuenta (QA-V-08) */
  private vigilarIdentidad(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const revisar = () => {
      if (document.visibilityState !== 'visible' || !this.usuarioActual()) return;
      const ahora = Date.now();
      if (ahora - this.ultimaRevisionIdentidad < 3000) return;
      this.ultimaRevisionIdentidad = ahora;
      this.comprobarIdentidad().subscribe((resultado) => this.manejarCambioDeIdentidad(resultado));
    };
    document.addEventListener('visibilitychange', revisar);
    window.addEventListener('focus', revisar);
  }

  /**
   * Pregunta al servidor qué cuenta autentica la cookie. Un fallo de red o del servidor no
   * cuenta como cambio: la operación sigue su camino normal.
   */
  comprobarIdentidad(): Observable<ResultadoIdentidad> {
    return this.http.get<{ usuario?: UsuarioDTO }>(`${this.baseUrl}/me`, { withCredentials: true }).pipe(
      timeout(5000),
      map((res) => res?.usuario?.id ?? null),
      // 401: no hay sesión. Cualquier otro fallo de la petición deja el id sin conocer
      catchError((err) => of(err?.status === 401 ? null : undefined)),
      map((idServidor) => idServidor === undefined
        ? 'igual'
        : compararIdentidad(this.usuarioActual()?.id ?? null, idServidor))
    );
  }

  /** No toca localStorage: la venta pendiente de cada cuenta se conserva */
  manejarCambioDeIdentidad(resultado: ResultadoIdentidad): void {
    if (resultado === 'cambio') {
      try {
        sessionStorage.setItem(CLAVE_AVISO_CAMBIO, AVISO_CAMBIO);
      } catch {
        // Sin almacenamiento se recarga igual, sin aviso
      }
      window.location.reload();
    } else if (resultado === 'sin-sesion' && !this.router.url.startsWith('/login')) {
      const volver = this.rutaInternaSegura(this.router.url);
      this.limpiarSesionLocal();
      this.router.navigate(['/login'], { queryParams: { volver, motivo: 'sesion-expirada' } });
    }
  }

  /** Devuelve el aviso de cambio de cuenta una sola vez */
  consumirAvisoCambioCuenta(): string {
    try {
      const aviso = sessionStorage.getItem(CLAVE_AVISO_CAMBIO) ?? '';
      sessionStorage.removeItem(CLAVE_AVISO_CAMBIO);
      return aviso;
    } catch {
      return '';
    }
  }

  /**
   * Al cargar la app, comprueba si existe una sesión activa en el servidor
   */
  verificarSesionInicial(): void {
    this.cargando.set(true);
    this.http.get<{ usuario: UsuarioDTO; csrfToken?: string }>(`${this.baseUrl}/me`, { withCredentials: true }).pipe(
      catchError(() => {
        this.usuarioActual.set(null);
        return of(null);
      })
    ).subscribe((res) => {
      if (res && res.usuario) {
        this.usuarioActual.set(res.usuario);
        if (res.csrfToken) {
          this.csrfToken.set(res.csrfToken);
        }
        // La redirección desde /login la resuelve guestGuard tras esperar esta verificación (H-03)
      } else {
        this.usuarioActual.set(null);
      }
      this.cargando.set(false);
    });
  }

  /**
   * Garantiza la disponibilidad de un token CSRF válido antes de mutaciones
   */
  asegurarCsrfToken(): Observable<string> {
    const actual = this.tokenCsrfVigente();
    if (actual) {
      return of(actual);
    }
    return this.http.get<{ csrfToken: string }>(`${this.baseUrl}/csrf`, { withCredentials: true }).pipe(
      tap((res) => {
        if (res?.csrfToken) {
          this.csrfToken.set(res.csrfToken);
        }
      }),
      map((res) => res?.csrfToken || ''),
      catchError(() => of(''))
    );
  }

  /**
   * La cookie manda: otra pestaña pudo renovarla (QA-V-03). El signal solo se usa si no hay cookie.
   */
  private tokenCsrfVigente(): string {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/asmibuy_csrf=([^;]+)/);
      if (match) {
        if (match[1] !== this.csrfToken()) {
          this.csrfToken.set(match[1]);
        }
        return match[1];
      }
    }
    return this.csrfToken();
  }

  /**
   * Inicia sesión con correo y contraseña
   */
  login(correo: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, { correo, password }, { withCredentials: true }).pipe(
      tap((res) => {
        if (res.exito && res.usuario) {
          this.usuarioActual.set(res.usuario);
          if (res.csrfToken) {
            this.csrfToken.set(res.csrfToken);
          }
          // Volver a la pantalla que se pidió antes del login (?volver=/historial), sólo si es interna (H-03)
          const volver = this.router.parseUrl(this.router.url).queryParamMap.get('volver');
          this.router.navigateByUrl(this.rutaInternaSegura(volver));
        }
      })
    );
  }

  private rutaInternaSegura(url: string | null): string {
    if (!url || !url.startsWith('/') || url.startsWith('//') || url.startsWith('/\\') || url.startsWith('/login')) {
      return '/venta';
    }
    return url;
  }

  /**
   * Limpia solo el estado en memoria (sesión terminada en el servidor, QA-L-02).
   * No llama al servidor ni toca localStorage (la venta pendiente se conserva).
   */
  limpiarSesionLocal(): void {
    this.usuarioActual.set(null);
  }

  /**
   * Cierra la sesión en el servidor y limpia el estado local
   */
  logout(): void {
    const token = this.tokenCsrfVigente();

    const headers: Record<string, string> = {};
    if (token) {
      headers['X-CSRF-Token'] = token;
    }

    this.http.post<{ exito: boolean; mensaje: string }>(`${this.baseUrl}/logout`, {}, {
      headers,
      withCredentials: true
    }).subscribe({
      next: (res) => {
        if (res && res.exito) {
          this.usuarioActual.set(null);
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        console.error('Error al revocar la sesión en el servidor:', err);
        alert('No se pudo revocar la sesión en el servidor: ' + (err.error?.mensaje || 'Error de seguridad / comunicación'));
      }
    });
  }
}
