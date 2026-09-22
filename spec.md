# Especificación del MVP: Punto de Venta y BackOffice

- Versión: 1.3.
- Fecha de actualización: 2026-09-20.
- Estado: alcance funcional consolidado para implementación.
- Destino solicitado: `C:\Análisis de diseño de software\Proyecto\spec.md`.

## 1. Objetivo y límites

Desarrollar una aplicación para trabajadores de un negocio de alimentosy bebidas, con un MVP en Android/iOS y arquitectura preparada para una segunda fase en PC. La app permitirá vender platillos desde un Punto de Venta y administrar recetas, ingredientes, inventario, promociones, usuarios, permisos y reportes desde un BackOffice, ambos dentro del mismo cliente Flutter.

Ambas áreas compartirán la misma información y las mismas reglas de negocio. El acceso requerirá una cuenta interna activa; no existirá registro público ni una interfaz para clientes. No se desarrollará un panel web. La aplicación Windows, tomada como primer destino PC, se planifica como una ampliación posterior que reutiliza el frontend y la API, sin exigirla para cerrar el MVP móvil.

La aplicación se conectará a una API de servidor y una base de datos central, responsables de permisos, precios, promociones, inventario y transacciones. Móviles y posteriormente PC compartirán esa API, sin bases operativas independientes por dispositivo. El MVP requiere conexión para consultar y modificar los datos; no incluye ventas sin conexión ni sincronización posterior.

Las plataformas móviles objetivo confirmadas son Android e iOS. Se utilizará Dart con Flutter para ambas y para preparar el crecimiento a escritorio. Todas las pantallas deberán poder utilizarse mediante interacción táctil y adaptarse a los tamaños de pantalla soportados. La composición y navegación serán de estilo Cupertino, con fuente Roboto, iconografía Material Symbols Rounded y paleta verde, morado, rojo y amarillo con superficies suaves. La guía normativa está en `AGENTS.md` y su seguimiento en `docs/diseno-interfaz.md`.

La app incluirá un centro interno de notificaciones y avisos push fuera de la aplicación para eventos operativos relevantes. Esta ampliación solicitada sustituye la exclusión anterior de notificaciones externas del sistema operativo. No implica incorporar correo, SMS ni mensajería.

El MVP contempla una sucursal, venta directa en caja y descuento de ingredientes al confirmar el cobro. No contempla mesas, cuentas abiertas ni un flujo operativo de cocina. Una orden en borrador representa una venta que el cajero está preparando, no una cuenta de mesa.

Este documento consolida lo acordado. Las precisiones sobre cálculos, cancelaciones, trazabilidad, concurrencia y validación complementan las áreas existentes; no agregan módulos de negocio nuevos. El stack definido es Dart/Flutter para el frontend, TypeScript/NestJS para el backend y PostgreSQL con TypeORM para persistencia. La decisión y estructura están en `docs/decisiones/0001-stack-y-plataformas.md` y `docs/arquitectura-tecnica.md`; el proveedor de alojamiento se decidirá al preparar el entorno.

## 2. Usuarios, roles y permisos

### 2.1 Cuentas internas

- Un usuario autorizado podrá crear cuentas, asignarles un rol y activarlas o desactivarlas.
- Cada usuario tendrá un único rol en el MVP. Cada rol podrá reunir varios permisos.
- Cada cuenta tendrá un identificador de acceso único y una contraseña almacenada mediante un mecanismo de hash seguro, nunca en texto plano.
- Existirá un mecanismo para que un administrador establezca o restablezca la contraseña de una cuenta interna. No se requieren correo electrónico ni servicios de mensajería.
- El historial conservará al trabajador que ejecutó cada operación, aunque después su cuenta quede desactivada.
- Una cuenta desactivada no podrá iniciar sesión ni ejecutar nuevas operaciones mediante una sesión existente.

### 2.2 Roles configurables

Los siguientes roles servirán como configuración inicial, no como una lista cerrada:

| Rol inicial | Accesos iniciales |
| --- | --- |
| Dueño / administrador | Administración de usuarios, roles, permisos, platillos, recetas, inventario, alertas, promociones, ventas y reportes. |
| Caja | Consulta de platillos, creación de órdenes, cobro y consulta de sus propias ventas. |
| Almacén | Consulta de ingredientes e inventario, registro de entradas, ajustes y mermas, consulta de alertas. |

El dueño podrá crear roles, editar sus permisos y asignarlos a las cuentas. Los permisos serán acciones definidas por el sistema: crear un rol no permitirá inventar funciones que el software no implemente.

Se protegerá la continuidad administrativa: no se permitirá desactivar o modificar la última cuenta activa con capacidad de administrar usuarios y roles de forma que el sistema quede sin administrador. La primera cuenta administradora se establecerá durante la instalación.

### 2.3 Permisos mínimos

| Área | Acciones independientes |
| --- | --- |
| Usuarios | Consultar, crear, editar, asignar rol, restablecer contraseña, activar y desactivar. |
| Roles | Consultar, crear, editar permisos y retirar roles sin usuarios asignados. |
| Platillos y recetas | Consultar, crear, editar y activar/desactivar. |
| Ingredientes | Consultar, crear, editar y activar/desactivar. |
| Inventario | Consultar existencias, registrar entradas, registrar ajustes y registrar mermas. |
| Alertas | Consultar alertas y configurar umbrales por ingrediente. |
| Ventas | Crear órdenes, cobrar, consultar ventas propias, consultar todas las ventas y cancelar ventas. |
| Promociones | Consultar, crear, editar, activar/desactivar y retirar. |
| Reportes | Consultar reportes básicos. |
| Notificaciones | Consultar avisos propios, marcarlos como leídos y configurar preferencias push propias; siempre sujetos al permiso del módulo de origen. |

