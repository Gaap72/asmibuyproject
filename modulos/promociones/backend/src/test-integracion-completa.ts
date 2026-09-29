/**
 * Pruebas Integradas de Promociones y Consumo (Integrante 3)
 * Verificación de escenarios de aceptación CW-10, CW-11, CW-12, CW-13, CW-14 y CW-15.
 */

import { ServicioPromociones } from './aplicacion/servicio-promociones';
import { RepositorioPromocionesSimulado } from './infraestructura/repositorio-promociones';
import { PlatilloCatalogoRefDTO, PromocionEntidad } from './dominio/tipos';

function assertEqual(actual: any, expected: any, testName: string) {
  if (actual === expected) {
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName}: Esperado "${expected}", obtenido "${actual}"`);
    process.exitCode = 1;
  }
}

async function ejecutarBateriaIntegrada() {
  console.log('=== BATERÍA DE VERIFICACIÓN DE PROMOCIONES INTEGRADAS (W3-06) ===');

  const ahora = new Date('2026-09-28T12:00:00.000Z');
  const repo = new RepositorioPromocionesSimulado();
  const servicio = new ServicioPromociones(repo);

  // Catálogo de prueba
  const catalogoMap = new Map<number, PlatilloCatalogoRefDTO>();
  catalogoMap.set(1, { id: 1, nombre: 'Hamburguesa Clásica', precio: '120.00', activo: true });
  catalogoMap.set(2, { id: 2, nombre: 'Tacos al Pastor', precio: '95.00', activo: true });
  catalogoMap.set(3, { id: 3, nombre: 'Refresco de Cola', precio: '25.00', activo: true });

  // 1. Crear Promociones de Prueba
  // Promoción A: 15% en Hamburguesa (ID 1)
  const promo15Pct = await repo.crear({
    nombre: '15% en Hamburguesas',
    platillo_id: 1,
    tipo: 'PORCENTAJE',
    porcentaje: '15.00',
    duracion: 'PERMANENTE',
    estado: 'ACTIVA',
    creado_por: 1
  });

  // Promoción B: 2x1 en Hamburguesa (ID 1)
  const promo2x1 = await repo.crear({
    nombre: '2x1 en Hamburguesas',
    platillo_id: 1,
    tipo: 'NXM',
    n: 2,
    m: 1,
    duracion: 'PERMANENTE',
    estado: 'ACTIVA',
    creado_por: 1
  });

  // Promoción C: 3x1 en Tacos (ID 2)
  const promo3x1 = await repo.crear({
    nombre: '3x1 en Tacos',
    platillo_id: 2,
    tipo: 'NXM',
    n: 3,
    m: 1,
    duracion: 'PERMANENTE',
    estado: 'ACTIVA',
    creado_por: 1
  });

  // Promoción D: 100% en Refresco (ID 3)
  const promo100Pct = await repo.crear({
    nombre: 'Refresco Gratis (100%)',
    platillo_id: 3,
    tipo: 'PORCENTAJE',
    porcentaje: '100.00',
    duracion: 'PERMANENTE',
    estado: 'ACTIVA',
    creado_por: 1
  });

  // Escenario 1: Evaluación 5 Hamburguesas ($120 c/u)
  // Evalúa 15% ($90 ahorro) vs 2x1 ($240 ahorro) -> Gana 2x1 por mayor ahorro
  const res1 = await servicio.evaluarOrden([{ platilloId: 1, cantidad: 5 }], catalogoMap, ahora);
  assertEqual(res1.promocionAplicadaOrden?.id, promo2x1.id, 'Escenario 1: Gana 2x1 sobre 15% por mayor ahorro ($240 vs $90)');
  assertEqual(res1.subtotalGeneral, '600.00', 'Escenario 1: Subtotal sin descuento 5x$120 = $600.00');
  assertEqual(res1.descuentoTotal, '240.00', 'Escenario 1: Ahorro $240.00');
  assertEqual(res1.totalOrden, '360.00', 'Escenario 1: Total a pagar $360.00');
  assertEqual(res1.items[0].cantidadEntregada, 5, 'Escenario 1: Cantidad entregada = 5 (Se consumen 5 de inventario)');
  assertEqual(res1.items[0].cantidadBonificadas, 2, 'Escenario 1: Cantidad bonificada = 2');

  // Escenario 2: 4 Tacos a $95 c/u en 3x1
  const res2 = await servicio.evaluarOrden([{ platilloId: 2, cantidad: 4 }], catalogoMap, ahora);
  assertEqual(res2.promocionAplicadaOrden?.id, promo3x1.id, 'Escenario 2: Aplica 3x1 en Tacos');
  assertEqual(res2.subtotalGeneral, '380.00', 'Escenario 2: Subtotal sin descuento 4x$95 = $380.00');
  assertEqual(res2.descuentoTotal, '190.00', 'Escenario 2: Ahorro 2 bonificadas x $95 = $190.00');
  assertEqual(res2.totalOrden, '190.00', 'Escenario 2: Total a pagar $190.00');
  assertEqual(res2.items[0].cantidadEntregada, 4, 'Escenario 2: Cantidad entregada = 4 (Se consumen 4 de inventario)');

  // Escenario 3: 1 Refresco a $25 con 100% de Descuento (Total cero válido)
  const res3 = await servicio.evaluarOrden([{ platilloId: 3, cantidad: 1 }], catalogoMap, ahora);
  assertEqual(res3.promocionAplicadaOrden?.id, promo100Pct.id, 'Escenario 3: Aplica 100% en Refresco');
  assertEqual(res3.descuentoTotal, '25.00', 'Escenario 3: Ahorro total de $25.00');
  assertEqual(res3.totalOrden, '0.00', 'Escenario 3: Total orden = $0.00 (Válido para SIN_COBRO)');
  assertEqual(res3.items[0].cantidadEntregada, 1, 'Escenario 3: Cantidad entregada = 1 (Consume inventario normalmente)');

  // Escenario 4: Desactivar la promoción 2x1 y re-evaluar
  await repo.cambiarEstado(promo2x1.id, 'INACTIVA');
  const res4 = await servicio.evaluarOrden([{ platilloId: 1, cantidad: 5 }], catalogoMap, ahora);
  assertEqual(res4.promocionAplicadaOrden?.id, promo15Pct.id, 'Escenario 4: Al inactivar 2x1, se selecciona la siguiente elegible (15%)');
  assertEqual(res4.descuentoTotal, '90.00', 'Escenario 4: Ahorro 15% de $600 = $90.00');
  assertEqual(res4.totalOrden, '510.00', 'Escenario 4: Total a pagar $510.00');

  console.log('=== BATERÍA DE VERIFICACIÓN DE PROMOCIONES COMPLETADA CON ÉXITO ===');
}

ejecutarBateriaIntegrada();
