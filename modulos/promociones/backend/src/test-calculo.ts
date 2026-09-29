/**
 * Script de Verificación y Pruebas Unitarias del Motor de Promociones (Integrante 3)
 * Ejecuta comprobaciones sin depender de la base de datos conectada.
 */

import {
  evaluarPromocionLinea,
  evaluarOrdenCompleta,
  esPromocionElegible
} from './dominio/calculo-promociones';
import { PromocionEntidad, PlatilloCatalogoRefDTO } from './dominio/tipos';
import { ServicioPromociones } from './aplicacion/servicio-promociones';
import { RepositorioPromocionesSimulado } from './infraestructura/repositorio-promociones';

function assertEqual(actual: any, expected: any, testName: string) {
  if (actual === expected) {
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName}: Esperado "${expected}", obtenido "${actual}"`);
    process.exitCode = 1;
  }
}

console.log('--- INICIANDO PRUEBAS DEL MOTOR DE CÁLCULO DE PROMOCIONES ---');

// Test 1: Descuento 15% sobre platillo de $200.00
const promo15Pct: PromocionEntidad = {
  id: 1,
  nombre: '15% de Descuento',
  platillo_id: 101,
  tipo: 'PORCENTAJE',
  porcentaje: '15.00',
  duracion: 'PERMANENTE',
  estado: 'ACTIVA',
  creado_por: 1,
  creado_en: new Date(),
  actualizado_en: new Date()
};

const res15Pct = evaluarPromocionLinea(1, '200.00', 'Platillo A', 101, promo15Pct);
assertEqual(res15Pct.subtotalSinDescuento, '200.00', 'Test 1: Subtotal sin descuento 15%');
assertEqual(res15Pct.ahorroLinea, '30.00', 'Test 1: Ahorro 15% ($30.00)');
assertEqual(res15Pct.subtotalConDescuento, '170.00', 'Test 1: Total con descuento 15% ($170.00)');

// Test 2: Descuento 100% sobre platillo de $150.00 (Total $0.00 válido)
const promo100Pct: PromocionEntidad = {
  id: 2,
  nombre: '100% de Descuento',
  platillo_id: 102,
  tipo: 'PORCENTAJE',
  porcentaje: '100.00',
  duracion: 'PERMANENTE',
  estado: 'ACTIVA',
  creado_por: 1,
  creado_en: new Date(),
  actualizado_en: new Date()
};

const res100Pct = evaluarPromocionLinea(1, '150.00', 'Platillo B', 102, promo100Pct);
assertEqual(res100Pct.subtotalSinDescuento, '150.00', 'Test 2: Subtotal sin descuento 100%');
assertEqual(res100Pct.ahorroLinea, '150.00', 'Test 2: Ahorro 100% ($150.00)');
assertEqual(res100Pct.subtotalConDescuento, '0.00', 'Test 2: Total con descuento 100% ($0.00)');
assertEqual(res100Pct.cantidadEntregada, 1, 'Test 2: Cantidad entregada no cambia (1)');

// Test 3: Promoción 2x1 sobre 5 unidades de $100.00 (Sobrantes NxM)
const promo2x1: PromocionEntidad = {
  id: 3,
  nombre: '2x1 en Hamburguesas',
  platillo_id: 103,
  tipo: 'NXM',
  n: 2,
  m: 1,
  duracion: 'PERMANENTE',
  estado: 'ACTIVA',
  creado_por: 1,
  creado_en: new Date(),
  actualizado_en: new Date()
};

const res2x1 = evaluarPromocionLinea(5, '100.00', 'Hamburguesa', 103, promo2x1);
assertEqual(res2x1.subtotalSinDescuento, '500.00', 'Test 3: Subtotal sin descuento 5 unidades');
assertEqual(res2x1.cantidadCobradas, 3, 'Test 3: Unidades cobradas 2x1 (3 cobradas)');
assertEqual(res2x1.cantidadBonificadas, 2, 'Test 3: Unidades bonificadas 2x1 (2 bonificadas)');
assertEqual(res2x1.ahorroLinea, '200.00', 'Test 3: Ahorro 2x1 ($200.00)');
assertEqual(res2x1.subtotalConDescuento, '300.00', 'Test 3: Total 2x1 ($300.00)');
assertEqual(res2x1.cantidadEntregada, 5, 'Test 3: Cantidad entregada no cambia (5 entregadas)');

// Test 4: Promoción 3x1 sobre 4 unidades de $100.00
const promo3x1: PromocionEntidad = {
  id: 4,
  nombre: '3x1 en Tacos',
  platillo_id: 104,
  tipo: 'NXM',
  n: 3,
  m: 1,
  duracion: 'PERMANENTE',
  estado: 'ACTIVA',
  creado_por: 1,
  creado_en: new Date(),
  actualizado_en: new Date()
};

const res3x1 = evaluarPromocionLinea(4, '100.00', 'Tacos', 104, promo3x1);
assertEqual(res3x1.subtotalSinDescuento, '400.00', 'Test 4: Subtotal sin descuento 4 unidades');
assertEqual(res3x1.cantidadCobradas, 2, 'Test 4: Unidades cobradas 3x1 (2 cobradas)');
assertEqual(res3x1.cantidadBonificadas, 2, 'Test 4: Unidades bonificadas 3x1 (2 bonificadas)');
assertEqual(res3x1.ahorroLinea, '200.00', 'Test 4: Ahorro 3x1 ($200.00)');
assertEqual(res3x1.subtotalConDescuento, '200.00', 'Test 4: Total 3x1 ($200.00)');
assertEqual(res3x1.cantidadEntregada, 4, 'Test 4: Cantidad entregada no cambia (4 entregadas)');

// Test 5: Vigencia temporal (Inicio inclusivo, fin exclusivo)
const ahora = new Date('2026-09-28T12:00:00.000Z');

const promoTemporal: PromocionEntidad = {
  id: 5,
  nombre: 'Promo Flash',
  platillo_id: 105,
  tipo: 'PORCENTAJE',
  porcentaje: '20.00',
  duracion: 'TEMPORAL',
  fecha_inicio: new Date('2026-09-28T10:00:00.000Z'),
  fecha_fin: new Date('2026-09-28T14:00:00.000Z'),
  estado: 'ACTIVA',
  creado_por: 1,
  creado_en: new Date(),
  actualizado_en: new Date()
};

assertEqual(esPromocionElegible(promoTemporal, ahora), true, 'Test 5a: Vigente durante rango temporal');
assertEqual(esPromocionElegible(promoTemporal, new Date('2026-09-28T10:00:00.000Z')), true, 'Test 5b: Inicio inclusivo');
assertEqual(esPromocionElegible(promoTemporal, new Date('2026-09-28T14:00:00.000Z')), false, 'Test 5c: Fin exclusivo');
assertEqual(esPromocionElegible(promoTemporal, new Date('2026-09-28T09:59:59.000Z')), false, 'Test 5d: Antes del inicio');

// Test 6: Única promoción por orden y desempate por menor ID
const promoEmpateA: PromocionEntidad = { ...promo2x1, id: 10, nombre: '2x1 A' };
const promoEmpateB: PromocionEntidad = { ...promo2x1, id: 5, nombre: '2x1 B (Menor ID)' };

const catalogoMap = new Map<number, PlatilloCatalogoRefDTO>();
catalogoMap.set(103, { id: 103, nombre: 'Hamburguesa', precio: '100.00', activo: true });

const evalOrden = evaluarOrdenCompleta(
  [{ platilloId: 103, cantidad: 5 }],
  catalogoMap,
  [promoEmpateA, promoEmpateB],
  ahora
);

assertEqual(evalOrden.descuentoTotal, '200.00', 'Test 6: Descuento total de la orden');
assertEqual(evalOrden.promocionAplicadaOrden?.id, 5, 'Test 6: Ganador por desempate de menor ID (#5 vs #10)');

// Test 7: Administración de Promociones y ciclo de vida
async function testCicloVida() {
  const repo = new RepositorioPromocionesSimulado();
  const servicio = new ServicioPromociones(repo);

  const creada = await servicio.crearPromocion({
    nombre: 'Promo Inicial',
    platilloId: 101,
    tipo: 'PORCENTAJE',
    porcentaje: '10.00',
    duracion: 'PERMANENTE'
  }, 1);

  assertEqual(creada.estado, 'ACTIVA', 'Test 7a: Estado inicial activa');

  const inactiva = await servicio.cambiarEstado(creada.id, 'INACTIVA');
  assertEqual(inactiva.estado, 'INACTIVA', 'Test 7b: Cambiar a inactiva');

  const reactivada = await servicio.cambiarEstado(creada.id, 'ACTIVA');
  assertEqual(reactivada.estado, 'ACTIVA', 'Test 7c: Reactivar');

  const retirada = await servicio.cambiarEstado(creada.id, 'RETIRADA');
  assertEqual(retirada.estado, 'RETIRADA', 'Test 7d: Retirar promoción');

  try {
    await servicio.cambiarEstado(creada.id, 'ACTIVA');
    console.error('[FAIL] Test 7e: Se permitió reactivar una promoción retirada');
    process.exitCode = 1;
  } catch (err: any) {
    assertEqual(err.codigo, 'PROMOCION_RETIRADA', 'Test 7e: Impide reactivar una promoción retirada');
  }
}

testCicloVida().then(() => {
  console.log('--- TODAS LAS PRUEBAS FINALIZARON CON ÉXITO ---');
});
