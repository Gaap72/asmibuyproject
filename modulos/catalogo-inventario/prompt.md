# Prompt para el integrante 2: catálogo e inventario

Trabaja como asistente de desarrollo del integrante 2 en `C:\Análisis de diseño de software\Proyecto`. Si el equipo usa otra copia del repositorio, toma su raíz equivalente. Implementa la parte asignada siguiendo los documentos existentes y respetando el trabajo de los otros tres integrantes.

## Lectura inicial obligatoria

Lee [spec.md](../../spec.md), [AGENTS.md general](../../AGENTS.md), [organización](../../README.md), [AGENTS.md local](AGENTS.md) y [plan.md propio](plan.md). Consulta también la [decisión de stack](../../docs/decisiones/0001-stack-y-plataformas.md), [arquitectura](../../docs/arquitectura-tecnica.md), [guía visual](../../docs/diseno-interfaz.md), [matriz de aceptación](../../docs/matriz-aceptacion.md) y las guías de [frontend](frontend/README.md) y [backend](backend/README.md). El prompt orienta el arranque; la especificación, las reglas y el plan conservan sus responsabilidades y criterios completos.

## Tu responsabilidad

Desarrolla ingredientes, platillos, recetas, existencias, entradas, ajustes, mermas, disponibilidad, reintegros y alertas con mínimo configurable por ingrediente. Implementa las pantallas del BackOffice, API, persistencia, migraciones y verificaciones de esta área dentro de su frontend y backend.

Usa Dart + Flutter, TypeScript estricto + NestJS, PostgreSQL + TypeORM y decimal.js. El MVP es Android e iOS, con preparación para Windows. Respeta Cupertino, Roboto, Material Symbols Rounded y los tokens de color comunes; bajo stock lleva amarillo con texto oscuro y agotado rojo, siempre con texto o icono.

Publica consultas de catálogo/precios y contratos de disponibilidad, consumo y reintegro. Valida la demanda conjunta de ingredientes de toda la orden; las unidades gratuitas también consumen. Las operaciones invocadas por ventas comparten su transacción, sin commit independiente. Conserva movimientos y consumos históricos, evita saldos negativos y no vuelvas a descontar preparaciones clasificadas como merma al cancelar.

Aplica bajo stock cuando la existencia sea menor o igual al umbral individual activo. Emite eventos por transición o episodio conforme a la especificación, sin repetir un aviso por cada movimiento. Guarda el evento en la misma transacción y usa el servicio común del integrante 1 para el centro interno y push.

## Cómo comenzar y avanzar

1. Inspecciona el estado real del proyecto y los cambios existentes antes de editar; no reinicialices ni sobrescribas trabajo previo.
2. Empieza por E2-01: define datos y contratos. Acuerda consumo y reintegro con el integrante 4, catálogo con el 3 y permisos/eventos con el 1.
3. Continúa con las tareas móviles E2-01 a E2-10 según sus dependencias, sin confundir orden numérico con orden de ejecución. E2-10 debe integrarse antes del cierre E2-09.
4. Si falta la base E1-02 u otro productor, avanza en contratos o trabajo independiente. Identifica expresamente las simulaciones y no presentes una integración simulada como validación definitiva.
5. Coordina los cambios comunes con el integrante 1. Mantén E2-11 como fase posterior de Windows; prepara componentes reutilizables desde el MVP.

## Auditoría y entrega por tarea

Antes de implementar cada tarea, crea o actualiza `docs/auditorias/<ID>.md` usando la [plantilla](../../docs/auditorias/plantilla.md). Comprueba estructura, cantidades exactas, permisos, límites de stock, umbrales e historial. Para atomicidad, concurrencia y rollback usa PostgreSQL real. Para pantallas, actualiza el seguimiento visual y verifica Android e iOS; si un entorno falta, déjalo pendiente.

Tu revisor principal es el integrante 1; el integrante 4 revisa además consumo y reintegro. No marques terminada una tarea sin evidencia y revisión independiente efectiva. Si falta revisión, déjala en revisión y avanza en trabajo independiente permitido. Para documentación basta una revisión documental reproducible.

Al entregar, indica ID, cambios y rutas, contratos disponibles, verificaciones realmente ejecutadas, resultados, hallazgos, dependencias pendientes y siguiente tarea viable. No implementes reglas de cobro o selección de promociones, ni declares pruebas o aprobaciones que no ocurrieron. Comienza con la lectura e inspección y desarrolla la primera tarea viable.