Las pantallas y botones se mostrarán según los permisos. Además, el servidor validará identidad, estado de la cuenta, permiso y alcance de los datos en cada operación. Ocultar una opción en la interfaz no sustituye esa validación. Los cambios de permisos deberán surtir efecto en la siguiente operación protegida.

## 3. Platillos, ingredientes y recetas

### 3.1 Ingredientes

Cada ingrediente tendrá nombre, unidad base, estado activo, cantidad mínima de stock y configuración de alerta.

Las unidades base previstas son gramos, mililitros y piezas. Todas las entradas, recetas, salidas y umbrales de un ingrediente usarán su misma unidad. Por ejemplo, una compra de dos kilogramos de carne se registrará como 2,000 gramos. No se incluyen conversiones automáticas de unidades en este MVP.

Las cantidades admitirán precisión decimal cuando corresponda. Las existencias iniciales se registrarán como un movimiento de inventario, no como una modificación sin historial.

La unidad base no podrá cambiarse si el ingrediente ya tiene movimientos o participa en una receta. Esto evita reinterpretar existencias, umbrales y consumos históricos con una unidad diferente.

### 3.2 Platillos y recetas

Cada platillo tendrá nombre, descripción opcional, precio de venta mayor que cero, estado activo y una receta con al menos un ingrediente.

La receta indicará la cantidad necesaria de cada ingrediente para preparar una unidad del platillo. Un ingrediente podrá pertenecer a varias recetas; un platillo podrá contener varios ingredientes. No se permitirá repetir el mismo ingrediente en una receta: sus cantidades deberán consolidarse en una sola línea.

| Platillo | Ingrediente | Cantidad por unidad |
| --- | --- | --- |
| Hamburguesa | Pan | 1 pieza |
| Hamburguesa | Carne | 150 gramos |
| Hamburguesa | Queso | 1 pieza |

Crear o editar una receta no consumirá inventario. Vender dos hamburguesas con esta receta consumirá dos panes, 300 gramos de carne y dos piezas de queso.

Las cantidades de receta deberán ser positivas. No se podrá ofrecer un platillo activo sin una receta válida ni con ingredientes inactivos. Antes de desactivar un ingrediente utilizado por platillos activos, será necesario actualizar esas recetas o desactivar los platillos afectados; el sistema mostrará cuáles son.

Los cambios de precio o receta afectarán a cobros futuros. No modificarán las ventas ni los consumos previamente registrados. Si un cambio afecta una orden en borrador, el cajero deberá ver el cálculo actualizado antes de confirmar el cobro.

## 4. Inventario y alertas de bajo stock

### 4.1 Movimientos y existencias

El inventario se controlará por ingrediente. El historial de movimientos será la fuente de verdad de sus existencias:

`existencia actual = suma de entradas y reintegros − suma de consumos y otras salidas`

Se admitirán existencias iniciales, entradas, consumos por venta, ajustes positivos o negativos, mermas independientes y reintegros por cancelación. Cada movimiento registrará ingrediente, cantidad, unidad base, fecha y hora, responsable, tipo, motivo cuando corresponda y referencias a la venta o movimiento de origen.

Los ajustes y mermas requerirán un motivo. Los movimientos confirmados no se eliminarán ni se reemplazarán para ocultar una corrección: se registrará el movimiento compensatorio correspondiente. No se permitirán saldos negativos.

El consumo de una orden se calculará sumando los requerimientos de todos sus platillos. Si varios platillos comparten un ingrediente, la validación considerará la demanda combinada.

Crear una orden en borrador no reservará ni descontará inventario. Antes del cobro se validará nuevamente la disponibilidad. El stock bajo no bloqueará una venta si todavía existen ingredientes suficientes; la insuficiencia para preparar la orden sí la bloqueará.

### 4.2 Configuración por ingrediente

El dueño, o un rol al que otorgue el permiso correspondiente, podrá configurar individualmente:

- `alerta_stock_activa`: indica si deben mostrarse alertas para ese ingrediente.
- `stock_minimo`: cantidad no negativa, expresada en su unidad base.

No habrá un único umbral obligatorio para todo el inventario. Por ejemplo:

| Ingrediente | Unidad | Mínimo configurado | Condición de bajo stock |
| --- | --- | --- | --- |
| Carne | Gramos | 2,000 | Existencia menor o igual a 2,000 gramos. |
| Pan | Piezas | 20 | Existencia menor o igual a 20 piezas. |
| Leche | Mililitros | 1,000 | Existencia menor o igual a 1,000 mililitros. |

El campo `stock_minimo` será obligatorio cuando la alerta esté activada. Desactivar la alerta conservará su umbral para permitir reactivarla después.

### 4.3 Evaluación y visualización

- Con alerta activada, habrá bajo stock cuando `existencia_actual <= stock_minimo`.
- El sistema reevaluará la condición después de una venta, entrada, ajuste, merma, reintegro o cambio del umbral o de su activación.
- La alerta mostrará ingrediente, existencia actual, unidad y mínimo configurado.
- Permanecerá visible mientras continúe la condición, sin crear avisos duplicados por cada operación.
- Se resolverá cuando la existencia supere el mínimo o se desactive la alerta.
- Se mostrará en el panel principal del BackOffice y en la lista de ingredientes, según los permisos del usuario.

