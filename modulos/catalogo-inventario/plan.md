# Plan del integrante 2: catálogo, inventario y alertas

Estado inicial: pendiente. Responsable personal: por asignar. Revisor principal: integrante 1; integrante 4 para consumo y reintegro.

## Resultado a entregar

El dueño y almacén podrán administrar ingredientes, platillos con receta, existencias, movimientos y mínimos individuales desde el BackOffice de la app móvil Android/iOS. Caja recibirá disponibilidad y operaciones transaccionales de consumo y reintegro sin duplicar la lógica de inventario.

Leer [reglas locales](AGENTS.md), [reglas generales](../../AGENTS.md) y [matriz CA](../../docs/matriz-aceptacion.md). Usar la [plantilla](../../docs/auditorias/plantilla.md) por tarea. Los criterios que necesitan ventas permanecerán pendientes hasta comprobarlos con el módulo integrado, aunque sus componentes locales ya estén auditados.

## Stack y separación de implementación

Frontend: **Dart + Flutter** en [frontend/](frontend/README.md), para E2-06/E2-07. Backend: **TypeScript + NestJS**, **PostgreSQL/TypeORM** y **decimal.js** en [backend/](backend/README.md), para E2-02 a E2-05, E2-08 y E2-10. Los DTO públicos siguen OpenAPI y preservan cantidades como cadenas decimales.

Las 10 tareas originales corresponden al MVP Android/iOS. E2-11 adapta el módulo a Windows en una fase posterior, sin reemplazar su backend.

## E2-01 — Definir datos y contratos del módulo

Dependencias: lectura de la especificación; el diseño se realiza en paralelo con E1-01 y se concreta con sus decisiones.

- [ ] Definir campos y restricciones de ingredientes, platillos, recetas y movimientos, incluyendo unidad y referencias históricas.
- [ ] Documentar DTO/OpenAPI y precisión PostgreSQL `numeric`; mapear decimales a decimal.js en servidor y conservarlos exactos en el cliente Dart.
- [ ] Documentar consultas de catálogo/precios, demanda agregada, disponibilidad, consumo y reintegro en `docs/contratos/`.
- [ ] Acordar con el integrante 4 entrada por partida, contexto de transacción, errores, orden de bloqueo y prevención de reintegros repetidos.
- [ ] Acordar permisos y formato de alertas con el integrante 1, y catálogo de participantes con el integrante 3.
- [ ] Cerrar `docs/auditorias/E2-01.md` con revisión de contratos por sus consumidores.

## E2-02 — Implementar ingredientes, platillos y recetas

Dependencias: E2-01 y E1-02; integrar autorización cuando E1-04 esté disponible. Responsable de CA-04 y CA-27; apoya CA-08.

- [ ] Crear migraciones y casos de uso de catálogo con precio positivo, cantidades positivas y relaciones sin duplicados.
- [ ] Impedir cambiar la unidad de un ingrediente usado en recetas o movimientos.
- [ ] Validar receta completa y ausencia de ingredientes inactivos antes de activar o vender un platillo.
- [ ] Controlar bajas lógicas y mostrar platillos afectados antes de desactivar un ingrediente utilizado; crear o editar recetas no genera movimientos.
- [ ] Verificar reglas con datos persistidos y cerrar `docs/auditorias/E2-02.md`; preservar referencias históricas.

## E2-03 — Implementar historial y movimientos manuales

Dependencias: E2-02 y E1-04; E1-06 para integrar la bitácora administrativa.

- [ ] Registrar existencias iniciales, entradas, ajustes positivos/negativos y mermas independientes.
- [ ] Exigir motivo para ajustes y mermas, autor autenticado y permiso de la operación.
- [ ] Conservar movimientos y corregirlos por compensación, con referencia al origen.
- [ ] Rechazar saldos negativos y comprobar que un saldo auxiliar, si existe, coincide con el historial.
- [ ] Verificar límites, rechazo sin efectos parciales y consulta del historial; cerrar `docs/auditorias/E2-03.md`.

