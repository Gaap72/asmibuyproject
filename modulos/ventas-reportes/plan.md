# Plan del integrante 4: Punto de Venta, órdenes y reportes

Estado inicial: pendiente. Responsable personal: por asignar. Revisor principal: integrante 3; integrante 2 para cobro/cancelación y el 1 para acceso.

## Resultado a entregar

Un flujo completo de venta directa desde la app Android/iOS, con cobro atómico, recuperación segura de respuestas inciertas, cancelaciones, comprobantes e historial. El dueño podrá consultar reportes básicos en el BackOffice móvil.

Leer [reglas locales](AGENTS.md), [reglas generales](../../AGENTS.md) y [matriz CA](../../docs/matriz-aceptacion.md). Completar la [plantilla](../../docs/auditorias/plantilla.md) por tarea. No recrear motores de inventario o promociones para avanzar más rápido: usar sus contratos.

## Stack y separación de implementación

Frontend: **Dart + Flutter** en [frontend/](frontend/README.md), para caja, cancelación, historial y reportes. Backend: **TypeScript + NestJS**, **PostgreSQL/TypeORM** y cálculos exactos en [backend/](backend/README.md). Todas las plataformas consumen `/api/v1`; DTO/OpenAPI transportan dinero y cantidades como cadenas.

Las 11 tareas originales entregan el MVP Android/iOS. E4-12 integra la segunda fase Windows con los otros módulos y verifica operación simultánea móvil/PC.

## E4-01 — Definir órdenes y contratos de integración

Dependencias: lectura de la especificación; coordinar con E1-01, E2-01 y E3-01 en paralelo.

- [ ] Definir órdenes/partidas, estados, folio, idempotencia, copias históricas, método de pago y cancelación.
- [ ] Documentar cotizar, confirmar, recuperar resultado, cancelar, consultar historial y reportes, con permisos y errores.
- [ ] Acordar una transacción compartida con el integrante 2 y representación económica con el 3.
- [ ] Concretar contrato OpenAPI y el puerto que transmite el contexto TypeORM `QueryRunner`/`EntityManager`, sin acoplar reglas de dominio al ORM.
- [ ] Definir cómo la app conserva la identidad de una operación en curso y detecta cambios de cotización sin habilitar ventas sin conexión.
- [ ] Cerrar `docs/auditorias/E4-01.md` con revisión de ambos productores y del integrante 1.

## E4-02 — Implementar órdenes en borrador

Dependencias: E4-01 y E1-02; consumir catálogo real E2-02 al integrar.

- [ ] Crear migraciones de órdenes y partidas con restricciones, estados y claves únicas.
- [ ] Implementar agregar, cambiar cantidad y retirar partidas, y descartar un borrador sin generar movimientos.
- [ ] Mantener cantidades enteras positivas y evitar cobrar una orden vacía o modificar una pagada.
- [ ] Conectar consulta de catálogo y disponibilidad sin reservar inventario; manejar platillos que dejan de estar activos.
- [ ] Verificar persistencia y transiciones permitidas con datos reales; cerrar `docs/auditorias/E4-02.md`.

## E4-03 — Integrar cotización y cambios antes del cobro

Dependencias: E4-02, E2-02 y E3-07. Puede diseñarse con ejemplos del contrato antes de disponer de su implementación.

- [ ] Solicitar al servidor el cálculo económico usando catálogo y promociones actuales.
- [ ] Mostrar precios originales, promoción seleccionada, bonificaciones, ahorro y total sin recalcular las reglas en el cliente.
- [ ] Asociar la cotización con versiones o huella del contenido relevante; si cambia, mostrar el nuevo resumen para aceptación explícita.
- [ ] Comprobar que el cliente no puede imponer un descuento ni un precio manipulando la solicitud.
- [ ] Verificar contratos reales, cambios de precio/vigencia y mensajes; cerrar `docs/auditorias/E4-03.md`.

## E4-04 — Implementar confirmación atómica e idempotente

Dependencias: E4-03, E2-04 y E1-04. Responsable de CA-05 y CA-26; colabora en CA-06, CA-07, CA-12, CA-16 y CA-22.