La lista distinguirá stock suficiente, stock bajo y agotado. Agotado tendrá prioridad visual cuando la existencia sea cero, incluso si el mínimo configurado es cero. Sin alertas activadas, se seguirá mostrando la cantidad disponible y la condición de agotado, pero no habrá avisos de bajo stock.

Las alertas se mostrarán en inventario y en el centro interno de Avisos; los cambios de condición relevantes también podrán generar push según permisos y preferencias. No se incluyen correo, SMS ni WhatsApp. La condición actual se calcula a partir de existencias y umbral; los eventos y su lectura sí se conservan en el mecanismo común de notificaciones descrito en la sección 9.1.

## 5. Descuentos y promociones

### 5.1 Configuración común

El BackOffice tendrá un único módulo de promociones con tres tipos: porcentaje, monto fijo y promoción por cantidad.

| Campo | Regla |
| --- | --- |
| Nombre | Identifica la promoción, por ejemplo, «Apertura» o «Hamburguesas 2×1». |
| Tipo | Porcentaje, monto fijo o cantidad. |
| Alcance | Toda la venta o platillos seleccionados, según el tipo. |
| Duración | Temporal o permanente. |
| Inicio y fin | Obligatorios para promociones temporales. |
| Estado administrativo | Activa, desactivada o retirada. |
| Responsable | Usuario que crea o modifica la promoción. |

Se podrán crear, editar, activar, desactivar y retirar promociones con los permisos correspondientes. Retirar una promoción la quitará de las opciones disponibles y conservará su historial; una retirada no se reactivará. Para suspender y reanudar una promoción se utilizará la desactivación.

### 5.2 Temporales y permanentes

- Una promoción temporal será elegible cuando esté activa y se cumpla `inicio <= momento_del_cobro < fin`. La fecha final deberá ser posterior a la inicial.
- Una promoción permanente no tendrá fecha de vencimiento y será elegible mientras esté activa. No requerirá fechas de inicio o fin.
- Desactivar una promoción impedirá utilizarla inmediatamente, aunque su vigencia temporal no haya terminado.
- Una promoción temporal podrá mostrarse como programada, vigente o finalizada; estos son estados calculados, no sustituyen su estado administrativo.
- Las fechas se interpretarán en la zona horaria del negocio, definida para la instalación. La hora de referencia será la del servidor.

### 5.3 Descuentos por porcentaje o monto fijo

| Tipo y alcance | Cálculo |
| --- | --- |
| Porcentaje sobre toda la venta | Se descuenta el porcentaje del subtotal original. |
| Porcentaje sobre platillos seleccionados | Se descuenta el porcentaje del subtotal original de las unidades elegibles. |
| Monto fijo sobre toda la venta | Se descuenta una sola vez por orden. |
| Monto fijo sobre platillos seleccionados | Se descuenta el monto por cada unidad elegible. |

Los porcentajes deberán ser mayores que cero y menores o iguales a 100. Los montos fijos deberán ser positivos. El descuento efectivo se limitará al importe al que aplica: ningún precio de partida ni total podrá quedar negativo.

### 5.4 Promociones por cantidad: 2×1, 3×1, 3×2 y similares

Se configurarán `cantidad_requerida = N` y `cantidad_cobrada = M`, con valores enteros que cumplan `N > M >= 1`.

| Promoción | Unidades entregadas por grupo | Unidades cobradas por grupo |
| --- | --- | --- |
| 2×1 | 2 | 1 |
| 3×1 | 3 | 1 |
| 3×2 | 3 | 2 |

Estas promociones aplicarán a platillos seleccionados. El administrador indicará si se permite combinar distintos platillos participantes.

**Sin combinación:** los grupos se formarán por platillo. Las unidades de un platillo no completarán el grupo de otro. Para una cantidad `q` del mismo platillo, las unidades cobradas serán `floor(q / N) × M + (q mod N)`.

**Con combinación:** se podrán formar grupos con cualquiera de los platillos participantes. Para evitar resultados distintos según el orden de captura, se ordenarán sus unidades por precio original descendente y se formarán grupos consecutivos de `N`. En cada grupo completo se cobrarán las `M` unidades de mayor precio y se bonificarán las restantes, que serán las de menor precio de ese grupo. Los sobrantes se cobrarán normalmente. Si hay precios iguales, se usará el identificador del platillo como desempate estable.

Ejemplos:

- Cinco unidades del mismo platillo en 2×1: dos grupos completos y un sobrante; se cobran tres y se entregan cinco.
- Cuatro unidades del mismo platillo en 3×1: un grupo completo y un sobrante; se cobran dos y se entregan cuatro.
- Dos platillos combinables de $100 y $80 en 2×1: se cobra $100 y se bonifica el de $80.
- Cinco unidades combinables de $100, $90, $80, $70 y $60 en 2×1: se forman los grupos $100/$90 y $80/$70; se bonifican $90 y $70, y el sobrante de $60 se cobra. Total: $240.

El sistema no agregará unidades automáticamente al carrito para completar promociones. El cajero registrará todas las unidades que se entregarán.

### 5.5 Selección, acumulación e historial

