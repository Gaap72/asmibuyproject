/**
 * Componente Angular de Lista de Promociones (Integrante 3)
 * Estética Cupertino, responsive 360px a PC, accesible y basada en DTOs del servidor.
 */

import { Component, OnInit } from '@angular/core';
import { PromocionesApiService } from '../../datos/promociones-api.service';
import { PromocionDTO, EstadoPromocion } from '../../../backend/src/dominio/tipos';

@Component({
  selector: 'app-lista-promociones',
  templateUrl: './lista-promociones.component.html',
  styleUrls: ['./lista-promociones.component.css']
})
export class ListaPromocionesComponent implements OnInit {
  promociones: PromocionDTO[] = [];
  cargando: boolean = false;
  errorMensaje: string | null = null;
  filtroEstado: string = 'TODAS';
  mostrarFormulario: boolean = false;
  promocionSeleccionada: PromocionDTO | null = null;

  constructor(private readonly apiService: PromocionesApiService) {}

  ngOnInit(): void {
    this.cargarPromociones();
  }

  cargarPromociones(): void {
    this.cargando = true;
    this.errorMensaje = null;
    this.apiService.listarPromociones().subscribe({
      next: (datos) => {
        this.promociones = datos;
        this.cargando = false;
      },
      error: (err) => {
        this.errorMensaje = err?.error?.mensaje || 'No se pudieron cargar las promociones del servidor.';
        this.cargando = false;
      }
    });
  }

  get promocionesFiltradas(): PromocionDTO[] {
    if (this.filtroEstado === 'TODAS') {
      return this.promociones;
    }
    return this.promociones.filter(p => p.estado === this.filtroEstado);
  }

  abrirCrear(): void {
    this.promocionSeleccionada = null;
    this.mostrarFormulario = true;
  }

  abrirEditar(promo: PromocionDTO): void {
    if (promo.estado === 'RETIRADA') return;
    this.promocionSeleccionada = promo;
    this.mostrarFormulario = true;
  }

  cerrarFormulario(actualizar: boolean): void {
    this.mostrarFormulario = false;
    this.promocionSeleccionada = null;
    if (actualizar) {
      this.cargarPromociones();
    }
  }

  cambiarEstado(promo: PromocionDTO, nuevoEstado: EstadoPromocion): void {
    if (promo.estado === 'RETIRADA') return;
    
    if (nuevoEstado === 'RETIRADA') {
      const confirma = confirm(`¿Está seguro de retirar definitivamente la promoción "${promo.nombre}"? Esta acción no se puede deshacer.`);
      if (!confirma) return;
    }

    this.apiService.cambiarEstado(promo.id, nuevoEstado).subscribe({
      next: () => this.cargarPromociones(),
      error: (err) => alert(err?.error?.mensaje || 'Error al cambiar estado de la promoción.')
    });
  }

  obtenerTextoVigencia(p: PromocionDTO): string {
    if (p.duracion === 'PERMANENTE') {
      return 'Permanente (Sin vencimiento)';
    }
    if (p.fechaInicio && p.fechaFin) {
      const ini = new Date(p.fechaInicio).toLocaleString();
      const fin = new Date(p.fechaFin).toLocaleString();
      return `${ini} - ${fin}`;
    }
    return 'Temporal';
  }

  obtenerTextoDetalleRegla(p: PromocionDTO): string {
    if (p.tipo === 'PORCENTAJE') {
      return `Descuento: ${p.porcentaje}%`;
    }
    return `Promoción ${p.n}x${p.m} (Mismo platillo)`;
  }
}
