# Composición gráfica y seguimiento de diseño

Estado: guía para implementación; no representa pantallas ya construidas. Alcance: app Flutter para el MVP Android/iOS, con Punto de Venta, BackOffice y Avisos, y adaptación Windows en una fase posterior.

La [sección 9 del AGENTS general](../AGENTS.md#9-composición-gráfica-obligatoria) define la paleta, fuente e iconos obligatorios. Las instrucciones locales indican cómo aplicarlos en cada módulo. El framework seleccionado es Flutter, conforme a la [decisión técnica](decisiones/0001-stack-y-plataformas.md).

## 1. Composición de pantallas

1. Área segura superior y barra de navegación con título y acciones contextuales mínimas.
2. Contenido principal en una columna, con secciones agrupadas y separación clara.
3. Acción principal al final del formulario o en una zona inferior accesible que no tape el contenido ni el teclado.
4. Barra de destinos cuando corresponda: Inicio, Venta, Gestión y Avisos. Mostrar solo destinos permitidos; conservarlos estables durante el uso mientras no cambien los permisos.

Un formulario largo debe desplazarse y llevar al campo que tenga error. No apilar varias hojas modales para completar una operación habitual. Cobrar o cancelar siempre son acciones explícitas dentro de su contexto, no pestañas de navegación.

Usar listas agrupadas para ajustes, roles y formularios; tarjetas o filas con detalle para platillos, inventario y avisos. Evitar tablas anchas que requieran un monitor. Los diálogos de permisos, impresión y notificaciones externas son nativos del sistema operativo y no se fuerzan a imitar la apariencia interna.

## 2. Escala tipográfica

Roboto en toda la interfaz propia; mantener la fuente nativa en superficies controladas por el sistema. Los tamaños son unidades lógicas escalables, no píxeles físicos fijos.

| Uso | Tamaño base | Peso | Interlineado de referencia |
| --- | --- | --- | --- |
| Título principal | 28 | 700 | 34 |
| Título de sección | 22 | 700 | 28 |
| Cuerpo y campo | 16 | 400 | 24 |
| Botón y etiqueta destacada | 16 | 500 | 22 |
| Apoyo y metadatos | 14 | 400 | 20 |
| Etiqueta compacta de navegación | 12 | 500 | 16 |

Permitir que etiquetas se redistribuyan o crezcan con la preferencia de tamaño del sistema. No resolver un desbordamiento reduciendo el texto hasta volverlo ilegible. No usar el tamaño compacto para precios, cantidades, errores o instrucciones importantes.

## 3. Espaciado, forma y controles

- Escala de espacio: 4, 8, 12, 16, 24 y 32 unidades lógicas; margen lateral inicial de 16.
- Radio de referencia: 12 para campos y botones, 16 para superficies agrupadas y 24 para hojas modales.
- Área táctil mínima del proyecto: 48 × 48 unidades lógicas; el icono puede ser menor que su área táctil.
- Iconos Material Symbols Rounded de 24 unidades como base, con peso y alineación uniformes.
- Bordes y sombras discretos. Un separador decorativo claro no sustituye el contorno necesario para reconocer un campo activo.
- Respetar preferencias de movimiento reducido. Las animaciones no deben retrasar cobros ni esconder errores.

## 4. Uso de color y estados

Usar los tokens del AGENTS general como única fuente de colores. El verde identifica acción principal/éxito; el morado navegación/énfasis; el rojo errores, agotado y acciones destructivas; el amarillo advertencia. Los fondos suaves agrupan información sin saturar la pantalla.

| Caso | Presentación |
| --- | --- |
| Guardar o cobrar | Botón verde con texto claro y acción específica. |
| Navegación seleccionada | Morado, icono/forma seleccionada y etiqueta visible. |
| Bajo stock | Fondo amarillo suave, texto oscuro, icono de advertencia y cantidad/unidad. |
| Agotado | Rojo más texto «Agotado»; no depender únicamente del color. |
| Error de formulario | Explicación junto al campo, icono y estilo rojo legible. |
| Cancelar venta | Acción roja con confirmación y motivo; distinta de volver o cerrar una hoja. |
| Aviso no leído | Indicador, título destacado y estado accesible. La severidad se expresa aparte del estado leído/no leído. |
| Éxito | Mensaje breve y verificable; no decir «Guardado» antes de respuesta confirmada del servidor. |

El tema claro es la base inicial. Si se añade un tema oscuro, definir tokens equivalentes y auditar sus combinaciones; no aplicar una inversión automática de colores ni darlo por validado con capturas del tema claro.

## 5. Centro de Avisos y notificaciones externas

- Mostrar título, módulo, fecha, severidad, estado leído/no leído y estado de la condición cuando corresponda.
- Ofrecer filtros por módulo y lectura; permitir marcar uno o todos los avisos accesibles como leídos.
- Mantener un contador de no leídos accesibles y no resueltos. Un aviso de stock resuelto permanece en el historial, pero deja de pedir atención en el contador.
- Pulsar el aviso abre el recurso relacionado después de validar sesión y permisos. Si desapareció o dejó de ser accesible, mostrar un mensaje neutro y volver al centro.
- En primer plano, actualizar el centro y presentar como máximo un aviso discreto por evento; no duplicarlo con un banner de sistema. No tapar el botón de cobro con una alerta no bloqueante.
- Fuera de la app, permitir push nativo con un mensaje genérico, por ejemplo «Hay una alerta de inventario. Abre la app para consultar el detalle».
- Permitir preferencias de push por módulo. Negar permiso al sistema no oculta el centro ni impide vender o administrar.

Pedir autorización al activar los avisos externos y explicar su utilidad, sin insistir en cada apertura. La integración debe contemplar el permiso de notificaciones en Android y la autorización de iOS. Referencias: [Android, permiso de notificaciones](https://developer.android.com/develop/ui/compose/notifications/notification-permission) y [Apple, autorización de notificaciones](https://developer.apple.com/documentation/usernotifications/asking-permission-to-use-notifications).

## 6. Auditoría de composición

Para cada tarea visual, registrar en su auditoría:

- Pantalla, estado, versión y dispositivos usados.
- Componentes y tokens empleados; diferencias justificadas respecto de esta guía.
- Capturas Android/iOS de carga, contenido, vacío, error y estados relevantes del cambio.
- Revisión de texto ampliado al menos al 200 % cuando el sistema lo permita, nombres largos, cantidades y teclado abierto.
- Medición de contraste de texto y controles. Si un estado usa otra combinación, medirla también.
- Etiquetas y orden de foco con TalkBack/VoiceOver; color acompañado de otra señal.
- Destinos de navegación y retorno, incluyendo apertura desde una notificación cuando corresponda.

Una tarea sin pantalla justifica «no aplica» en su auditoría visual. Las tareas con pantalla no pueden quedar aprobadas con evidencia de una sola plataforma.

## 7. Registro de seguimiento

Actualizar esta tabla con enlaces a las capturas y auditorías reales durante el desarrollo. «Pendiente» no significa aprobado ni diseñado.

| Pantalla o componente | Propietario y tarea | Diseño | Android | iOS | Auditoría |
| --- | --- | --- | --- | --- | --- |
| Navegación, tokens y componentes base | E1-07 | Pendiente | Pendiente | Pendiente | Pendiente |
| Acceso y sesión | E1-03 | Pendiente | Pendiente | Pendiente | Pendiente |
| Usuarios y roles | E1-05 | Pendiente | Pendiente | Pendiente | Pendiente |
| Centro de Avisos y preferencias | E1-10 | Pendiente | Pendiente | Pendiente | Pendiente |
| Permiso, recepción y apertura push | E1-11 | Pendiente | Pendiente | Pendiente | Pendiente |
| Platillos, ingredientes y recetas | E2-06 | Pendiente | Pendiente | Pendiente | Pendiente |
| Inventario, mínimos y alertas | E2-07 | Pendiente | Pendiente | Pendiente | Pendiente |
| Promociones y vigencias | E3-06 | Pendiente | Pendiente | Pendiente | Pendiente |
| Carrito y cobro | E4-05 | Pendiente | Pendiente | Pendiente | Pendiente |
| Cancelación | E4-06 | Pendiente | Pendiente | Pendiente | Pendiente |
| Historial y comprobantes | E4-07 | Pendiente | Pendiente | Pendiente | Pendiente |
| Resumen y reportes | E4-08 | Pendiente | Pendiente | Pendiente | Pendiente |

No se requiere herramienta de diseño adicional para mantener este seguimiento: capturas, referencias y decisiones se guardan con la tarea y se revisan por otro integrante.

## 8. Adaptación a PC, fase posterior

Conservar Roboto, Material Symbols Rounded y tokens de color. La distribución deberá responder al tamaño de ventana: navegación lateral y paneles de lista/detalle cuando haya espacio, y disposición compacta al reducirlo. No ampliar simplemente todos los controles móviles para llenar el monitor.

Agregar navegación con Tab/Shift+Tab, foco visible, activación con teclado, interacción con ratón y confirmaciones que no dependan de gestos táctiles. Mantener legibilidad y objetivos de contraste. No añadir operaciones de caja distintas por plataforma.

Las tareas PC auditan ventanas amplias y reducidas, escalado de pantalla, lectura de texto y capacidades nativas en Windows. La prueba de Android/iOS no sustituye esas evidencias. La barra de notificación, diálogos de impresión y otras superficies del sistema conservarán la presentación nativa Windows.

| Parte del diseño PC | Tarea | Diseño | Windows | Auditoría |
| --- | --- | --- | --- | --- |
| Ventana, navegación, sesión y Avisos | E1-12 | Pendiente | Pendiente | Pendiente |
| Catálogo e inventario | E2-11 | Pendiente | Pendiente | Pendiente |
| Promociones | E3-10 | Pendiente | Pendiente | Pendiente |
| Caja, historial y reportes | E4-12 | Pendiente | Pendiente | Pendiente |