- Se aplicará una sola promoción por venta, sin acumulación, conforme al alcance acordado para el MVP.
- Se calculará el ahorro de cada promoción elegible sobre los precios originales y se aplicará la que produzca el mayor ahorro efectivo en toda la orden.
- Una promoción podrá beneficiar varias partidas de la misma orden sin que eso cuente como varias promociones.
- Si dos promociones generan el mismo ahorro, se elegirá la de menor identificador para obtener un resultado estable.
- El cajero no podrá cambiar reglas, fechas ni valores desde la pantalla de venta. No se incluye un descuento manual adicional ni una anulación manual de la selección automática.
- Al confirmar el cobro se validarán nuevamente la vigencia, el estado y los platillos participantes. Si cambia el resultado mostrado, se pedirá al cajero confirmar el nuevo importe antes de guardar la venta.
- Se conservarán en la venta el identificador y una copia del nombre, tipo y parámetros aplicados, el ahorro total y su distribución por partida. Las promociones por cantidad conservarán también las unidades bonificadas.
- Editar, desactivar o retirar una promoción no modificará ventas anteriores.

Todas las unidades entregadas consumirán ingredientes, incluidas las gratuitas. Una promoción modifica el cobro, no las cantidades de receta necesarias ni las reglas de alertas.

## 6. Punto de Venta y órdenes

### 6.1 Flujo principal

1. El cajero inicia sesión y accede al Punto de Venta según sus permisos.
2. Consulta los platillos activos, sus precios y la disponibilidad calculada con las existencias actuales.
3. Agrega platillos al carrito, cambia cantidades o retira partidas mientras la orden esté en borrador.
4. El sistema calcula el subtotal original, la mejor promoción elegible, el descuento y el total final.
5. El cajero selecciona el método de pago y confirma el cobro.
6. El servidor revalida permisos, catálogo, recetas, precios, promociones e inventario de toda la orden.
7. Si la información mostrada cambió, actualiza el resumen y solicita confirmación del cajero. Si faltan ingredientes, impide finalizar e informa cuáles.
8. Si todo es válido, confirma la venta y registra sus consumos de inventario en una sola operación atómica.
9. Se muestra un comprobante interno y se actualiza la condición de bajo stock de los ingredientes afectados.

### 6.2 Estados y datos

Los estados serán `BORRADOR`, `PAGADA` y `CANCELADA`. Una orden vacía no podrá cobrarse. Las cantidades vendidas serán enteros positivos porque representan unidades de platillos.

Las transiciones permitidas serán de borrador a pagada, de borrador a cancelada y de pagada a cancelada con autorización. Las órdenes canceladas no se reabrirán. Cancelar o descartar un borrador no generará movimientos de inventario.

Cada venta tendrá folio único, fecha y hora de confirmación, cajero, partidas, subtotal, promoción aplicada, descuento, total, método de pago y estado. Cada partida conservará el nombre del platillo, cantidad, precio original aplicado, subtotal original, descuento asignado e importe final.

El cobro admitirá un solo método por venta: efectivo, tarjeta mediante terminal externa u otro identificado. No se incluyen pagos divididos, parciales, a crédito ni procesamiento de tarjeta dentro del sistema. Si una promoción válida deja el total en cero, la orden se confirmará con método `SIN_COBRO` y consumirá inventario normalmente.

El comprobante mostrará folio, fecha, cajero, platillos, cantidades, precios, promoción, ahorro y total. Podrá visualizarse en la app e imprimirse mediante la función nativa del sistema móvil cuando esté disponible. Es un comprobante interno; no sustituye una factura fiscal ni requiere integración especializada con impresoras Bluetooth, USB o terminales.

### 6.3 Cancelaciones

Cancelar una venta pagada requerirá un permiso específico y un motivo. Se conservarán la venta original, quién la canceló y cuándo ocurrió. No se eliminará ni se permitirá cancelar dos veces.

Para resolver el inventario, el usuario autorizado indicará por partida cuántas unidades no se prepararon y permiten reintegrar sus ingredientes. Las demás unidades se considerarán preparadas o no recuperables y se registrarán como merma asociada a la cancelación.

- Los reintegros usarán los consumos históricos de esa venta, no la receta actual.
- No se podrá reintegrar más cantidad de la consumida ni reintegrar dos veces el mismo consumo.
- Los ingredientes ya consumidos en unidades preparadas no se descontarán otra vez como merma. La cancelación conservará su clasificación como desperdicio sin crear una segunda salida.
- Para el MVP, la recuperación se expresará en unidades completas no preparadas por partida; no se modela recuperación parcial de ingredientes de un platillo preparado.
- La cancelación será de toda la venta; no se incluyen devoluciones comerciales parciales.

Si hubo un pago real, su devolución se resolverá por el medio operativo correspondiente, fuera del procesamiento de este sistema. Cancelar el registro no ejecutará automáticamente un reembolso en una terminal bancaria.

## 7. Cálculos y consistencia

