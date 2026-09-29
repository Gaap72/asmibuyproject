/**
 * Servicio de Aplicación de Descuentos y Promociones (Integrante 3)
 * Casos de uso de negocio y validación de reglas de dominio.
 */

import {
  InterfaceRepositorioPromociones
} from '../infraestructura/repositorio-promociones';
import {
  PromocionEntidad,
  PromocionDTO,
  CrearPromocionDTO,
  ActualizarPromocionDTO,
  ItemOrdenEntradaDTO,
  PlatilloCatalogoRefDTO,
  EvaluacionPromocionesResultadoDTO,
  EstadoPromocion,
  ErrorPromocion
} from '../dominio/tipos';
import { evaluarOrdenCompleta } from '../dominio/calculo-promociones';

export class ServicioPromociones {
  constructor(private readonly repo: InterfaceRepositorioPromociones) {}

  /**
   * Convierte una entidad de base de datos a DTO público para API JSON.
   */
  private entidadADto(p: PromocionEntidad): PromocionDTO {
    return {
      id: p.id,
      nombre: p.nombre,
      platilloId: p.platillo_id,
      platilloNombre: p.platillo_nombre,
      tipo: p.tipo,
      porcentaje: p.porcentaje ? String(p.porcentaje) : null,
      n: p.n ?? null,
      m: p.m ?? null,
      duracion: p.duracion,
      fechaInicio: p.fecha_inicio ? new Date(p.fecha_inicio).toISOString() : null,
      fechaFin: p.fecha_fin ? new Date(p.fecha_fin).toISOString() : null,
      estado: p.estado,
      creadoPor: p.creado_por,
      creadoEn: new Date(p.creado_en).toISOString(),
      actualizadoEn: new Date(p.actualizado_en).toISOString()
    };
  }

  /**
   * Valida los parámetros de porcentaje o NxM y las fechas de vigencia.
   */
  private meValidarParametrosYFechas(
    tipo: 'PORCENTAJE' | 'NXM',
    porcentajeStr?: string,
    n?: number,
    m?: number,
    duracion?: 'TEMPORAL' | 'PERMANENTE',
    fechaInicioStr?: string,
    fechaFinStr?: string
  ): void {
    if (tipo === 'PORCENTAJE') {
      if (!porcentajeStr) {
        throw new ErrorPromocion('PARAMETROS_PROMOCION_INVALIDOS', 'El porcentaje es obligatorio para el tipo PORCENTAJE.', 400);
      }
      const pct = Number(porcentajeStr);
      if (isNaN(pct) || pct <= 0 || pct > 100) {
        throw new ErrorPromocion('PARAMETROS_PROMOCION_INVALIDOS', 'El porcentaje debe ser mayor que 0.00 y menor o igual a 100.00.', 400);
      }
    } else if (tipo === 'NXM') {
      if (!n || !m) {
        throw new ErrorPromocion('PARAMETROS_PROMOCION_INVALIDOS', 'Los enteros N y M son obligatorios para el tipo NXM.', 400);
      }
      if (!Number.isInteger(n) || !Number.isInteger(m) || n < 1 || m < 1) {
        throw new ErrorPromocion('PARAMETROS_PROMOCION_INVALIDOS', 'N y M deben ser enteros positivos.', 400);
      }
      if (n <= m) {
        throw new ErrorPromocion('PARAMETROS_PROMOCION_INVALIDOS', 'El valor N debe ser estrictamente mayor que M (ej. N=2, M=1 para 2x1).', 400);
      }
    }

    if (duracion === 'TEMPORAL') {
      if (!fechaInicioStr || !fechaFinStr) {
        throw new ErrorPromocion('RANGO_FECHAS_INVALIDO', 'Las fechas de inicio y fin son obligatorias para la duración TEMPORAL.', 400);
      }
      const ini = new Date(fechaInicioStr).getTime();
      const fin = new Date(fechaFinStr).getTime();
      if (isNaN(ini) || isNaN(fin) || ini >= fin) {
        throw new ErrorPromocion('RANGO_FECHAS_INVALIDO', 'La fecha de inicio debe ser estrictamente anterior a la fecha de fin.', 400);
      }
    }
  }

