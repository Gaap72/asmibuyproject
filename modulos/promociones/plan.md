# Plan del integrante 3: descuentos y promociones

Estado inicial: pendiente. Responsable personal: por asignar. Revisor principal: integrante 2; integrante 4 para el contrato de cobro.

## Resultado a entregar

El dueño podrá administrar descuentos y promociones desde la app móvil Android/iOS. Caja consumirá un único cálculo del servidor para seleccionar y aplicar correctamente porcentaje, monto fijo, 2×1, 3×1, 3×2 y otras relaciones NxM permitidas.

Leer [reglas locales](AGENTS.md), [reglas generales](../../AGENTS.md) y [matriz CA](../../docs/matriz-aceptacion.md). Usar la [plantilla](../../docs/auditorias/plantilla.md) por tarea. No desarrollar cobros ni inventario dentro de este módulo.

## Stack y separación de implementación

Frontend: **Dart + Flutter** en [frontend/](frontend/README.md), especialmente E3-06. Backend: **TypeScript + NestJS**, **PostgreSQL/TypeORM** y **decimal.js** en [backend/](backend/README.md). El motor de precios se ejecuta solo en servidor y se expone mediante contratos/DTO OpenAPI con importes decimales como cadenas.

Las nueve tareas originales entregan el MVP Android/iOS. E3-10 es una adaptación Windows posterior, sin copiar el motor de cálculo a Dart.

## E3-01 — Definir modelo y contrato económico

Dependencias: lectura de la especificación; trabajar en paralelo con E1-01 y E2-01.

- [ ] Definir promociones y participantes, restricciones de cada tipo, duración y estados administrativos.
- [ ] Documentar la evaluación de partidas: identificador estable, precio original, cantidad, instante de servidor y candidatos elegibles.
- [ ] Definir salida: subtotal, descuento total, total final, descuento y bonificaciones por partida y copia de promoción aplicada.
- [ ] Expresar el contrato en OpenAPI/DTO y fijar precisión y redondeo de decimal.js, evitando conversiones intermedias a `number`.
- [ ] Acordar con el integrante 4 cómo se detecta una cotización obsoleta y con el 2 cómo se obtiene el catálogo de participantes.
- [ ] Cerrar `docs/auditorias/E3-01.md` con revisión del contrato, ejemplos y tipos monetarios.

## E3-02 — Implementar administración y vigencias

Dependencias: E3-01 y E1-02; integrar permisos E1-04 y bitácora E1-06 antes de entregar administración operativa. Responsable de CA-12 y CA-13.

- [ ] Crear migraciones y operaciones para crear, editar, activar, desactivar y retirar promociones.
- [ ] Validar fechas temporales, permanencia sin vencimiento, campos del tipo y participantes existentes.
- [ ] Calcular vigencia con hora del servidor y límites de inicio inclusivo y fin exclusivo, sin depender del reloj del teléfono.
- [ ] Registrar autoría y cambios; conservar promociones retiradas para referencias históricas e impedir reactivarlas.
- [ ] Verificar límites temporales y suspensión manual; cerrar `docs/auditorias/E3-02.md`. Completar luego CA-12 con la revalidación real de cobro.

## E3-03 — Implementar porcentaje y monto fijo

Dependencias: E3-01 y tipos monetarios de E1-01. Responsable de CA-14 y CA-15; colabora en CA-26.

- [ ] Calcular porcentaje sobre toda la venta o solo unidades de los platillos participantes.
- [ ] Calcular monto fijo una vez por orden o por unidad elegible, según el alcance.
- [ ] Limitar el ahorro a su base sin importes negativos; admitir 100 % válido y total cero.
- [ ] Aplicar redondeo decimal definido y mantener separación entre subtotal original y descuento.
- [ ] Comprobar $200 al 15 % = $170, límites de monto, varias unidades y 100 %; cerrar `docs/auditorias/E3-03.md`.

## E3-04 — Implementar promociones por cantidad

Dependencias: E3-01. Responsable de CA-16, CA-17, CA-18 y CA-19.

- [ ] Validar enteros `N > M >= 1` y formar grupos por platillo cuando no se permite combinar.
- [ ] Implementar mezcla de participantes por precio descendente con desempate estable y sobrantes a precio normal.
- [ ] Devolver las unidades bonificadas de cada partida sin reducir las cantidades entregadas.
- [ ] Verificar 5×$100 en 2×1 = $300, 4×$100 en 3×1 = $200, 3×$100 en 3×2 = $200 y mezcla $100/$90/$80/$70/$60 = $240, variando el orden de captura.
- [ ] Cerrar `docs/auditorias/E3-04.md`; la parte de consumo de CA-16 se comprueba con inventario y caja integrados.

## E3-05 — Seleccionar la promoción y distribuir descuentos

Dependencias: E3-02, E3-03 y E3-04. Responsable de CA-20 y CA-22.

- [ ] Evaluar todos los candidatos elegibles sobre precios originales y aplicar únicamente el mayor ahorro efectivo.
- [ ] Resolver empates por identificador y excluir candidatos que no produzcan beneficio aplicable.
- [ ] Distribuir descuentos generales proporcionalmente, asignar residuos por mayores restos y desempatar por partida.
- [ ] Atribuir bonificaciones y descuentos específicos a sus partidas y garantizar sumas exactas sin superar los subtotales.
- [ ] Verificar empates, mezcla de candidatos, importes pequeños y centavos residuales; cerrar `docs/auditorias/E3-05.md`.