- Se usará una moneda para la instalación. Los importes se calcularán con precisión decimal exacta; no con números binarios de punto flotante.
- Se redondearán importes monetarios a dos decimales, con regla de mitad hacia arriba. Para porcentajes, se calculará primero el descuento sobre la base elegible completa y después se redondeará.
- Se cumplirá `total = subtotal_original − descuento_total` y `descuento_total = suma de descuentos por partida`.
- Un descuento general se distribuirá proporcionalmente entre las partidas elegibles. Los centavos residuales se asignarán según los mayores restos fraccionarios, con desempate por identificador de partida. La distribución nunca superará el subtotal de una partida.
- Los descuentos de platillos específicos y las bonificaciones por cantidad se atribuirán a sus respectivas partidas.
- El precio registrado del platillo será el precio final de referencia para el cobro antes de promociones. No se incluye un motor adicional de impuestos, cargos ni propinas.
- La validación de existencias, confirmación de la orden y creación de sus movimientos formarán una transacción: se guardarán todas o ninguna.
- La confirmación será idempotente mediante una clave única por intento de venta: repetir la solicitud por doble clic o reintento no creará otra venta ni descontará inventario dos veces.
- Las ventas simultáneas se coordinarán para impedir que dos cajas consuman las mismas existencias disponibles. No bastará con validar stock únicamente al abrir el carrito.
- Las cancelaciones y sus reintegros también serán atómicos e idempotentes.

## 8. Modelo de datos lógico

Los nombres son orientativos. Las relaciones y la conservación de información histórica son requisitos, independientemente del diseño físico elegido.

| Tabla | Contenido principal |
| --- | --- |
| `usuarios` | Identificador, nombre, acceso único, hash de contraseña, `rol_id`, estado y marcas de tiempo. |
| `roles` | Identificador, nombre único, descripción, protección administrativa y marcas de tiempo. |
| `permisos` | Código único de permiso, descripción y área. Catálogo definido por la aplicación. |
| `rol_permisos` | Relación entre rol y permiso, sin duplicados. |
| `ingredientes` | Identificador, nombre, unidad base, estado activo, `stock_minimo` y `alerta_stock_activa`. |
| `platillos` | Identificador, nombre, descripción, precio actual y estado activo. |
| `receta_detalle` | `platillo_id`, `ingrediente_id` y cantidad por unidad; relación única por pareja. |
| `promociones` | Nombre, tipo, alcance, porcentaje o monto, `cantidad_requerida`, `cantidad_cobrada`, `permite_combinar_platillos`, duración, fechas, estado y responsables. Solo se usarán los campos válidos para cada tipo. |
| `promocion_platillos` | Relación sin duplicados entre una promoción y sus platillos participantes. |
| `ordenes` | Folio, cajero, estado, fechas, subtotal, descuento, total, método de pago, promoción y copia de sus parámetros aplicados, clave de idempotencia y datos de cancelación. |
| `orden_detalle` | Orden, platillo, copia de su nombre y precio, cantidad entregada, subtotal, descuento, importe final, unidades bonificadas y cantidades reintegradas o clasificadas como merma al cancelar. |
| `movimientos_inventario` | Ingrediente, cantidad con signo, tipo, fecha, responsable, motivo, orden y partida relacionadas y movimiento de origen cuando corresponda. |
| `bitacora_eventos` | Responsable, acción, entidad, fecha y cambios relevantes de operaciones administrativas. Es soporte de trazabilidad, no un módulo de negocio adicional. |
| `eventos_notificacion` | Identificador y clave de deduplicación, módulo, tipo, recurso, severidad, momento, versión de origen, condición resuelta y estado de procesamiento. Actúa como bandeja transaccional de eventos pendientes. |
| `notificaciones_usuario` | Evento, usuario destinatario y fecha de lectura; relación única por evento y usuario. |
| `dispositivos_notificacion` | Usuario, instalación, plataforma Android/iOS, token de entrega y estado activo; un destino de envío no queda asociado simultáneamente a cuentas diferentes. |
| `preferencias_notificacion` | Usuario, módulo y activación de push, sin eludir permisos del módulo ni la autorización del sistema operativo. |
| `envios_notificacion` | Notificación, dispositivo, identificador estable, estado e intentos de envío; permite reintentos y seguimiento sin duplicar registros internos. |

Relaciones principales:

- Un rol tiene muchos usuarios y muchos permisos mediante `rol_permisos`.
- Un platillo tiene varios ingredientes mediante `receta_detalle`.
- Una orden tiene varias partidas y, como máximo, una promoción aplicada.
- Una promoción puede tener varios platillos participantes.
- Cada consumo por venta relaciona un ingrediente con la orden y la partida que lo originó. Ese movimiento conserva la cantidad efectivamente consumida para futuras consultas o reintegros.

No se guardará la receta como una lista de texto dentro del platillo. Tampoco se guardarán los productos vendidos como una lista de texto dentro de la orden.

El saldo podrá calcularse con movimientos o mantenerse como saldo auxiliar sincronizado de forma transaccional. En ambos casos deberá coincidir con el historial y no admitirá edición directa sin movimiento. Los registros referenciados por ventas no se eliminarán físicamente; las bajas de catálogo serán lógicas.

## 9. Pantallas mínimas y reportes

Todas las pantallas de esta sección pertenecen a la aplicación móvil, incluido el BackOffice. Las tablas amplias deberán presentarse como listas, tarjetas o vistas de detalle legibles en móvil, sin depender de un monitor de escritorio. La navegación y los formularios deben contemplar teclado móvil, acciones táctiles, carga, ausencia de datos y errores de conexión.