  async crearPromocion(dto: CrearPromocionDTO, creadoPor: number): Promise<PromocionDTO> {
    if (!dto.nombre || !dto.nombre.trim()) {
      throw new ErrorPromocion('NOMBRE_REQUERIDO', 'El nombre de la promoción es obligatorio.', 400);
    }
    if (!dto.platilloId || dto.platilloId <= 0) {
      throw new ErrorPromocion('PLATILLO_REQUERIDO', 'Debe seleccionar un platillo válido.', 400);
    }

    this.meValidarParametrosYFechas(
      dto.tipo,
      dto.porcentaje,
      dto.n,
      dto.m,
      dto.duracion,
      dto.fechaInicio,
      dto.fechaFin
    );

    const nueva = await this.repo.crear({
      nombre: dto.nombre.trim(),
      platillo_id: dto.platilloId,
      tipo: dto.tipo,
      porcentaje: dto.tipo === 'PORCENTAJE' ? dto.porcentaje : null,
      n: dto.tipo === 'NXM' ? dto.n : null,
      m: dto.tipo === 'NXM' ? dto.m : null,
      duracion: dto.duracion,
      fecha_inicio: dto.duracion === 'TEMPORAL' && dto.fechaInicio ? new Date(dto.fechaInicio) : null,
      fecha_fin: dto.duracion === 'TEMPORAL' && dto.fechaFin ? new Date(dto.fechaFin) : null,
      estado: 'ACTIVA',
      creado_por: creadoPor
    });

    return this.entidadADto(nueva);
  }

  async actualizarPromocion(id: number, dto: ActualizarPromocionDTO): Promise<PromocionDTO> {
    const actual = await this.repo.obtenerPorId(id);
    if (!actual) {
      throw new ErrorPromocion('PROMOCION_NO_ENCONTRADA', `La promoción #${id} no fue encontrada.`, 404);
    }
    if (actual.estado === 'RETIRADA') {
      throw new ErrorPromocion('PROMOCION_RETIRADA', 'No se puede editar una promoción que ha sido RETIRADA.', 400);
    }

    const tipoFinal = dto.tipo || actual.tipo;
    const duracionFinal = dto.duracion || actual.duracion;

    this.meValidarParametrosYFechas(
      tipoFinal,
      dto.porcentaje !== undefined ? dto.porcentaje : (actual.porcentaje ? String(actual.porcentaje) : undefined),
      dto.n !== undefined ? dto.n : (actual.n ?? undefined),
      dto.m !== undefined ? dto.m : (actual.m ?? undefined),
      duracionFinal,
      dto.fechaInicio !== undefined ? dto.fechaInicio : (actual.fecha_inicio ? new Date(actual.fecha_inicio).toISOString() : undefined),
      dto.fechaFin !== undefined ? dto.fechaFin : (actual.fecha_fin ? new Date(actual.fecha_fin).toISOString() : undefined)
    );

    const actualizada = await this.repo.actualizar(id, {
      nombre: dto.nombre ? dto.nombre.trim() : actual.nombre,
      platillo_id: dto.platilloId || actual.platillo_id,
      tipo: tipoFinal,
      porcentaje: tipoFinal === 'PORCENTAJE' ? (dto.porcentaje || actual.porcentaje) : null,
      n: tipoFinal === 'NXM' ? (dto.n ?? actual.n) : null,
      m: tipoFinal === 'NXM' ? (dto.m ?? actual.m) : null,
      duracion: duracionFinal,
      fecha_inicio: duracionFinal === 'TEMPORAL' ? (dto.fechaInicio ? new Date(dto.fechaInicio) : actual.fecha_inicio) : null,
      fecha_fin: duracionFinal === 'TEMPORAL' ? (dto.fechaFin ? new Date(dto.fechaFin) : actual.fecha_fin) : null
    });

    return this.entidadADto(actualizada);
  }

  async cambiarEstado(id: number, nuevoEstado: EstadoPromocion): Promise<PromocionDTO> {
    const actualizada = await this.repo.cambiarEstado(id, nuevoEstado);
    return this.entidadADto(actualizada);
  }

  async listarPromociones(): Promise<PromocionDTO[]> {
    const promociones = await this.repo.listar();
    return promociones.map(p => this.entidadADto(p));
  }

  async obtenerPromocion(id: number): Promise<PromocionDTO> {
    const promo = await this.repo.obtenerPorId(id);
    if (!promo) {
      throw new ErrorPromocion('PROMOCION_NO_ENCONTRADA', `La promoción #${id} no existe.`, 404);
    }
    return this.entidadADto(promo);
  }

  async evaluarOrden(
    items: ItemOrdenEntradaDTO[],
    platillosCatalogo: Map<number, PlatilloCatalogoRefDTO>,
    ahora: Date = new Date()
  ): Promise<EvaluacionPromocionesResultadoDTO> {
    const elegibles = await this.repo.obtenerElegibles(ahora);
    return evaluarOrdenCompleta(items, platillosCatalogo, elegibles, ahora);
  }
}
