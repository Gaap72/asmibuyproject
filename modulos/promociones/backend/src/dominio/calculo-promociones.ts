/**
 * Motor de Cálculo Exacto de Descuentos y Promociones (Integrante 3)
 * Operaciones monetarias exactas y reglas del servidor sin imprecisión flotante.
 */

import {
  PromocionEntidad,
  ItemOrdenEntradaDTO,
  PlatilloCatalogoRefDTO,
  LineaEvaluadaDTO,
  EvaluacionPromocionesResultadoDTO,
  PromocionAplicadaCopiaDTO
} from './tipos';

/**
 * Convierte un monto en cadena decimal a centavos enteros (multiplicado por 100).
 */
export function aCentavos(montoStr: string): number {
  const num = Number(montoStr);
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

/**
 * Convierte centavos enteros a una cadena decimal format "0.00".
 */
export function aStringMoneda(centavos: number): string {
  const abs = Math.abs(centavos);
  const entero = Math.floor(abs / 100);
  const frac = abs % 100;
  const signo = centavos < 0 ? '-' : '';
  return `${signo}${entero}.${frac.toString().padStart(2, '0')}`;
}

/**
 * Redondea un importe flotante/decimal a 2 decimales con regla mitad hacia arriba (HALF_UP).
 */
export function redondearMitadArriba(valor: number): string {
  const signo = valor < 0 ? -1 : 1;
  const abs = Math.abs(valor);
  const centavos = Math.floor(abs * 100 + 0.5);
  return aStringMoneda(signo * centavos);
}

/**
 * Determina si una regla de promoción está vigente y activa en una fecha/hora dada (UTC).
 */
export function esPromocionElegible(promocion: PromocionEntidad, ahora: Date = new Date()): boolean {
  if (promocion.estado !== 'ACTIVA') {
    return false;
  }

  if (promocion.duracion === 'TEMPORAL') {
    if (!promocion.fecha_inicio || !promocion.fecha_fin) {
      return false;
    }
    const inicio = new Date(promocion.fecha_inicio).getTime();
    const fin = new Date(promocion.fecha_fin).getTime();
    const tiempo = ahora.getTime();

    // Inicio inclusivo, fin exclusivo: fecha_inicio <= ahora < fecha_fin
    if (tiempo < inicio || tiempo >= fin) {
      return false;
    }
  }

  return true;
}

/**
 * Evalúa el efecto de una promoción específica sobre una línea de pedido dada.
 */
export function evaluarPromocionLinea(
  cantidadEntregada: number,
  precioUnitarioStr: string,
  platilloNombre: string,
  platilloId: number,
  promocion?: PromocionEntidad | null
): LineaEvaluadaDTO {
  const precioCentavos = aCentavos(precioUnitarioStr);
  const subtotalSinDescuentoCentavos = cantidadEntregada * precioCentavos;
  const subtotalSinDescuentoStr = aStringMoneda(subtotalSinDescuentoCentavos);

  if (!promocion) {
    return {
      platilloId,
      platilloNombre,
      precioUnitario: aStringMoneda(precioCentavos),
      cantidadEntregada,
      cantidadCobradas: cantidadEntregada,
      cantidadBonificadas: 0,
      subtotalSinDescuento: subtotalSinDescuentoStr,
      ahorroLinea: '0.00',
      subtotalConDescuento: subtotalSinDescuentoStr,
      promocionAplicada: null
    };
  }

  let ahorroCentavos = 0;
  let cantidadCobradas = cantidadEntregada;
  let cantidadBonificadas = 0;

  if (promocion.tipo === 'PORCENTAJE') {
    const pctNum = Number(promocion.porcentaje || '0');
    // ahorroBruto = subtotalSinDescuento * (pct / 100)
    const ahorroCalculado = (subtotalSinDescuentoCentavos * pctNum) / 100;
    // Redondeo Half-Up a centavos
    ahorroCentavos = Math.floor(ahorroCalculado + 0.5);
    cantidadCobradas = cantidadEntregada;
    cantidadBonificadas = 0;
  } else if (promocion.tipo === 'NXM') {
    const n = promocion.n || 1;
    const m = promocion.m || 1;

    if (n > m && n >= 1 && m >= 1) {
      const gruposCompletos = Math.floor(cantidadEntregada / n);
      const unidadesSobrantes = cantidadEntregada % n;

      cantidadCobradas = gruposCompletos * m + unidadesSobrantes;
      cantidadBonificadas = cantidadEntregada - cantidadCobradas;

      ahorroCentavos = cantidadBonificadas * precioCentavos;
    }
  }

  // Garantizar ahorro no negativo y no superior al subtotal
  ahorroCentavos = Math.max(0, Math.min(subtotalSinDescuentoCentavos, ahorroCentavos));
  const subtotalConDescuentoCentavos = subtotalSinDescuentoCentavos - ahorroCentavos;
  const ahorroLineaStr = aStringMoneda(ahorroCentavos);

  const copiaPromocion: PromocionAplicadaCopiaDTO = {
    id: promocion.id,
    nombre: promocion.nombre,
    tipo: promocion.tipo,
    parametros: {
      porcentaje: promocion.porcentaje || undefined,
      n: promocion.n || undefined,
      m: promocion.m || undefined
    },
    duracion: promocion.duracion,
    ahorro: ahorroLineaStr
  };

  return {
    platilloId,
    platilloNombre,
    precioUnitario: aStringMoneda(precioCentavos),
    cantidadEntregada,
    cantidadCobradas,
    cantidadBonificadas,
    subtotalSinDescuento: subtotalSinDescuentoStr,
    ahorroLinea: ahorroLineaStr,
    subtotalConDescuento: aStringMoneda(subtotalConDescuentoCentavos),
    promocionAplicada: copiaPromocion
  };
}

/**
 * Evalúa una orden completa seleccionando la ÚNICA promoción con mayor ahorro efectivo.
 * En caso de empate en el importe de ahorro, selecciona la promoción con menor ID.
 */
export function evaluarOrdenCompleta(
  itemsEntrada: ItemOrdenEntradaDTO[],
  platillosCatalogo: Map<number, PlatilloCatalogoRefDTO>,
  promocionesElegibles: PromocionEntidad[],
  ahora: Date = new Date()
): EvaluacionPromocionesResultadoDTO {
  // 1. Filtrar solo promociones activas y vigentes
  const vigentes = promocionesElegibles.filter(p => esPromocionElegible(p, ahora));

  // 2. Probar el impacto de cada promoción elegible sobre los items de la orden
  let mejorPromocion: PromocionEntidad | null = null;
  let maxAhorroCentavos = 0;

  for (const promo of vigentes) {
    // Buscar la línea que coincide con el platillo de la promoción
    const itemCoincidente = itemsEntrada.find(it => it.platilloId === promo.platillo_id);
    if (!itemCoincidente || itemCoincidente.cantidad <= 0) {
      continue;
    }

    const platilloRef = platillosCatalogo.get(promo.platillo_id);
    if (!platilloRef || !platilloRef.activo) {
      continue;
    }

    const evalLinea = evaluarPromocionLinea(
      itemCoincidente.cantidad,
      itemCoincidente.precioUnitario || platilloRef.precio,
      platilloRef.nombre,
      platilloRef.id,
      promo
    );

    const ahorroCentavos = aCentavos(evalLinea.ahorroLinea);

    if (ahorroCentavos > maxAhorroCentavos) {
      maxAhorroCentavos = ahorroCentavos;
      mejorPromocion = promo;
    } else if (ahorroCentavos > 0 && ahorroCentavos === maxAhorroCentavos) {
      // Desempate por menor ID
      if (mejorPromocion === null || promo.id < mejorPromocion.id) {
        mejorPromocion = promo;
      }
    }
  }

  // 3. Generar la evaluación final de cada línea aplicando ÚNICAMENTE la mejor promoción seleccionada
  const lineasEvaluadas: LineaEvaluadaDTO[] = [];
  let subtotalGeneralCentavos = 0;

  for (const item of itemsEntrada) {
    const platilloRef = platillosCatalogo.get(item.platilloId);
    const nombrePlatillo = platilloRef ? platilloRef.nombre : `Platillo #${item.platilloId}`;
    const precioPlatillo = item.precioUnitario || (platilloRef ? platilloRef.precio : '0.00');

    const promoParaEstaLinea = (mejorPromocion && mejorPromocion.platillo_id === item.platilloId)
      ? mejorPromocion
      : null;

    const lineaRes = evaluarPromocionLinea(
      item.cantidad,
      precioPlatillo,
      nombrePlatillo,
      item.platilloId,
      promoParaEstaLinea
    );

    subtotalGeneralCentavos += aCentavos(lineaRes.subtotalSinDescuento);
    lineasEvaluadas.push(lineaRes);
  }

  const descuentoTotalStr = aStringMoneda(maxAhorroCentavos);
  const subtotalGeneralStr = aStringMoneda(subtotalGeneralCentavos);
  const totalOrdenCentavos = Math.max(0, subtotalGeneralCentavos - maxAhorroCentavos);
  const totalOrdenStr = aStringMoneda(totalOrdenCentavos);

  const copiaPromoOrden: PromocionAplicadaCopiaDTO | null = mejorPromocion ? {
    id: mejorPromocion.id,
    nombre: mejorPromocion.nombre,
    tipo: mejorPromocion.tipo,
    parametros: {
      porcentaje: mejorPromocion.porcentaje || undefined,
      n: mejorPromocion.n || undefined,
      m: mejorPromocion.m || undefined
    },
    duracion: mejorPromocion.duracion,
    ahorro: descuentoTotalStr
  } : null;

  return {
    items: lineasEvaluadas,
    subtotalGeneral: subtotalGeneralStr,
    descuentoTotal: descuentoTotalStr,
    totalOrden: totalOrdenStr,
    promocionAplicadaOrden: copiaPromoOrden
  };
}