| Pantalla | Contenido |
| --- | --- |
| Inicio de sesión | Acceso para cuentas internas. |
| Punto de Venta | Catálogo, carrito, cantidades, promoción aplicada, ahorro, total y confirmación del cobro. |
| Historial y detalle de ventas | Filtros por fecha y estado, detalle, comprobante y cancelación autorizada. El acceso se limita a ventas propias o todas según permiso. |
| Inicio del BackOffice | Resumen de ventas y alertas de inventario, mostrando solo los apartados autorizados. |
| Platillos y recetas | Listado, alta, edición, precio, ingredientes, cantidades y activación. |
| Ingredientes e inventario | Existencias, estado de stock, umbral individual, activación de alerta e historial de movimientos. |
| Registro de movimiento | Entradas, ajustes o mermas, con cantidad y motivo cuando corresponda. |
| Promociones | Listado, configuración de descuentos y NxM, participantes, fechas o permanencia, estados y retiro. |
| Usuarios y roles | Gestión de cuentas, asignación de rol y configuración de permisos. |
| Reportes básicos | Ventas por periodo, unidades por platillo, descuentos concedidos, cancelaciones y existencias actuales. |
| Avisos | Centro de notificaciones propias, filtros por módulo y lectura, contador, detalle, acceso al recurso y preferencias de push. |

Los reportes distinguirán ventas pagadas de canceladas. Las ventas canceladas quedarán fuera del importe de ventas vigente y permanecerán visibles como cancelaciones. Los reportes de platillos distinguirán unidades entregadas y bonificadas, para no confundir el consumo real con las unidades cobradas.

El periodo de ventas se basará en la fecha de cobro y la zona horaria del negocio. Los reportes serán operativos sobre el estado actual de las ventas, no un libro contable de cierres fiscales.

### 9.1 Notificaciones dentro y fuera de la aplicación

El centro de Avisos será accesible desde la navegación móvil. Mostrará los avisos propios autorizados, con módulo, título, fecha, severidad y estado leído/no leído. Admitirá filtros y marcar uno o todos los avisos visibles como leídos. La lectura se conserva por usuario y se sincroniza entre sus dispositivos; leer no modifica inventario, promociones ni ventas.

El contador incluirá avisos no leídos accesibles cuya condición no esté resuelta. Las alertas de stock resueltas permanecerán en el historial y dejarán de incrementar el contador. Al entrar o reanudar la app, y al recibir eventos, se actualizará la información desde el servidor.

| Origen | Eventos incluidos | Destinatarios elegibles |
| --- | --- | --- |
| Inventario | Entrada en bajo stock o agotado. Recuperación o desactivación resuelve el aviso sin nuevo push. | Cuentas activas con permiso de consultar alertas de inventario. |
| Promociones | Inicio y fin de vigencia; activación de una permanente; desactivación o retiro de una promoción que estaba vigente. | Cuentas activas con permiso de consultar promociones. |
| Ventas | Cancelación confirmada de una venta pagada. | Cuentas activas con consulta de todas las ventas; también el cajero de esa venta si puede consultar sus propias ventas. |

El permiso de consultar avisos propios no concede acceso al módulo de origen. Los roles iniciales podrán usar el centro; únicamente recibirán eventos de recursos que ya estén autorizados a consultar. No se enviará un aviso por cada venta normal, edición rutinaria o intento fallido del usuario; estos últimos siguen siendo mensajes del flujo actual o bitácora, según corresponda.

**Control de repetición y vigencia:**

- Stock: abrir un episodio al pasar de suficiente a bajo o agotado. Notificar una vez al entrar en bajo y una vez adicional si empeora a agotado. Si pasa directamente de suficiente a agotado, generar solo el aviso de agotado. Cambios de cantidad que mantengan la misma condición no producen otro aviso. Cambiar umbral o activar alertas también evalúa estas transiciones. Subir sobre el mínimo o desactivar alertas cierra el episodio; una recaída posterior abre uno nuevo.
- Promociones: un proceso del servidor evalúa inicios y finales aunque nadie tenga abierta la app; se propone un intervalo de un minuto, independiente de la precisión del cálculo al cobrar. Usar una clave por promoción, versión y transición. Las permanentes no producen avisos de vencimiento. Antes de procesar un aviso retrasado, reevaluar la versión/estado y descartar inicios que ya no sean vigentes.
- Cancelaciones: un evento por orden cancelada, después de confirmar cancelación y reintegros. Repetir la solicitud no crea otro aviso.

**Canal interno y canal externo:**

