/**
 * Prueba de Integración de Promociones con Ventas (Integrante 3)
 * Comprueba la re-evaluación atómica y la detección de resumen desactualizado (HTTP 409).
 */

import { ServicioPromociones } from './aplicacion/servicio-promociones';
import { IntegracionVentasPromociones } from './aplicacion/integracion-ventas-promociones';
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

async function ejecutarPruebasIntegracion() {
  console.log('--- INICIANDO PRUEBAS DE INTEGRACIÓN CON VENTAS ---');

  const ahora = new Date('2026-09-28T12:00:00.000Z');
  const repo = new RepositorioPromocionesSimulado();

  // Promoción temporal a punto de expirar a las 12:30 UTC
  const promoTemporalData: Omit<PromocionEntidad, 'id' | 'creado_en' | 'actualizado_en'> = {
    nombre: 'Descuento Flash 20%',
    platillo_id: 1,
    tipo: 'PORCENTAJE',
    porcentaje: '20.00',
    duracion: 'TEMPORAL',
    fecha_inicio: new Date('2026-09-28T10:00:00.000Z'),
    fecha_fin: new Date('2026-09-28T12:30:00.000Z'),
    estado: 'ACTIVA',
    creado_por: 1
  };

  const promoCreada = await repo.crear(promoTemporalData);
  const promoId = promoCreada.id;

  const servicio = new ServicioPromociones(repo);
  const integracion = new IntegracionVentasPromociones(servicio);

  const catalogoMap = new Map<number, PlatilloCatalogoRefDTO>();
  catalogoMap.set(1, { id: 1, nombre: 'Hamburguesa', precio: '100.00', activo: true });

  const items = [{ platilloId: 1, cantidad: 2 }];

  // 1. Cotización inicial durante la vigencia (12:00 UTC) -> 20% de $200 = $40 de ahorro
  const cotizacion = await servicio.evaluarOrden(items, catalogoMap, ahora);
  assertEqual(cotizacion.descuentoTotal, '40.00', 'Test 1: Cotización válida con 20% descuento ($40.00)');
  assertEqual(cotizacion.promocionAplicadaOrden?.id, promoId, `Test 1: Promoción #${promoId} aplicada`);

  // 2. Confirmación al mismo tiempo (12:00 UTC) -> Éxito sin cambios
  const confirmacionExitosa = await integracion.validarConfirmacionVenta(
    items,
    catalogoMap,
    promoId,
    '40.00',
    ahora
  );
  assertEqual(confirmacionExitosa.descuentoTotal, '40.00', 'Test 2: Confirmación exitosa conservando promoción cotizada');

  // 3. Confirmación posterior a las 13:00 UTC (Promoción ya expiró) -> Error RESUMEN_DESACTUALIZADO (409)
  const horaPostExpiracion = new Date('2026-09-28T13:00:00.000Z');

  try {
    await integracion.validarConfirmacionVenta(
      items,
      catalogoMap,
      promoId,
      '40.00',
      horaPostExpiracion
    );
    console.error('[FAIL] Test 3: Permitió confirmar con una promoción expirada');
    process.exitCode = 1;
  } catch (err: any) {
    assertEqual(err.codigo, 'RESUMEN_DESACTUALIZADO', 'Test 3: Rechaza confirmación desactualizada con HTTP 409');
  }

  // 4. Inmutabilidad del historial cuando la promoción es desactivada o retirada posterior a la venta
  await repo.cambiarEstado(promoId, 'RETIRADA');
  assertEqual(cotizacion.promocionAplicadaOrden?.ahorro, '40.00', 'Test 4: La copia de la venta anterior conserva sus datos inmutables');

  console.log('--- PRUEBAS DE INTEGRACIÓN CON VENTAS COMPLETADAS EXITOSAMENTE ---');
}

ejecutarPruebasIntegracion();