## E2-04 — Entregar consumo atómico y disponibilidad

Dependencias: E2-03, E1-02 y contrato E4-01. Responsable de CA-06; colabora en CA-05, CA-07, CA-16 y CA-26.

- [ ] Calcular demanda conjunta por ingrediente para todas las partidas y todas las unidades entregadas.
- [ ] Consultar disponibilidad sin reservar al abrir un borrador; diferenciar stock bajo de stock insuficiente.
- [ ] Implementar consumo con bloqueos o estrategia equivalente, conservando el contexto de transacción recibido desde ventas.
- [ ] Materializar esa operación con el `EntityManager` del `QueryRunner` compartido, sin usar otra conexión o un repositorio global fuera de la transacción.
- [ ] Registrar movimientos por ingrediente y partida para reconstruir el consumo histórico y soportar reintegros.
- [ ] Probar con un consumidor de contrato y base real rollback completo, demanda compartida y solicitudes simultáneas; cerrar `docs/auditorias/E2-04.md`. La aceptación integrada se completa con E4-04/E4-09.

## E2-05 — Implementar mínimos y alertas individuales

Dependencias: E2-03. Responsable de CA-09, CA-10 y CA-11.

- [ ] Implementar `stock_minimo` por ingrediente y `alerta_stock_activa`; exigir mínimo no negativo cuando se activa la alerta.
- [ ] Calcular bajo stock con `existencia <= mínimo`, agotado a cero y resolución cuando la existencia supera el mínimo.
- [ ] Reevaluar ante movimientos y cambios de configuración, conservando el mínimo al desactivar una alerta.
- [ ] Evitar avisos duplicados por operación y publicar consulta de alertas para el BackOffice.
- [ ] Probar igualdad exacta, superación del mínimo, cero y desactivación; cerrar `docs/auditorias/E2-05.md`. Comprobar después que el cobro integrado actualiza la vista.

## E2-06 — Desarrollar pantallas de platillos y recetas

Dependencias: E2-02 y E1-07.

- [ ] Implementar listas y formularios móviles de creación, edición y activación de platillos e ingredientes.
- [ ] Crear editor de receta con ingrediente, unidad y cantidad por unidad de platillo; impedir duplicados.
- [ ] Mostrar errores de receta incompleta, cantidades inválidas y desactivación con dependencias.
- [ ] Integrar permisos reales del servidor, teclado para cantidades y estados de carga, vacío, error y pérdida de conexión.
- [ ] Aplicar Cupertino, Roboto, Material Symbols y tokens compartidos; registrar capturas Android/iOS, contraste y texto ampliado en el seguimiento visual.
- [ ] Comprobar crear la hamburguesa de ejemplo y editarla sin consumir stock; cerrar `docs/auditorias/E2-06.md`.

## E2-07 — Desarrollar pantallas de inventario y alertas

Dependencias: E2-03, E2-05 y E1-07.

- [ ] Crear lista móvil de ingredientes con existencias, unidad, mínimo y estado de stock, legible sin una tabla de escritorio.
- [ ] Crear formularios de entrada, ajuste y merma con motivo cuando corresponda, e historial consultable.
- [ ] Permitir configurar o desactivar alertas individualmente con su permiso específico.
- [ ] Entregar el componente de alertas del BackOffice móvil con amarillo para bajo stock y rojo para agotado; actualizar tras movimientos y al reanudar, y abrir el centro de Avisos común sin implementar otro sistema push.
- [ ] Verificar lectura por almacén, configuración autorizada y persistencia/resolución de alertas; cerrar `docs/auditorias/E2-07.md`.

## E2-08 — Implementar reintegros para cancelación

Dependencias: E2-04 y contrato E4-01; puede desarrollarse antes de la pantalla de cancelación.