- [ ] Revalidar usuario, permiso, orden, versiones, promociones e inventario dentro de una estrategia consistente de transacción.
- [ ] Guardar orden, partidas, copias históricas, importe aceptado y todos los consumos de ingredientes mediante un solo commit.
- [ ] Usar PostgreSQL con el mismo `EntityManager` para orden, movimientos y eventos; probar rollback con el motor real, no con SQLite como sustituto de concurrencia.
- [ ] Implementar folio único, clave de idempotencia y recuperación del resultado; rechazar la misma clave con datos distintos y evitar dos cobros de una misma orden.
- [ ] Admitir efectivo, tarjeta externa u otro identificado y `SIN_COBRO` para total cero, sin procesamiento bancario.
- [ ] Probar fallo intermedio, doble envío, receta compartida, unidades gratuitas y total cero; cerrar `docs/auditorias/E4-04.md` con revisión de inventario.

## E4-05 — Desarrollar el Punto de Venta móvil

Dependencias: E4-04 y E1-07. La construcción visual puede empezar antes con contratos claramente simulados.

- [ ] Crear catálogo táctil, carrito, controles de cantidades, resumen económico y selección del método de pago.
- [ ] Aplicar Cupertino, Roboto, Material Symbols y tokens semánticos; adjuntar capturas, contraste y texto ampliado sin que banners oculten acciones de cobro.
- [ ] Mostrar ingredientes faltantes, cambios de importe y permisos insuficientes con mensajes accionables.
- [ ] Guardar la identidad de la operación antes de enviarla; deshabilitar repetición accidental y recuperar el estado tras respuesta incierta, suspensión o cierre de la app.
- [ ] No confirmar éxito sin respuesta fiable, no generar otra clave por un simple reintento y no ofrecer ventas sin conexión.
- [ ] Probar flujo y recuperación en Android e iOS; cerrar `docs/auditorias/E4-05.md`.

## E4-06 — Implementar cancelación e inventario recuperable

Dependencias: E4-04, E2-08 y E1-04. Responsable de CA-23 y CA-24.

- [ ] Crear caso de uso y pantalla móvil con permiso, motivo y unidades no preparadas por partida; cancelar toda la venta.
- [ ] Registrar autor y fecha, validar cantidades recuperables y coordinar reintegros en la misma transacción.
- [ ] Clasificar unidades preparadas como merma sin volver a descontar ingredientes ni usar una receta editada después de la venta.
- [ ] Impedir doble cancelación/reintegro y explicar que la cancelación no realiza un reembolso bancario automático.
- [ ] Verificar cambio histórico de receta, fallo intermedio y reintento; cerrar `docs/auditorias/E4-06.md` con revisión del integrante 2.

## E4-07 — Desarrollar historial y comprobantes

Dependencias: E4-04, E4-06 y E1-04. Responsable de CA-08 y CA-21.

- [ ] Implementar consulta por fecha/estado y detalle con alcance de ventas propias o todas las ventas aplicado en servidor.
- [ ] Mostrar folio, fecha, cajero, cantidades, nombres y precios históricos, promoción, descuento, total y cancelación cuando exista.
- [ ] Crear comprobante dentro de la app y acceso a impresión nativa cuando esté disponible, sin integración específica con impresoras.
- [ ] Verificar que cambios o bajas posteriores de catálogo, usuarios y promociones no alteran el historial ni rompen sus referencias.
- [ ] Probar acceso indebido a venta ajena y lectura histórica en Android/iOS; cerrar `docs/auditorias/E4-07.md`.

## E4-08 — Desarrollar reportes y resumen móvil

Dependencias: E4-07, consulta de existencias E2-03 y navegación E1-07. Responsable de CA-25.

- [ ] Implementar ventas por periodo, unidades por platillo, descuentos, cancelaciones y existencias actuales mediante consultas acordadas.
- [ ] Excluir canceladas del importe vigente, conservarlas separadas y distinguir unidades entregadas y bonificadas.
- [ ] Filtrar por fecha de cobro y zona horaria del negocio; aplicar permisos de reportes en servidor.
- [ ] Crear vistas móviles legibles y componente de resumen para el inicio del BackOffice, sin contabilidad ni reportes fiscales nuevos.
- [ ] Contrastar totales con datos de prueba conocidos y verificar Android/iOS; cerrar `docs/auditorias/E4-08.md`.

## E4-09 — Verificar concurrencia y fallos reales

Dependencias: E4-05, E4-06 y E4-07; colaboración con E2-04 y E2-08. Responsable de CA-07.

