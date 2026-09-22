# Prompt para el integrante 3: descuentos y promociones

Trabaja como asistente de desarrollo del integrante 3 en `C:\Análisis de diseño de software\Proyecto`. Si el equipo usa otra copia del repositorio, toma su raíz equivalente. Implementa la parte asignada siguiendo los documentos existentes y respetando el trabajo de los otros tres integrantes.

## Lectura inicial obligatoria

Lee [spec.md](../../spec.md), [AGENTS.md general](../../AGENTS.md), [organización](../../README.md), [AGENTS.md local](AGENTS.md) y [plan.md propio](plan.md). Consulta también la [decisión de stack](../../docs/decisiones/0001-stack-y-plataformas.md), [arquitectura](../../docs/arquitectura-tecnica.md), [guía visual](../../docs/diseno-interfaz.md), [matriz de aceptación](../../docs/matriz-aceptacion.md) y las guías de [frontend](frontend/README.md) y [backend](backend/README.md). El prompt orienta el arranque; la especificación, las reglas y el plan conservan sus responsabilidades y criterios completos.

## Tu responsabilidad

Desarrolla administración móvil y API de descuentos por porcentaje, monto fijo y promociones NxM, incluyendo 2×1 y 3×1. Permite la vigencia temporal o permanente, activación, suspensión y retiro con conservación del historial según la especificación. Mantén modelos, migraciones, motor de cálculo, pantallas y verificaciones en tu módulo.

Usa Dart + Flutter, TypeScript estricto + NestJS, PostgreSQL + TypeORM y decimal.js. El MVP es Android e iOS, con preparación para Windows. Respeta Cupertino, Roboto, Material Symbols Rounded y los tokens de color comunes. Muestra explícitamente el tipo, vigencia y relación N/M.

El motor económico se ejecuta únicamente en el servidor. Selecciona una sola promoción por venta con el mayor ahorro efectivo y desempate determinista. Usa decimales exactos, distribuye centavos según la especificación y conserva la cantidad entregada, incluidas las unidades gratuitas. Implementa agrupación, mezcla, sobrantes y bonificaciones NxM exactamente como se definieron. Entrega a ventas los totales, desglose por partida y copia histórica de la promoción aplicada.

La vigencia usa la hora del servidor. Emite los eventos de inicio, fin y suspensión/retiro previstos, con deduplicación y procesamiento independiente de que la app esté abierta. Usa el mecanismo transaccional y la entrega común del integrante 1.

## Cómo comenzar y avanzar

1. Inspecciona el estado real del proyecto y los cambios existentes antes de editar; no reinicialices ni sobrescribas trabajo previo.
2. Empieza por E3-01: define modelo, contrato económico, entradas, salidas y ejemplos. Acuerda catálogo con el integrante 2, cotización y copia histórica con el 4, y tipos/eventos con el 1.
3. Continúa con las tareas móviles E3-01 a E3-09 según sus dependencias. E3-09 debe integrarse antes del cierre E3-08.
4. Si falta un productor, avanza en reglas puras, contratos o trabajo independiente. Identifica las simulaciones y reserva la aceptación integrada para los módulos reales.
5. Coordina cambios comunes con el integrante 1. Mantén E3-10 como fase posterior de Windows, reutilizando el mismo motor del servidor.

## Auditoría y entrega por tarea

Antes de implementar cada tarea, crea o actualiza `docs/auditorias/<ID>.md` usando la [plantilla](../../docs/auditorias/plantilla.md). Verifica estructura, permisos y casos conocidos: inicio inclusivo, fin exclusivo, permanentes, 100 %, monto superior a la base, empates, mezcla, sobrantes y centavos. Calcula resultados esperados independientes de la función probada. Para pantallas, actualiza el seguimiento visual y verifica Android e iOS; si un entorno falta, déjalo pendiente.

Tu revisor principal es el integrante 2; el integrante 4 revisa además el contrato económico y la integración al cobro. No marques terminada una tarea sin evidencia y revisión independiente efectiva. Si falta revisión, déjala en revisión y avanza en trabajo independiente permitido. Para documentación basta una revisión documental reproducible.

Al entregar, indica ID, cambios y rutas, contratos disponibles, verificaciones realmente ejecutadas, resultados, hallazgos, dependencias pendientes y siguiente tarea viable. No cobres, guardes órdenes ni escribas movimientos de inventario desde este módulo; no declares pruebas o aprobaciones que no ocurrieron. Comienza con la lectura e inspección y desarrolla la primera tarea viable.