- [ ] Recibir cantidades completas no preparadas por partida y validar que no exceden las entregadas.
- [ ] Obtener el consumo original, no la receta actual, y generar compensaciones referenciadas a esos movimientos.
- [ ] Evitar reintegros duplicados o superiores al consumo; usar la transacción de cancelación de ventas.
- [ ] Mantener separada la clasificación de merma del movimiento ya consumido para no generar una segunda salida.
- [ ] Verificar cambios posteriores de receta, reintentos y rollback; cerrar `docs/auditorias/E2-08.md`. CA-23/CA-24 se verifican conjuntamente en E4-06.

## E2-09 — Auditar inventario integrado y cerrar el módulo

Dependencias: E2-06, E2-07, E2-08, E2-10, E1-11, E4-04 y E4-06. No requiere esperar a la tarea final E4-10.

- [ ] Preparar datos sintéticos de recetas, stock, promociones con unidades gratuitas y cancelaciones con recuperación parcial por partidas.
- [ ] Verificar con caja real el consumo, los faltantes, el rollback, las alertas y los reintegros; apoyar E4-09 para concurrencia e idempotencia.
- [ ] Contrastar saldo y movimientos después de cada escenario, incluyendo merma sin salida duplicada.
- [ ] Verificar centro interno y push de bajo stock/agotado, resolución, destinatarios y ausencia de avisos tras rollback; apoyar CA-29 a CA-35 según corresponda.
- [ ] Completar las evidencias integradas de CA-04, CA-06, CA-09, CA-10, CA-11 y CA-27, y entregar datos al integrante 1 para restauración.
- [ ] Cerrar `docs/auditorias/E2-09.md` con hallazgos resueltos y contratos definitivos.

## E2-10 — Producir notificaciones de inventario por condición

Dependencias: E2-04, E2-05 y E1-10. Responsable principal de CA-35, compartido con promociones y ventas.

- [ ] Modelar episodios de alerta y claves por ingrediente/episodio/transición, sin avisar por movimientos que mantengan la misma condición.
- [ ] Registrar eventos al entrar en bajo o agotado en la transacción de stock o configuración; un paso directo a agotado produce un solo aviso.
- [ ] Resolver el episodio y sus avisos al superar el mínimo o desactivar alertas, sin otro push; una recaída abre episodio nuevo y leer no resuelve inventario.
- [ ] Seleccionar por contrato cuentas activas con permiso de consultar alertas, delegando centro y envío al integrante 1; verificar cambios de permisos antes de entregar.
- [ ] Probar umbrales modificados, activación/desactivación, reintentos y rollback; cerrar `docs/auditorias/E2-10.md` y completar con E2-09 la evidencia de ambos canales.

## E2-11 — Fase PC: adaptar catálogo e inventario a Windows

Dependencias: E1-12 y E2-09. Fase posterior al MVP; criterio PC-02.

- [ ] Reutilizar los paquetes Flutter, DTO y repositorios cliente, manteniendo la misma API NestJS y PostgreSQL central.
- [ ] Adaptar listas y detalles a ventanas amplias/reducidas, con navegación por teclado, ratón y foco visible.
- [ ] Comprobar edición de recetas, unidades, mínimos y movimientos desde Windows sin cambiar las reglas existentes.
- [ ] Verificar que un movimiento desde PC se refleja en móvil y en los avisos autorizados, sin saldo local independiente ni duplicados al reintentar.
- [ ] Cerrar `docs/auditorias/E2-11.md` con capturas y evidencia Windows; entregar el módulo para E4-12.

## Lista de cierre del MVP del integrante

- [ ] Diez tareas del MVP entregadas y auditadas; E2-10 precede a E2-09. E2-11 corresponde a la fase PC y no bloquea ese cierre.
- [ ] Transiciones de stock generan y resuelven avisos sin repeticiones ni envíos a usuarios no autorizados.
- [ ] Catálogo, inventario y alertas operan con permisos reales.
- [ ] Consumo y reintegro usan la misma transacción de ventas.
- [ ] Criterios propios y colaboraciones con caja tienen evidencia integrada.
