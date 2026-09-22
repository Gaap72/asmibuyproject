# Instrucciones del integrante 3: descuentos y promociones

Leer primero [AGENTS.md general](../../AGENTS.md), [spec.md](../../spec.md) y [plan propio](plan.md). Estas reglas complementan las universales.

## Responsabilidad y límites

Eres responsable de configurar promociones y calcular su efecto económico. Tus tablas son `promociones` y `promocion_platillos`. Entregas pantallas para el BackOffice móvil de Android y iOS, API de administración y un servicio de evaluación que consume ventas.

No cobras, no guardas órdenes y no descuentas inventario. El módulo de ventas conserva el resultado histórico de tu cálculo. No crees un segundo motor de precios en la app ni una pantalla web de administración.

## Reglas de estructura

- Mantén las reglas de elegibilidad, NxM, selección y redondeo en `dominio/`, con entradas explícitas y resultados reproducibles.
- Separa en `aplicacion/` administración, obtención consistente de promociones y evaluación de una orden.
- Encapsula base de datos en `infraestructura/`.
- Separa las pantallas y view models Dart/Flutter en `frontend/lib/src/presentacion/` de los controladores TypeScript/NestJS en `backend/src/interfaz/`. Las capas de servidor indicadas aquí pertenecen a `backend/src/`.
- No accedas a la hora real ni a la base de datos desde una función pura de cálculo: recibe el momento de evaluación y los datos como entradas para verificar límites con precisión.

## Invariantes obligatorias

- Tres tipos: porcentaje, monto fijo y cantidad. Solo admitir campos y alcances válidos para el tipo elegido.
- Temporal activa: `inicio <= momento < fin`. Permanente: sin vencimiento, elegible mientras esté activa. Una retirada conserva historial y no se reactiva.
- El porcentaje está en `(0, 100]`; un monto fijo es positivo y no genera precios negativos.
- Un monto fijo de toda la venta se descuenta una vez; el de platillos participantes se descuenta por unidad elegible.
- NxM cumple `N > M >= 1`, con enteros. No se agregan unidades al carrito para completar grupos.
- Sin mezcla, agrupar por platillo. Con mezcla, ordenar por precio original descendente, formar grupos de N y bonificar los N−M de menor precio de cada grupo. Cobrar sobrantes normalmente.
- Elegir una sola promoción con el mayor ahorro efectivo y desempatar por identificador de promoción.
- Distribuir descuentos con decimales exactos y centavos residuales de forma determinista. La suma por partida coincide con el descuento total.
- Las cantidades entregadas nunca se reducen porque algunas unidades sean gratuitas.
- Entregar una copia completa de las reglas aplicadas para que ventas preserve el historial.

## Auditoría obligatoria

Por cada tarea, completar `docs/auditorias/<ID>.md`. Revisor principal: integrante 2. El integrante 4 revisa el contrato de evaluación y su integración al cobro.

Verificar el inicio inclusivo y fin exclusivo, desactivación manual, promociones permanentes, montos que superan la base, 100 %, empate, sobrantes, mezcla, orden de captura y distribución de centavos. Usar los importes de ejemplo de `spec.md` como resultados independientes esperados.

Las pruebas no deben llamar a la misma función interna para calcular el resultado esperado: deben contrastar con valores conocidos y reglas del documento. Las capturas de móvil demuestran presentación; las pruebas del servidor demuestran el cálculo. Un cambio de promoción después de cotizar debe detectarse al cobrar sin alterar ventas anteriores.

## Diseño y notificaciones de tu área

Aplicar la [guía visual](../../docs/diseno-interfaz.md) y los tokens del AGENTS general: composición Cupertino, Roboto y Material Symbols Rounded. Usar controles segmentados para Temporal/Permanente, morado como énfasis y acciones de guardado verdes. Mostrar fechas, tipo, N y M con texto explícito; no depender de colores para indicar vigencia. Auditar formularios y estados Android/iOS.

Producir eventos de inicio/fin y de activación permanente o suspensión/retiro de una promoción vigente. Evaluar transiciones temporales desde el servidor aunque la app esté cerrada; no usar temporizadores del teléfono como fuente de verdad. Registrar una clave por promoción, versión y transición, cancelar eventos obsoletos y no generar vencimientos de permanentes. Usar la bandeja transaccional y entrega común del integrante 1; los destinatarios requieren permiso vigente de consulta de promociones.

## Stack y fase PC

Seguir las guías de [frontend Dart/Flutter](frontend/README.md) y [backend TypeScript/NestJS](backend/README.md). Usar decimal.js desde cadenas y PostgreSQL/TypeORM; DTO/OpenAPI devuelven valores decimales exactos como cadenas. Mantener un único motor de precios en servidor para todas las plataformas.

E3-10 adapta administración de promociones a Windows en la fase posterior, sin copiar el motor NxM a Dart. Auditar teclado, selectores de fecha, ventanas y equivalencia de la respuesta API entre móvil y PC con los mismos datos e instante de evaluación.