## E3-06 — Desarrollar administración móvil de promociones

Dependencias: E3-02, catálogo de E2-02 y base de interfaz E1-07.

- [ ] Crear listado y formularios móviles con selección de tipo, valor, alcance y participantes.
- [ ] Incluir opción Temporal/Permanente, fecha y hora cuando correspondan y controles de N, M y mezcla para cantidad.
- [ ] Mostrar activa/desactivada/retirada y vigencia calculada; permitir las acciones autorizadas sin editar historial.
- [ ] Verificar formularios táctiles, teclado, validaciones, carga, error de conexión y protección de acciones en Android e iOS.
- [ ] Aplicar controles Cupertino, Roboto, Material Symbols Rounded y tokens; registrar capturas, contraste y texto ampliado en el seguimiento visual.
- [ ] Cerrar `docs/auditorias/E3-06.md` con evidencias de ambas plataformas, sin presentar una vista web como la app terminada.

## E3-07 — Integrar evaluación y copia histórica con caja

Dependencias: E3-05 y contrato E4-01; coordinar implementación con E4-03, que consume esta entrega.

- [ ] Exponer evaluación desde datos consistentes y definir su uso dentro de la transacción de confirmación, sin escribir órdenes ni movimientos.
- [ ] Entregar versión o huella verificable de la cotización y parámetros necesarios para mostrar al cajero un cambio de importe.
- [ ] Entregar nombre, tipo, reglas, bonificaciones y descuentos por partida que ventas guardará como copia histórica.
- [ ] Verificar con el contrato consumidor el vencimiento o edición entre cotización y cobro; no confiar en el descuento enviado por el móvil.
- [ ] Cerrar `docs/auditorias/E3-07.md` y apoyar E4-04/E4-07 para verificar vigencia e historial en una venta real.

## E3-08 — Auditar promociones integradas y cerrar el módulo

Dependencias: E3-06, E3-07, E3-09, E1-11, E4-04 y E4-07. No esperar al cierre E4-10.

- [ ] Ejecutar los casos del motor mediante la app Android/iOS y comprobar que el servidor decide el resultado.
- [ ] Verificar expiración, desactivación y cambios de reglas durante una orden abierta; exigir reconfirmación si cambia el importe.
- [ ] Verificar consumo de todas las unidades en NxM y conservación de una venta al editar o retirar la promoción después.
- [ ] Comprobar avisos internos y push de vigencia con la app cerrada, cambios de versión y permanentes sin falso vencimiento; colaborar en CA-35.
- [ ] Completar los CA propios 12 a 20 y 22 con los colaboradores, documentar límites y entregar datos de prueba para recuperación.
- [ ] Cerrar `docs/auditorias/E3-08.md` y entregar el contrato definitivo y evidencia reproducible.

## E3-09 — Producir notificaciones de vigencia

Dependencias: E3-02 y E1-10. Colabora en CA-34 y CA-35.

- [ ] Emitir eventos de inicio/fin, activación permanente y desactivación/retiro de una promoción vigente; no emitir por ediciones rutinarias sin transición.
- [ ] Evaluar vigencias desde un proceso de servidor con intervalo inicial de un minuto, aunque la app no esté abierta; conservar precisión inmediata del cálculo de cobro.
- [ ] Usar claves por promoción, versión y transición, reevaluar mensajes pendientes y descartar inicios obsoletos tras editar o terminar una promoción.
- [ ] Usar bandeja transaccional y destinatarios con permiso de consultar promociones; no programar expiraciones para promociones permanentes.
- [ ] Verificar reinicio del proceso, retraso, duplicados, rollback y cambios de fecha; cerrar `docs/auditorias/E3-09.md` y completar entrega real en E3-08.

## E3-10 — Fase PC: administrar promociones desde Windows

Dependencias: E1-12 y E3-08. Fase posterior al MVP; criterio PC-03.

- [ ] Reutilizar formularios y repositorios Flutter con distribución adaptable, teclado, ratón y selección accesible de fechas/participantes.
- [ ] Consumir el mismo backend NestJS para porcentaje, monto fijo, NxM y vigencias; no añadir un motor de precios de escritorio.
- [ ] Contrastar respuestas para los mismos datos e instante desde cliente móvil y Windows, incluyendo centavos, sobrantes, mezcla y promociones permanentes.
- [ ] Verificar edición, activación y retiro desde PC y lectura histórica inalterada, incluyendo avisos autorizados.
- [ ] Cerrar `docs/auditorias/E3-10.md` con evidencia Windows y resultados exactos; entregar el módulo para E4-12.

## Lista de cierre del MVP del integrante

- [ ] Nueve tareas del MVP entregadas y auditadas; E3-09 precede a E3-08. E3-10 corresponde a la fase PC y no bloquea ese cierre.
- [ ] Avisos de vigencia integrados sin depender del reloj o ejecución del teléfono.
- [ ] Administración de promociones utilizable en Android e iOS.
- [ ] Un motor de cálculo en servidor, sin acumulación ni duplicación en caja.
- [ ] Vigencias, NxM, centavos e historial verificados con los módulos reales.
