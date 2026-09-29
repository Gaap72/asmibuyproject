/**
 * Servicio de Acceso a API REST de Promociones (Integrante 3)
 * TypeScript / Angular HTTP Client
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PromocionDTO,
  CrearPromocionDTO,
  ActualizarPromocionDTO,
  EstadoPromocion,
  EvaluacionPromocionesResultadoDTO,
  ItemOrdenEntradaDTO
} from '../../../backend/src/dominio/tipos';

@Injectable({
  providedIn: 'root'
})
export class PromocionesApiService {
  private readonly baseUrl = '/api/v1/promociones';

  constructor(private http: HttpClient) {}

  listarPromociones(): Observable<PromocionDTO[]> {
    return this.http.get<PromocionDTO[]>(this.baseUrl);
  }

  obtenerPromocion(id: number): Observable<PromocionDTO> {
    return this.http.get<PromocionDTO>(`${this.baseUrl}/${id}`);
  }

  crearPromocion(dto: CrearPromocionDTO): Observable<PromocionDTO> {
    return this.http.post<PromocionDTO>(this.baseUrl, dto);
  }

  actualizarPromocion(id: number, dto: ActualizarPromocionDTO): Observable<PromocionDTO> {
    return this.http.put<PromocionDTO>(`${this.baseUrl}/${id}`, dto);
  }

  cambiarEstado(id: number, estado: EstadoPromocion): Observable<PromocionDTO> {
    return this.http.patch<PromocionDTO>(`${this.baseUrl}/${id}/estado`, { estado });
  }

  evaluarPromociones(items: ItemOrdenEntradaDTO[]): Observable<EvaluacionPromocionesResultadoDTO> {
    return this.http.post<EvaluacionPromocionesResultadoDTO>(`${this.baseUrl}/evaluar`, { items });
  }
}
