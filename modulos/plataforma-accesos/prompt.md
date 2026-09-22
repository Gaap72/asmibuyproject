# Prompt para el integrante 1: plataforma y accesos

Trabaja como asistente de desarrollo del integrante 1 en `C:\Análisis de diseño de software\Proyecto`. Si el equipo usa otra copia del repositorio, toma su raíz equivalente. Implementa la parte asignada siguiendo los documentos existentes y respetando el trabajo de los otros tres integrantes.

## Lectura inicial obligatoria

Lee [spec.md](../../spec.md), [AGENTS.md general](../../AGENTS.md), [organización](../../README.md), [AGENTS.md local](AGENTS.md) y [plan.md propio](plan.md). Consulta también la [decisión de stack](../../docs/decisiones/0001-stack-y-plataformas.md), [arquitectura](../../docs/arquitectura-tecnica.md), [guía visual](../../docs/diseno-interfaz.md), [matriz de aceptación](../../docs/matriz-aceptacion.md) y las guías de [frontend](frontend/README.md) y [backend](backend/README.md). El prompt orienta el arranque; la especificación, las reglas y el plan conservan sus responsabilidades y criterios completos.

## Tu responsabilidad

Desarrolla la base ejecutable, autenticación, sesiones, usuarios, roles y permisos, bitácora, componentes visuales comunes, centro de Avisos, entrega push, herramientas de integración y respaldo/restauración. Mantén tu frontend y backend en este módulo y coordina las carpetas `app/` y `compartido/` según sus guías. Integra los paquetes de los cuatro integrantes en una sola app y una sola API.

Usa Dart + Flutter, TypeScript estricto + NestJS, PostgreSQL + TypeORM y decimal.js. El MVP es Android e iOS, con preparación para Windows. Respeta Cupertino, Roboto, Material Symbols Rounded y los tokens de color comunes.

Publica contratos pequeños para identidad, permisos, errores, transacciones, auditoría, composición visual y eventos. El contexto de transacción permitirá un único commit o rollback para venta, inventario y eventos. Los permisos se validan en servidor; protege la última cuenta administradora activa. Los eventos se guardan con la operación y el push se procesa después del commit, sin secretos ni datos sensibles en avisos de pantalla bloqueada.

## Cómo comenzar y avanzar

1. Inspecciona el estado real del proyecto y los cambios existentes antes de editar; no reinicialices ni sobrescribas trabajo previo.
2. Empieza por E1-01: fija versiones compatibles, entornos, convenciones y contratos. Registra los acuerdos pendientes con sus responsables sin inventar aprobaciones.
3. Continúa con E1-02 y las demás tareas móviles E1-01 a E1-11 según sus dependencias. Entrega pronto los contratos y la base visual que necesitan los otros integrantes.
4. Coordina interfaces de transacción con los integrantes 2 y 4; cada propietario mantiene sus reglas y migraciones. Las capacidades móviles deben quedar aisladas para conservar portabilidad.
5. Mantén E1-12 como fase posterior de Windows. La comprobación temprana de compilación Windows de E1-02 sí pertenece a la preparación técnica; no equivale a entregar PC.

## Auditoría y entrega por tarea

Antes de implementar cada tarea, crea o actualiza `docs/auditorias/<ID>.md` usando la [plantilla](../../docs/auditorias/plantilla.md). Registra estructura, permisos, datos, comprobaciones aplicables y evidencia real. Para pantallas, actualiza el seguimiento visual y verifica Android e iOS; si un entorno falta, déjalo pendiente.

Tu revisor principal es el integrante 4; el contexto transaccional requiere además al integrante 2. No marques terminada una tarea sin evidencia y revisión independiente efectiva. Si falta revisión, déjala en revisión y avanza en trabajo independiente permitido. Para documentación basta una revisión documental reproducible.

Al entregar, indica ID, cambios y rutas, contratos disponibles, verificaciones realmente ejecutadas, resultados, hallazgos, dependencias pendientes y siguiente tarea viable. No amplíes el alcance, no sustituyas el stack y no declares pruebas o aprobaciones que no ocurrieron. Comienza con la lectura e inspección y desarrolla la primera tarea viable.
