# Instrucciones del integrante 2: catálogo e inventario

Leer primero [AGENTS.md general](../../AGENTS.md), [spec.md](../../spec.md) y [plan propio](plan.md). Estas reglas complementan las universales.

## Responsabilidad y límites

Eres responsable de ingredientes, platillos, recetas, movimientos, disponibilidad, alertas y reintegros de ingredientes. Tus tablas son `ingredientes`, `platillos`, `receta_detalle` y `movimientos_inventario`.

No implementes cobros, selección de promociones ni cancelaciones comerciales. Ventas solicita consumo o reintegro por un contrato; inventario valida y registra sus efectos dentro de la transacción que recibe.

## Reglas de estructura

- Mantén demanda de ingredientes, límites de stock y condición de alerta en `dominio/`.
- Coloca entradas, ajustes, mermas, consumo y reintegro en casos de uso de `aplicacion/`.
- Encapsula persistencia, bloqueos y saldos auxiliares en `infraestructura/`.
- Coloca pantallas y view models Dart/Flutter en `frontend/lib/src/presentacion/`, y controladores TypeScript/NestJS en `backend/src/interfaz/`. Las demás capas del servidor aquí mencionadas pertenecen a `backend/src/`. No crear administración web.
- Expón consultas de catálogo y existencias y operaciones de inventario mediante contratos explícitos. No permitas que otros módulos escriban directamente los movimientos.

## Invariantes obligatorias

- Unidades base coherentes, cantidades decimales exactas y unidad inmutable cuando existen movimientos o recetas.
- Receta válida por platillo activo, cantidades positivas y una sola línea por ingrediente.
- Crear o editar recetas no cambia existencias ni reinterpreta consumos históricos.
- Ningún movimiento confirmado se borra o reescribe para corregir saldos: se compensa y se conserva el origen.
- Se valida la demanda conjunta de ingredientes compartidos por toda la orden.
- Borradores no reservan stock. Las unidades gratuitas consumen igual que las cobradas.
- Bajo stock significa existencia menor o igual al umbral individual cuando la alerta está activa. Agotado tiene prioridad a cero; una alerta desactivada no oculta la existencia ni el agotamiento.
- El reintegro usa el consumo histórico de la partida y no supera lo consumido o lo que queda sin reintegrar.
- Una preparación clasificada como merma después de cancelar una venta no genera otro consumo.
- Las operaciones convocadas desde el cobro o cancelación usan el mismo contexto de transacción de ventas, sin commit independiente.

## Auditoría obligatoria

Por cada tarea, completar `docs/auditorias/<ID>.md`. Revisor principal: integrante 1. El integrante 4 revisa adicionalmente los contratos de consumo y reintegro.

Verificar límites exactos de stock, cero, cantidades compartidas entre platillos, rechazo sin escrituras parciales, permisos de ajuste, cambios de umbral, ingredientes inactivos y unidad inmutable. Para concurrencia y rollback usar la base de datos real acordada.

No presentar una pantalla actualizada como prueba de integridad del inventario. Contrastar movimientos y saldo. Una alerta visible no debe impedir vender si hay ingredientes suficientes. Los CA dependientes de caja se verifican de nuevo con ventas integrada antes del cierre del módulo.

Comprobar formularios con teclado móvil, cantidades decimales, listas legibles y actualizaciones al reanudar la app. Las alertas se muestran en el BackOffice y el centro de Avisos y producen push a través del servicio común cuando corresponda. Si falta conexión, no simular que un ajuste se guardó ni encolar escrituras para una sincronización fuera del alcance.

## Diseño y notificaciones de tu área

Aplicar la [guía visual](../../docs/diseno-interfaz.md) y los tokens del AGENTS general: Cupertino, Roboto y Material Symbols Rounded. Bajo stock utiliza amarillo con texto oscuro; agotado utiliza rojo con etiqueta e icono. No confundir una advertencia con un bloqueo de venta. Auditar contraste, cantidades largas, texto ampliado y capturas Android/iOS.

Producir eventos solo al entrar en bajo stock, entrar o empeorar a agotado y resolver la condición según `spec.md`. Un episodio no genera un push por cada movimiento. Guardar el evento dentro de la misma transacción y delegar entrega/destinatarios al servicio del integrante 1. Para un paso directo de suficiente a agotado emitir un solo evento; la resolución actualiza el aviso sin nuevo push. Leer el aviso no resuelve el stock.

## Stack y fase PC

Implementar el [frontend Dart/Flutter](frontend/README.md) y el [backend TypeScript/NestJS](backend/README.md). Persistir con PostgreSQL/TypeORM y cantidades exactas con decimal.js. El consumo y reintegro reciben el contexto transaccional compartido, sin usar repositorios globales fuera de él.

Separar formularios y estado de adaptadores del dispositivo. E2-11 reutiliza esos componentes y la misma API para Windows, con teclado, ratón y distribución de lista/detalle. Auditar que operar desde PC y móvil no crea saldos distintos ni una base local alternativa. Esta entrega es posterior al MVP móvil.