- El centro interno permanece disponible aunque el usuario niegue el permiso de notificaciones del sistema operativo.
- En primer plano, actualizar el centro y, si corresponde, mostrar un solo banner interno discreto por evento. Evitar un segundo banner del sistema para el mismo evento y no interrumpir el cobro.
- Fuera de la app, usar push del sistema operativo en Android e iOS. Su entrega depende de permisos, conectividad y comportamiento del proveedor y del sistema; no es la fuente de verdad ni garantiza recepción inmediata.
- Ofrecer preferencias de push por módulo y solicitar autorización en contexto. Denegar o revocar el permiso no bloquea otras funciones de la aplicación. Se contempla el permiso aplicable de Android y la autorización de iOS; ver [Android](https://developer.android.com/develop/ui/compose/notifications/notification-permission) y [Apple](https://developer.apple.com/documentation/usernotifications/asking-permission-to-use-notifications).
- Mostrar mensajes externos genéricos, sin importes, cantidades de inventario ni datos personales en pantalla bloqueada. El detalle se obtiene después de abrir la app, autenticar y validar permisos actuales.
- Registrar, renovar y desvincular dispositivos al cambiar de sesión. Revalidar destinatarios antes del envío y al leer o abrir un aviso; una cuenta desactivada o un permiso retirado impide nuevos accesos. Un aviso ya entregado por el sistema no se considera revocado de forma garantizada: por eso su texto externo no contiene información sensible.
- Pulsar una notificación solo abre un destino permitido; no ejecuta cobros, cancelaciones ni ajustes. Si el recurso ya no está disponible, informar sin revelar su contenido y volver al centro.

**Entrega consistente:** registrar el evento pendiente en la misma transacción de la operación que lo produce. Un proceso del servidor crea los destinatarios internos y envía push después del commit, con deduplicación, reintentos limitados y limpieza de destinos inválidos. La indisponibilidad del proveedor push no revierte una venta o ajuste ya confirmado. Los identificadores estables reducen avisos externos duplicados, pero no se promete entrega exactamente una vez por el sistema operativo.

La integración técnica podrá usar adaptadores para los servicios de entrega Android/iOS, directamente o mediante un proveedor compatible elegido en E1-01. No se requieren campañas, notificaciones masivas manuales, chat ni acciones operativas desde la pantalla bloqueada.

## 10. Requisitos transversales mínimos

- Validar entradas y permisos en el servidor; no confiar en importes, descuentos, identidad de cajero ni cantidades calculadas únicamente por la interfaz.
- Aplicar controles de sesión y comunicación protegida cuando el sistema se use en red.
- Guardar credenciales de sesión en almacenamiento seguro del dispositivo; no confiar en una autorización conservada solo en la app.
- Al perder conexión o recibir una respuesta incierta tras cobrar, evitar confirmar éxitos sin evidencia. Al reintentar, reutilizar la clave de idempotencia y recuperar el resultado del servidor sin duplicar ventas o movimientos.
- Mostrar errores accionables: ingredientes faltantes, vigencia terminada, permiso insuficiente o datos inválidos.
- Conservar trazabilidad de cambios de permisos, cuentas, precios, recetas, promociones y umbrales. Los movimientos y cancelaciones llevarán su propia autoría y motivo.
- Evitar guardar contraseñas, datos de tarjetas o secretos en la bitácora.
- Contar con un procedimiento de respaldo y restauración de la base de datos, verificado antes del uso operativo. No requiere una pantalla adicional en el MVP.
- Incluir eventos, lectura y preferencias de notificaciones en la recuperación; realizar pruebas de restauración con la salida push deshabilitada y conciliar pendientes antes de habilitar un entorno restaurado, para evitar envíos accidentales.
- Mantener componentes, tipografía, iconos y colores centralizados. Auditar contraste, texto ampliado, lectores de pantalla y capturas Android/iOS de cada pantalla modificada, según `AGENTS.md` y `docs/diseno-interfaz.md`.

## 11. Criterios de aceptación

| ID | Comprobación esperada |
| --- | --- |
| CA-01 | Un administrador crea una cuenta de caja, le asigna un rol y la cuenta solo accede a sus funciones autorizadas. Una solicitud directa a una acción prohibida también se rechaza. |
| CA-02 | Crear o editar un rol cambia los permisos efectivos de sus usuarios. Desactivar una cuenta impide sus siguientes operaciones. |
| CA-03 | No se puede dejar el sistema sin una cuenta administradora activa. |
| CA-04 | Se crean ingredientes y una hamburguesa con receta de un pan, 150 g de carne y una pieza de queso. Guardar la receta no cambia las existencias. |
| CA-05 | Vender dos hamburguesas registra la orden y consume dos panes, 300 g de carne y dos piezas de queso. |
| CA-06 | Una orden que supera las existencias combinadas de un ingrediente compartido no se cobra ni genera consumos parciales. |
| CA-07 | Dos cobros simultáneos que juntos excederían las existencias no producen stock negativo. Reintentar un cobro confirmado no duplica la venta. |
| CA-08 | Editar una receta, nombre o precio después de una venta no cambia su detalle histórico ni los consumos que originó. |
| CA-09 | El dueño configura 20 piezas de mínimo para pan y 2,000 g para carne; ambos ingredientes se evalúan con sus propios umbrales. |
| CA-10 | Al llegar exactamente al mínimo aparece la alerta. Nuevas salidas mantienen una sola alerta; una entrada que supere el mínimo la resuelve. |
| CA-11 | Cambiar el mínimo o activar/desactivar una alerta actualiza inmediatamente la condición visible. Al llegar a cero se muestra agotado. |
| CA-12 | Un descuento temporal no aplica antes de su inicio ni desde su fecha y hora de fin. Se revalida al confirmar el cobro. |
| CA-13 | Un descuento permanente no necesita fecha final. Desactivarlo o retirarlo impide su aplicación futura y conserva el historial. |
| CA-14 | Sobre una venta de $200, una promoción de 15 % genera $30 de descuento y $170 de total. Un descuento nunca deja un importe negativo. |
| CA-15 | Un descuento fijo por platillo aplica por unidad; uno de toda la venta aplica una sola vez. |
| CA-16 | Cinco unidades del mismo platillo de $100 en 2×1 cuestan $300; se entregan cinco y se consumen ingredientes para cinco. |
| CA-17 | Cuatro unidades del mismo platillo de $100 en 3×1 cuestan $200. Tres unidades de $100 en 3×2 cuestan $200. |
| CA-18 | Sin combinación, una unidad del platillo A y una del B no forman un 2×1. Con combinación habilitada y precios $100/$80, forman un grupo con total de $100. |
| CA-19 | La combinación de precios $100, $90, $80, $70 y $60 en 2×1 da un total de $240 independientemente del orden de captura. |
| CA-20 | Si varias promociones son elegibles, solo se aplica la de mayor ahorro efectivo. Se resuelve un empate de forma estable. |
| CA-21 | Cambiar o retirar una promoción no modifica el nombre, parámetros, ahorro ni bonificaciones conservados en una venta anterior. |
| CA-22 | La suma de descuentos por partida coincide con el descuento total y la suma de importes finales coincide con el total cobrado, incluso al distribuir centavos. |
| CA-23 | Cancelar una venta exige permiso y motivo, conserva el original y reintegra únicamente ingredientes de unidades no preparadas, según sus consumos históricos. |
| CA-24 | Las unidades preparadas de una venta cancelada se identifican como merma sin descontar sus ingredientes otra vez. Repetir la cancelación no duplica reintegros. |
| CA-25 | El historial y los reportes muestran las cancelaciones por separado y no las cuentan como ventas vigentes. |
| CA-26 | Una promoción válida de 100 % permite confirmar una orden con total cero y método sin cobro, conservando todos sus consumos. |
| CA-27 | Un platillo sin receta válida o con un ingrediente inactivo no puede venderse. |
| CA-28 | Se verifica que un respaldo permita restaurar usuarios, catálogo, ventas, promociones, inventario y notificaciones de manera consistente, sin disparar envíos durante la restauración de prueba. |
| CA-29 | Las pantallas Android/iOS aplican composición y navegación Cupertino, Roboto, Material Symbols Rounded y tokens de la paleta acordada; las superficies propias no cambian arbitrariamente de estilo entre módulos. |
| CA-30 | Las pantallas modificadas conservan legibilidad con texto ampliado, áreas táctiles, teclado y lector de pantalla; texto con contraste de al menos 4.5:1 y controles relevantes de 3:1, sin depender solo del color. |
| CA-31 | El centro muestra solo avisos propios autorizados, filtra por módulo/lectura, mantiene lectura por usuario entre dispositivos y actualiza el contador sin confundir leer con resolver una alerta. |
| CA-32 | Se verifica recepción y apertura push en Android e iOS, app en primer plano y fuera de ella, permiso concedido/denegado/revocado y preferencias por módulo; sin permiso externo el centro interno y las operaciones siguen funcionando. |
| CA-33 | Un aviso no expone datos sensibles en la pantalla bloqueada, revalida permisos al abrirse y no inicia nuevos envíos a una cuenta desvinculada o desactivada; un recurso inaccesible se maneja sin revelar su detalle. |
| CA-34 | Un rollback no publica avisos; un reintento de negocio no duplica registros internos; un fallo del proveedor push no revierte una operación confirmada y los reintentos de envío no crean otra venta, movimiento o cancelación. |
| CA-35 | Bajo stock/agotado genera avisos solo en las transiciones definidas, una reposición resuelve su condición, las promociones avisan por vigencia real incluso con la app cerrada y cada cancelación confirmada genera un único evento. |

## 12. Fuera del alcance del MVP

- Registro o aplicación para clientes, pedidos en línea y reparto.
- Panel web. La entrega completa de escritorio queda en la fase PC posterior; sí se incluyen en la preparación del MVP la separación de capas, adaptadores y verificación temprana de portabilidad.
- Mesas, cuentas abiertas, comandas y pantallas de cocina.
- Varias sucursales, almacenes independientes o transferencias entre ellos.
- Compras y cuentas con proveedores, lotes, caducidades y producción previa de subrecetas.
- Conversión automática de unidades, modificadores de platillos y sustituciones de ingredientes por orden.
- Procesamiento integrado de tarjetas, pagos divididos, crédito, reembolsos automáticos y devoluciones parciales.
- Facturación fiscal, motor de impuestos, propinas y cierre de caja con arqueo.
- Acumulación de promociones, cupones personales, lealtad, segmentación de clientes y calendarios recurrentes de promociones.
- Alertas externas por correo, SMS o mensajería.
- Campañas de notificación, correo, SMS, chat, acciones operativas desde push e integración específica con impresoras o lectores externos.
- Costeo de recetas, cálculo de utilidad, contabilidad y reportes financieros avanzados.
- Operación sin conexión con sincronización posterior.

## 13. Definición de terminado

El MVP estará completo cuando, desde la aplicación móvil en Android e iOS, un dueño pueda crear cuentas y permisos; registrar ingredientes y existencias; configurar umbrales individuales; crear platillos con recetas; administrar descuentos temporales, permanentes y promociones por cantidad; y permitir que caja venda respetando disponibilidad y permisos.

Cada venta deberá conservar su detalle, promoción e importes históricos, consumir ingredientes por todas las unidades entregadas, actualizar las alertas y aparecer correctamente en los reportes. Las cancelaciones deberán preservar la trazabilidad y resolver los reintegros o mermas sin duplicar movimientos. Las pantallas deberán seguir la composición acordada y los eventos previstos deberán estar disponibles en el centro de Avisos y mediante push autorizado. Los 35 criterios de aceptación de este documento deberán estar verificados antes de utilizar el sistema en operación.
