# Instrucciones del integrante 4: ventas y reportes

Leer primero [AGENTS.md general](../../AGENTS.md), [spec.md](../../spec.md) y [plan propio](plan.md). Estas reglas complementan las universales.

## Responsabilidad y límites

Eres responsable de órdenes, Punto de Venta móvil, cobro, cancelación comercial, comprobantes, historial y reportes. Tus tablas son `ordenes` y `orden_detalle`. La app debe funcionar en Android e iOS; el BackOffice también está dentro de la app.

Orquestas inventario y promociones por sus contratos. No duplicas cálculos de descuentos, reglas de recetas ni escrituras de inventario. Las proyecciones de reportes que lean otros módulos se acuerdan con sus propietarios.

## Reglas de estructura

- Mantén estados y reglas de orden/cancelación en `dominio/`.
- Coloca confirmación y cancelación en casos de uso explícitos de `aplicacion/`; son dueños de la transacción completa.
- Aísla persistencia de órdenes, idempotencia y consultas en `infraestructura/`.
- Separa pantallas y view models Dart/Flutter en `frontend/lib/src/presentacion/` de adaptadores TypeScript/NestJS en `backend/src/interfaz/`. Las capas de servidor mencionadas aquí pertenecen a `backend/src/`.
- La interfaz muestra los cálculos del servidor. Una vista previa local no autoriza cobros ni consumos.

## Invariantes obligatorias

- Borrador no reserva ni consume. Solo se cobra una orden no vacía con cantidades enteras positivas.
- Estados y transiciones son los de `spec.md`; una cancelada no se reabre y una pagada no se edita como borrador.
- La confirmación revalida permisos, catálogo, receta, promoción, precio e inventario antes de guardar todo atómicamente.
- Si cambia el importe o las condiciones que requieren aceptación, mostrar el nuevo resumen antes de confirmar. La consistencia debe verificarse de nuevo al aceptar.
- Misma clave y misma solicitud equivalen a recuperar el mismo resultado. Misma clave y distinto contenido deben rechazarse. La confirmación simultánea de la misma orden no crea dos ventas ni dos conjuntos de movimientos.
- Se conserva un folio único y copias históricas de nombres, precios, promoción, descuentos y bonificaciones.
- Un solo método por venta; total cero válido usa `SIN_COBRO`. No integrar tarjetas, facturación, mesas ni crédito.
- Cancelar exige permiso y motivo; se coordina con inventario y no representa un reembolso bancario automático.
- Unidades no preparadas se reintegran desde consumos históricos. Unidades preparadas se clasifican como merma sin otra salida.
- Reportes separan cancelaciones, ventas vigentes y unidades entregadas/bonificadas.

## Móvil, conexión y respuesta incierta

Deshabilitar un botón durante el envío ayuda a la experiencia, pero no sustituye la idempotencia del servidor. Conservar de forma duradera la identidad de la operación en curso antes de enviarla, para recuperar su estado tras suspensión o cierre de la app.

Si se pierde la respuesta a un cobro, no generar otra clave ni mostrar «venta fallida» como si fuera seguro que nada ocurrió. Consultar o reintentar la operación existente y mostrar estado pendiente de verificación hasta obtener un resultado fiable. Esto es recuperación de una operación en curso, no modo de ventas sin conexión.

## Auditoría obligatoria

Por cada tarea, completar `docs/auditorias/<ID>.md`. Revisor principal: integrante 3. El integrante 2 participa obligatoriamente en cobro, cancelación y pruebas de stock concurrente; el 1 revisa autorización y sesión.

Probar fallos entre la escritura de orden y movimientos, dos dispositivos compitiendo por el mismo stock, doble confirmación, claves reutilizadas, reintentos después de una respuesta perdida, suspensión/reanudación y cancelación repetida. Usar la base de datos real para verificar atomicidad y concurrencia.

Las verificaciones de interfaz incluyen Android e iOS. El comprobante se muestra en la app y usa impresión nativa cuando esté disponible, sin integrar hardware específico. No aprobar el historial usando nombres y precios actuales del catálogo: comprobar cambios posteriores y desactivaciones.

## Diseño y notificaciones de tu área

Aplicar la [guía visual](../../docs/diseno-interfaz.md) y los tokens del AGENTS general: Cupertino, Roboto y Material Symbols Rounded. El cobro usa acción verde, cancelación rojo, avisos de atención amarillo y navegación morado. Mostrar subtotal, ahorro y total con jerarquía clara. Los banners informativos no tapan controles de cobro ni reemplazan un error que requiere atención. Auditar capturas Android/iOS, texto ampliado y foco.

Guardar un único evento de cancelación junto con la orden y reintegros; publicar solo después del commit mediante el servicio común. Sus destinatarios son quienes pueden consultar todas las ventas y el cajero de la venta si puede consultar las propias, sin duplicar un destinatario que cumpla ambas reglas. No emitir un push por cada cobro normal. Abrir un aviso lleva al detalle autorizado y nunca ejecuta una cancelación desde la pantalla bloqueada. Fallar el proveedor de push no altera la transacción de venta.

## Stack y fase PC

Seguir las guías de [frontend Dart/Flutter](frontend/README.md) y [backend TypeScript/NestJS](backend/README.md). Ventas inicia un `QueryRunner` de TypeORM y comparte su contexto con inventario, evaluación consistente y eventos. PostgreSQL es la única persistencia operativa; importes exactos se transmiten mediante DTO como cadenas.

Conservar la operación en curso mediante un puerto de almacenamiento por plataforma. E4-12 entrega la adaptación Windows después del MVP: teclado/ratón, catálogo y carrito en paneles cuando el espacio lo permita, comprobantes y concurrencia móvil/PC. El sistema operativo del cliente no concede permisos adicionales. Auditar rollback, idempotencia y lectura de historial desde ambos clientes.
