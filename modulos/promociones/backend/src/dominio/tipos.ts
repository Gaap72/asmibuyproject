/**
 * Tipos y DTOs del Módulo de Descuentos y Promociones (Integrante 3)
 * Especificación v2.1 del MVP Web Móvil
 */

export type TipoPromocion = 'PORCENTAJE' | 'NXM';
export type DuracionPromocion = 'TEMPORAL' | 'PERMANENTE';
export type EstadoPromocion = 'ACTIVA' | 'INACTIVA' | 'RETIRADA';

export interface PromocionEntidad {
  id: number;
  nombre: string;
  platillo_id: number;
  platillo_nombre?: string;
  tipo: TipoPromocion;
  porcentaje?: string | null;
  n?: number | null;
  m?: number | null;
  duracion: DuracionPromocion;
  fecha_inicio?: Date | string | null;
  fecha_fin?: Date | string | null;
  estado: EstadoPromocion;
  creado_por: number;
  creado_en: Date | string;
  actualizado_en: Date | string;
}

export interface PromocionDTO {
  id: number;
  nombre: string;
  platilloId: number;
  platilloNombre?: string;
  tipo: TipoPromocion;
  porcentaje?: string | null;
  n?: number | null;
  m?: number | null;
  duracion: DuracionPromocion;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  estado: EstadoPromocion;
  creadoPor: number;
  creadoEn: string;
  actualizadoEn: string;
}

export interface CrearPromocionDTO {
  nombre: string;
  platilloId: number;
  tipo: TipoPromocion;
  porcentaje?: string;
  n?: number;
  m?: number;
  duracion: DuracionPromocion;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface ActualizarPromocionDTO {
  nombre?: string;
  platilloId?: number;
  tipo?: TipoPromocion;
  porcentaje?: string;
  n?: number;
  m?: number;
  duracion?: DuracionPromocion;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface ItemOrdenEntradaDTO {
  platilloId: number;
  cantidad: number;
  precioUnitario?: string;
}

export interface PlatilloCatalogoRefDTO {
  id: number;
  nombre: string;
  precio: string;
  activo: boolean;
}

export interface PromocionAplicadaCopiaDTO {
  id: number;
  nombre: string;
  tipo: TipoPromocion;
  parametros: {
    porcentaje?: string;
    n?: number;
    m?: number;
  };
  duracion: DuracionPromocion;
  ahorro: string;
}

export interface LineaEvaluadaDTO {
  platilloId: number;
  platilloNombre: string;
  precioUnitario: string;
  cantidadEntregada: number;
  cantidadCobradas: number;
  cantidadBonificadas: number;
  subtotalSinDescuento: string;
  ahorroLinea: string;
  subtotalConDescuento: string;
  promocionAplicada?: PromocionAplicadaCopiaDTO | null;
}

export interface EvaluacionPromocionesResultadoDTO {
  items: LineaEvaluadaDTO[];
  subtotalGeneral: string;
  descuentoTotal: string;
  totalOrden: string;
  promocionAplicadaOrden?: PromocionAplicadaCopiaDTO | null;
}

export class ErrorPromocion extends Error {
  constructor(
    public readonly codigo: string,
    message: string,
    public readonly statusHttp: number = 400,
    public readonly detalles?: any
  ) {
    super(message);
    this.name = 'ErrorPromocion';
  }
}
