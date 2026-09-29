/**
 * Servicio de Integración de Promociones con el Módulo de Ventas (Integrante 3 e Integrante 4)
 * Garantiza la re-evaluación atómica durante la confirmación y previene cobros desactualizados.
 */

import { EvaluacionPromocionesResultadoDTO, ItemOrdenEntradaDTO, ErrorPromocion } from '../dominio/tipos';
import { ServicioPromociones } from './servicio-promociones';

export class IntegracionVentasPromociones {
  constructor(private readonly servicioPromociones: ServicioPromociones) {}

  /**
   * Re-evalúa una orden durante la confirmación dentro de la transacción PostgreSQL.
   * Si la promoción cotizada expiró, cambió de precio o fue desactivada/retirada,
   * se rechaza la confirmación lanzando `RESUMEN_DESACTUALIZADO`.
   */
  async validarConfirmacionVenta(
    itemsConfirmar: ItemOrdenEntradaDTO[],
    catalogoMap: Map<number, any>,
    promocionCotizadaId?: number | null,
    ahorroCotizadoStr?: string | null,
    ahora: Date = new Date()
  ): Promise<EvaluacionPromocionesResultadoDTO> {
    const reEvaluacion = await this.servicioPromociones.evaluarOrden(itemsConfirmar, catalogoMap, ahora);

    const promoActualId = reEvaluacion.promocionAplicadaOrden ? reEvaluacion.promocionAplicadaOrden.id : null;
    const ahorroActualStr = reEvaluacion.descuentoTotal;

    // Verificar consistencia entre cotización previa y confirmación actual
    if (promocionCotizadaId !== undefined && promocionCotizadaId !== null) {
      if (promoActualId !== promocionCotizadaId || ahorroActualStr !== ahorroCotizadoStr) {
        throw new ErrorPromocion(
          'RESUMEN_DESACTUALIZADO',
          'Las condiciones de precio o la vigencia de la promoción cambiaron antes de confirmar. Por favor revise el resumen actualizado.',
          409,
          {
            cotizado: { promocionId: promocionCotizadaId, ahorro: ahorroCotizadoStr },
            actual: { promocionId: promoActualId, ahorro: ahorroActualStr }
          }
        );
      }
    }

    return reEvaluacion;
  }
}
