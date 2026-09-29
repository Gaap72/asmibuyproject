/**
 * Formulario Web Adaptable de Promociones (Integrante 3)
 * Angular Component con validación dinámica, selector de platillo y fechas en UTC.
 */

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { PromocionesApiService } from '../../datos/promociones-api.service';
import {
  PromocionDTO,
  CrearPromocionDTO,
  ActualizarPromocionDTO,
  TipoPromocion,
  DuracionPromocion,
  PlatilloCatalogoRefDTO
} from '../../../backend/src/dominio/tipos';

@Component({
  selector: 'app-formulario-promocion',
  templateUrl: './formulario-promocion.component.html',
  styleUrls: ['./formulario-promocion.component.css']
})
export class FormularioPromocionComponent implements OnInit {
  @Input() promocion: PromocionDTO | null = null;
  @Output() alCerrar = new EventEmitter<boolean>();

  esEdicion: boolean = false;
  guardando: boolean = false;
  errorMensaje: string | null = null;

  // Modelo de Formulario
  nombre: string = '';
  platilloId: number | null = null;
  tipo: TipoPromocion = 'PORCENTAJE';
  porcentaje: string = '15.00';
  n: number = 2;
  m: number = 1;
  duracion: DuracionPromocion = 'PERMANENTE';
  fechaInicio: string = '';
  fechaFin: string = '';

  // Lista simulada / consumida de platillos activos del catálogo
  platillosDisponibles: PlatilloCatalogoRefDTO[] = [
    { id: 1, nombre: 'Hamburguesa Clásica', precio: '120.00', activo: true },
    { id: 2, nombre: 'Tacos al Pastor (3 piezas)', precio: '95.00', activo: true },
    { id: 3, nombre: 'Refresco de Cola 600ml', precio: '25.00', activo: true },
    { id: 4, nombre: 'Papas a la Francesa', precio: '45.00', activo: true }
  ];

  constructor(private readonly apiService: PromocionesApiService) {}

  ngOnInit(): void {
    if (this.promocion) {
      this.esEdicion = true;
      this.nombre = this.promocion.nombre;
      this.platilloId = this.promocion.platilloId;
      this.tipo = this.promocion.tipo;
      this.porcentaje = this.promocion.porcentaje || '15.00';
      this.n = this.promocion.n || 2;
      this.m = this.promocion.m || 1;
      this.duracion = this.promocion.duracion;
      this.fechaInicio = this.promocion.fechaInicio ? this.aInputFechaLocal(this.promocion.fechaInicio) : '';
      this.fechaFin = this.promocion.fechaFin ? this.aInputFechaLocal(this.promocion.fechaFin) : '';
    } else {
      this.esEdicion = false;
      // Fechas por defecto para promoción TEMPORAL (hoy a mañana)
      const ahora = new Date();
      const manana = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);
      this.fechaInicio = this.aInputFechaLocal(ahora.toISOString());
      this.fechaFin = this.aInputFechaLocal(manana.toISOString());
    }
  }

  private aInputFechaLocal(isoStr: string): string {
    const d = new Date(isoStr);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  }

  cancelar(): void {
    this.alCerrar.emit(false);
  }

  guardar(): void {
    this.errorMensaje = null;

    if (!this.nombre || !this.nombre.trim()) {
      this.errorMensaje = 'El nombre de la promoción es obligatorio.';
      return;
    }
    if (!this.platilloId || this.platilloId <= 0) {
      this.errorMensaje = 'Debe seleccionar un platillo participante.';
      return;
    }

    if (this.tipo === 'PORCENTAJE') {
      const pct = Number(this.porcentaje);
      if (isNaN(pct) || pct <= 0 || pct > 100) {
        this.errorMensaje = 'El porcentaje debe ser mayor que 0.00 y menor o igual a 100.00.';
        return;
      }
    } else if (this.tipo === 'NXM') {
      if (!this.n || !this.m || this.n <= this.m || this.n < 1 || this.m < 1) {
        this.errorMensaje = 'En promoción NxM, N debe ser mayor que M (ejemplo: N=2, M=1 para 2x1).';
        return;
      }
    }

    let fechaInicioIso: string | undefined;
    let fechaFinIso: string | undefined;

    if (this.duracion === 'TEMPORAL') {
      if (!this.fechaInicio || !this.fechaFin) {
        this.errorMensaje = 'Las fechas de inicio y fin son obligatorias en duración TEMPORAL.';
        return;
      }
      const ini = new Date(this.fechaInicio);
      const fin = new Date(this.fechaFin);
      if (ini.getTime() >= fin.getTime()) {
        this.errorMensaje = 'La fecha de inicio debe ser estrictamente anterior a la fecha de fin.';
        return;
      }
      fechaInicioIso = ini.toISOString();
      fechaFinIso = fin.toISOString();
    }

    this.guardando = true;

    if (this.esEdicion && this.promocion) {
      const dtoUpdate: ActualizarPromocionDTO = {
        nombre: this.nombre.trim(),
        platilloId: this.platilloId,
        tipo: this.tipo,
        porcentaje: this.tipo === 'PORCENTAJE' ? this.porcentaje : undefined,
        n: this.tipo === 'NXM' ? this.n : undefined,
        m: this.tipo === 'NXM' ? this.m : undefined,
        duracion: this.duracion,
        fechaInicio: fechaInicioIso,
        fechaFin: fechaFinIso
      };

      this.apiService.actualizarPromocion(this.promocion.id, dtoUpdate).subscribe({
        next: () => {
          this.guardando = false;
          this.alCerrar.emit(true);
        },
        error: (err) => {
          this.errorMensaje = err?.error?.mensaje || 'Error al actualizar la promoción.';
          this.guardando = false;
        }
      });
    } else {
      const dtoCreate: CrearPromocionDTO = {
        nombre: this.nombre.trim(),
        platilloId: this.platilloId,
        tipo: this.tipo,
        porcentaje: this.tipo === 'PORCENTAJE' ? this.porcentaje : undefined,
        n: this.tipo === 'NXM' ? this.n : undefined,
        m: this.tipo === 'NXM' ? this.m : undefined,
        duracion: this.duracion,
        fechaInicio: fechaInicioIso,
        fechaFin: fechaFinIso
      };

      this.apiService.crearPromocion(dtoCreate).subscribe({
        next: () => {
          this.guardando = false;
          this.alCerrar.emit(true);
        },
        error: (err) => {
          this.errorMensaje = err?.error?.mensaje || 'Error al crear la promoción.';
          this.guardando = false;
        }
      });
    }
  }
}
