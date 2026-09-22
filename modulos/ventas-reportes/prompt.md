# Prompt para el integrante 4: Punto de Venta y reportes

Trabaja como asistente de desarrollo del integrante 4 en `C:\Análisis de diseño de software\Proyecto`. Si el equipo usa otra copia del repositorio, toma su raíz equivalente. Implementa la parte asignada siguiendo los documentos existentes y respetando el trabajo de los otros tres integrantes.

## Lectura inicial obligatoria

Lee [spec.md](../../spec.md), [AGENTS.md general](../../AGENTS.md), [organización](../../README.md), [AGENTS.md local](AGENTS.md) y [plan.md propio](plan.md). Consulta también la [decisión de stack](../../docs/decisiones/0001-stack-y-plataformas.md), [arquitectura](../../docs/arquitectura-tecnica.md), [guía visual](../../docs/diseno-interfaz.md), [matriz de aceptación](../../docs/matriz-aceptacion.md) y las guías de [frontend](frontend/README.md) y [backend](backend/README.md). El prompt orienta el arranque; la especificación, las reglas y el plan conservan sus responsabilidades y criterios completos.

## Tu responsabilidad

Desarrolla órdenes, carrito, cotización, confirmación de cobro, cancelaciones, comprobantes, historial y reportes básicos. Implementa el Punto de Venta móvil y las pantallas de tu área de BackOffice, junto con API, persistencia, migraciones y verificaciones.

Usa Dart + Flutter, TypeScript estricto + NestJS, PostgreSQL + TypeORM y decimal.js. El MVP es Android e iOS, con preparación para Windows. Respeta Cupertino, Roboto, Material Symbols Rounded y los tokens de color comunes. Presenta subtotal, ahorro y total con claridad; usa los estados de carga y recuperación acordados.

Ventas es responsable de la transacción completa de confirmación y cancelación. Consume inventario del integrante 2 y promociones del 3 mediante contratos; comparte contexto transaccional con movimientos y eventos. Revalida permisos, catálogo, precios, recetas, promoción y existencias. Si las condiciones cambian, obtiene la aceptación requerida antes de confirmar.

Conserva importes, nombres, reglas y consumos históricos. Implementa atomicidad e idempotencia: un reintento equivalente recupera el resultado, una clave reutilizada con otro contenido se rechaza y la respuesta perdida no provoca un cobro nuevo. Guarda la identidad de la operación en curso antes de enviarla. La app requiere conexión; esto no habilita ventas sin conexión.

Cancela solo con permiso y motivo. Coordina reintegros desde consumos históricos y evita otro descuento por preparaciones clasificadas como merma. Registra el evento de cancelación en la misma transacción y usa el servicio común para avisos, sin emitir push por cada venta normal.

## Cómo comenzar y avanzar

1. Inspecciona el estado real del proyecto y los cambios existentes antes de editar; no reinicialices ni sobrescribas trabajo previo.
2. Empieza por E4-01: define órdenes y contratos de cotización, confirmación, recuperación y cancelación. Coordina la transacción con los integrantes 1 y 2 y el contrato económico con el 3.
3. Continúa con las tareas móviles E4-01 a E4-11 según sus dependencias. E4-11 debe integrarse antes del cierre E4-10.
4. Si falta una dependencia, avanza en contratos o trabajo independiente. Identifica las simulaciones; no reimplementes motores ajenos para sustituir una integración pendiente.
5. Coordina cambios comunes con el integrante 1. Mantén E4-12 como fase posterior de Windows, después de sus dependencias y con comprobación de operación simultánea móvil/PC.

## Auditoría y entrega por tarea

Antes de implementar cada tarea, crea o actualiza `docs/auditorias/<ID>.md` usando la [plantilla](../../docs/auditorias/plantilla.md). Verifica estructura, permisos y datos. Usa PostgreSQL real para rollback, doble confirmación, concurrencia por el último stock y cancelación repetida. Comprueba respuesta perdida, suspensión/reanudación e historial después de cambiar catálogo o recetas. Para pantallas, actualiza el seguimiento visual y verifica Android e iOS; si un entorno falta, déjalo pendiente.

Tu revisor principal es el integrante 3. El integrante 2 participa en cobro, cancelación y concurrencia de stock; el 1 revisa autorización y sesión. No marques terminada una tarea sin evidencia y revisión independiente efectiva. Si falta revisión, déjala en revisión y avanza en trabajo independiente permitido. Para documentación basta una revisión documental reproducible.

Al entregar, indica ID, cambios y rutas, contratos disponibles, verificaciones realmente ejecutadas, resultados, hallazgos, dependencias pendientes y siguiente tarea viable. No amplíes el alcance a pasarelas de pago, facturación o sincronización sin conexión, ni declares pruebas o aprobaciones que no ocurrieron. Comienza con la lectura e inspección y desarrolla la primera tarea viable.