- [ ] Ejecutar confirmaciones simultáneas desde dos clientes que compitan por el mismo ingrediente; solo se confirman las que permite el saldo.
- [ ] Simular pérdida de respuesta después del commit y recuperar el resultado desde la misma operación sin duplicados.
- [ ] Verificar doble confirmación de la misma orden, clave repetida con contenido distinto y cancelación concurrente o repetida.
- [ ] Interrumpir operaciones antes del commit y contrastar órdenes, movimientos, saldos y alertas para detectar efectos parciales.
- [ ] Registrar entorno de base real y resultados reproducibles; cerrar `docs/auditorias/E4-09.md` con revisión de los integrantes 2 y 3.

## E4-10 — Cerrar los recorridos completos de operación

Dependencias: E4-08, E4-09, E4-11, E1-11, E2-09 y E3-08. No requiere esperar a E1-08/E1-09; les entrega la versión y datos que deben verificar.

- [ ] Ejecutar en Android e iOS el recorrido dueño crea datos/promoción, almacén registra stock, caja vende y el dueño consulta reportes y alertas.
- [ ] Verificar cancelación con unidades no preparadas y preparadas, y conservación histórica después de editar catálogo/promoción.
- [ ] Repetir el flujo representativo con permisos restringidos y pérdida/reanudación de conexión; usar dispositivos físicos de ambas plataformas para la validación final.
- [ ] Verificar composición gráfica de todas las pantallas propias y apertura desde avisos de cancelación; un proveedor push caído no altera ventas ni reintegros.
- [ ] Completar CA propios 05, 07, 08, 21, 23, 24, 25 y 26, y entregar al integrante 1 datos sintéticos y versión para restauración.
- [ ] Cerrar `docs/auditorias/E4-10.md` con evidencias de ambos sistemas móviles, contratos y limitaciones reales.

## E4-11 — Producir notificaciones de cancelación

Dependencias: E4-06, E4-07 y E1-10. Colabora en CA-33, CA-34 y CA-35.

- [ ] Guardar un evento único por cancelación confirmada dentro de la transacción de orden y reintegros; no publicar antes del commit.
- [ ] Destinarlo a usuarios con consulta de todas las ventas y al cajero de origen con consulta propia, sin duplicar destinatarios.
- [ ] Abrir el detalle de venta desde el centro o push validando sesión y permisos actuales; no incorporar importes al texto de pantalla bloqueada.
- [ ] Verificar reintento, cancelación concurrente, rollback y recurso inaccesible; un fallo del proveedor no cambia la venta ni duplica movimientos.
- [ ] Cerrar `docs/auditorias/E4-11.md` y completar en E4-10 pruebas reales de ambos canales; no enviar un push por cada venta normal.

## E4-12 — Fase PC: entregar caja y operación integrada en Windows

Dependencias: E1-12, E2-11, E3-10 y E4-10. Fase posterior al MVP; criterio PC-04 y cierre de la ampliación PC.

- [ ] Reutilizar cliente Flutter y API, adaptando catálogo/carrito, cancelaciones, historial y reportes a teclado, ratón y ventanas variables.
- [ ] Verificar sesión segura, identidad de operación en curso, cierre/reapertura de la ventana y recuperación de respuestas inciertas.
- [ ] Completar comprobantes e impresión mediante el adaptador Windows y apertura de avisos internos/externos con permisos reales.
- [ ] Ejecutar ventas y cancelaciones concurrentes desde Windows y móvil contra PostgreSQL, contrastando stock, redondeos, historial, alertas e idempotencia.
- [ ] Comprobar PC-01 a PC-04 y cerrar `docs/auditorias/E4-12.md` con los revisores; no declarar macOS/Linux entregados por haber validado Windows.

## Lista de cierre del MVP del integrante

- [ ] Once tareas del MVP entregadas y auditadas; E4-11 precede a E4-10. E4-12 corresponde a la fase PC y no bloquea ese cierre.
- [ ] Cancelaciones notificadas una sola vez en el centro interno con destinatarios y apertura seguros.
- [ ] Venta, cancelación, historial y reportes operan en Android e iOS con permisos reales.
- [ ] Atomicidad e idempotencia comprobadas sobre base real y con solicitudes concurrentes.
- [ ] Datos y evidencias de integración entregados para recuperación y cierre técnico.
