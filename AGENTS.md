# Reglas universales del equipo de desarrollo

## 1. Alcance y lectura obligatoria

Estas instrucciones rigen todo el proyecto y se complementan con el `AGENTS.md` del módulo en el que se trabaje. La organización es para cuatro integrantes humanos; no implica iniciar cuatro agentes automáticos.

Antes de desarrollar una tarea, leer:

1. `spec.md`, fuente de verdad funcional del MVP.
2. Este archivo y `README.md`, para estructura, responsabilidades y dependencias.
3. `AGENTS.md` y `plan.md` del módulo asignado.
4. Los contratos y decisiones técnicas vigentes que afecten el cambio.
5. `docs/decisiones/0001-stack-y-plataformas.md`, `docs/arquitectura-tecnica.md` y las guías `frontend/README.md` y `backend/README.md` del módulo.

Las reglas de un módulo agregan detalle y no pueden relajar los controles universales. No ampliar el alcance del MVP ni modificar una regla funcional por conveniencia técnica. Si existe una contradicción, documentarla y resolverla antes de implementar el comportamiento afectado. Una mejora interna reversible que respete la especificación no necesita una nueva autorización funcional.

## 2. Distribución del trabajo

| Integrante | Módulo propio | Responsabilidad |
| --- | --- | --- |
| 1 | `modulos/plataforma-accesos/` | Base de la aplicación, identidad, permisos, administración, diseño compartido, centro de notificaciones, push, infraestructura común y recuperación. |
| 2 | `modulos/catalogo-inventario/` | Ingredientes, platillos, recetas, movimientos, disponibilidad, reintegros y alertas. |
| 3 | `modulos/promociones/` | Administración de promociones, vigencia, cálculo, bonificaciones y distribución de descuentos. |
| 4 | `modulos/ventas-reportes/` | Órdenes, Punto de Venta, cobro, cancelación, comprobantes, historial y reportes. |

Cada integrante desarrolla servidor, interfaz y verificaciones de su área. No existe un integrante que sea responsable exclusivo de probar el trabajo de los demás. Los nombres personales se pueden asignar después sin cambiar los identificadores de las tareas.

## 3. Estructura obligatoria

El MVP se entrega en Android e iOS y se prepara desde el inicio para una segunda fase de PC, tomando Windows como primer destino. Una app Flutter/Dart contiene Punto de Venta y BackOffice; una API NestJS/TypeScript con PostgreSQL central mantiene las transacciones. No crear panel web, bases operativas independientes por dispositivo ni microservicios. La versión completa de Windows se desarrolla en las tareas de fase PC, sin bloquear el cierre móvil. E1-01 fija versiones y entornos del stack ya decidido.

```text
Proyecto/
  spec.md
  AGENTS.md
  README.md
  modulos/
    plataforma-accesos/{AGENTS.md, plan.md, frontend/, backend/}
    catalogo-inventario/{AGENTS.md, plan.md, frontend/, backend/}
    promociones/{AGENTS.md, plan.md, frontend/, backend/}
    ventas-reportes/{AGENTS.md, plan.md, frontend/, backend/}
  app/frontend/              # ejecutable Flutter y runners por plataforma
  app/backend/               # ejecutable NestJS y procesos del servidor
  compartido/frontend/       # diseño, cliente API y puertos del dispositivo
  compartido/backend/        # transacción, tipos y errores comunes
  base-datos/migraciones/    # migraciones de todos los módulos
  docs/contratos/            # interfaces entre módulos
  docs/decisiones/           # decisiones técnicas breves y justificadas
  docs/auditorias/           # una evidencia por tarea
  docs/matriz-aceptacion.md
  docs/diseno-interfaz.md    # composición, componentes y seguimiento visual
  docs/arquitectura-tecnica.md
  docs/decisiones/0001-stack-y-plataformas.md
```

Las carpetas frontend/backend contienen guías; código, paquetes y ejecutables se crearán durante el desarrollo. En cada `backend/src/`, separar cuando exista código:

- `dominio/`: reglas y cálculos del negocio.
- `aplicacion/`: casos de uso y coordinación de reglas.
- `infraestructura/`: persistencia y adaptadores técnicos.
- `interfaz/`: controladores, validaciones y DTO de la API; no colocar widgets Flutter aquí.

En cada `frontend/lib/src/`, separar `presentacion/` (pantallas y view models), `datos/` (API/repositorios cliente) y `dominio/` cuando hagan falta modelos de presentación. Las pruebas de ambos paquetes se ubican en su propio `test/`. Las referencias a capas en instrucciones anteriores del módulo se interpretan con esta separación física; no se mezclan Dart y TypeScript en una misma capa.

No crear capas vacías o abstracciones sin uso solo para completar el árbol. Seguir el mapa de `docs/arquitectura-tecnica.md`; cualquier ajuste requerido por las herramientas conserva la propiedad del módulo y la herencia de sus instrucciones.

`app/` y `compartido/` son coordinados por el integrante 1 y sus cambios deben consultar también `modulos/plataforma-accesos/AGENTS.md`. Los cambios compartidos se acuerdan con él; cada autor sigue siendo responsable de auditar su cambio. Evitar colocar reglas de promociones, inventario o ventas dentro de archivos genéricos de utilidades.

El código TypeScript del servidor nunca se incorpora al paquete Flutter. Los paquetes locales de cada módulo se componen en una sola app cliente y un solo servidor; no se crea una aplicación por integrante. Las APIs públicas de los paquetes y el contrato REST evitan importaciones internas cruzadas.

## 4. Propiedad de datos y contratos

| Responsable | Tablas y contratos que mantiene |
| --- | --- |
| Integrante 1 | `usuarios`, `roles`, `permisos`, `rol_permisos`, `bitacora_eventos`; eventos, destinatarios, dispositivos, preferencias y envíos de notificaciones; identidad, autorización, transacción y auditoría. |
| Integrante 2 | `ingredientes`, `platillos`, `receta_detalle`, `movimientos_inventario`; catálogo, disponibilidad y operaciones de inventario. |
| Integrante 3 | `promociones`, `promocion_platillos`; elegibilidad y evaluación económica. |
| Integrante 4 | `ordenes`, `orden_detalle`; confirmación, cancelación, historial y proyecciones de reportes. |

Cada integrante escribe sus propias migraciones. Se usarán nombres únicos, por ejemplo `<fecha-hora>-<ID-tarea>-<descripcion>`, y se coordinará el orden por dependencias. No editar una migración que ya se haya aplicado en un entorno compartido; corregirla mediante una nueva migración.

No escribir directamente en tablas ajenas desde otro módulo. Usar el contrato publicado por su propietario. Las consultas de reportes usarán proyecciones o consultas de lectura documentadas, sin convertirlas en vías de modificación de otro módulo.

Los contratos deberán definir entradas, salidas, errores, permisos, tipos monetarios, cantidades, fechas, versiones de datos, garantías transaccionales y ejemplos. Documentarlos antes de implementar al consumidor. Un cambio incompatible exige actualizar productor, consumidores y verificaciones en la misma entrega coordinada.

## 5. Invariantes de integración

- Identidad y permisos se verifican en servidor para cada operación, incluyendo alcance de ventas propias y todas las ventas.
- El módulo de ventas es dueño de la transacción de confirmación y cancelación. Inventario recibe ese mismo contexto de transacción: no confirma su escritura por separado ni abre una transacción independiente para ese flujo.
- Las operaciones de precios y lectura de receta usadas al cobrar deben pertenecer a una vista consistente de los datos, con bloqueo o validación de versiones según la tecnología acordada.
- El servidor decide importes, promoción, identidad del cajero y consumo. La interfaz no es la fuente de verdad.
- La app usa almacenamiento seguro para sesiones. La pérdida de conexión, suspensión o cierre de la app no autoriza un cobro local; después de una respuesta incierta se consulta o reintenta con la misma clave de operación.
- El inventario se descuenta por unidades entregadas, incluidas las bonificadas. No se duplica una salida al clasificar como merma una preparación ya consumida.
- Se conserva la regla de una promoción por venta, sin acumulación, seleccionando el mayor ahorro.
- Se preservan precios, nombres, parámetros de promoción y consumos históricos.
- Se usan decimales exactos, las reglas de redondeo de `spec.md` y una hora de servidor interpretada en la zona horaria del negocio.
- Cobros y cancelaciones son atómicos e idempotentes. Reusar una clave con una solicitud diferente debe rechazarse; un reintento equivalente recupera el resultado original.
- Los bloqueos de ingredientes se adquieren en orden estable para reducir conflictos. Cualquier reintento técnico conserva la idempotencia y no confirma un importe que el cajero no haya aceptado.
- Los eventos notificables se guardan con la operación de negocio y se procesan después del commit mediante una bandeja transaccional de eventos pendientes. No llamar a servicios push dentro de la transacción ni revertir una venta confirmada porque falle el proveedor de avisos.
- Inventario, promociones y ventas producen eventos por el contrato común; plataforma entrega el centro interno y push. Los destinatarios se filtran por cuenta activa y permiso vigente, también al leer o abrir el destino.

## 6. Flujo obligatorio de cada tarea

Cada tarea tiene un ID único: `E1-01`, `E2-01`, etc. Sus subtareas pertenecen a su misma auditoría; si una subtarea se convierte en una entrega independiente, recibirá un nuevo ID y evidencia propia.

Estados: pendiente, en curso, bloqueada, en revisión y terminada. Una dependencia no disponible se registra como bloqueo, pero no impide avanzar en otras tareas independientes o trabajar con un contrato simulado explícitamente identificado.

1. Leer alcance, dependencias y criterios asociados; identificar archivos y contratos afectados.
2. Registrar responsable, revisor y resultado esperado en `docs/auditorias/<ID>.md`, usando la plantilla.
3. Implementar un cambio acotado y comprobar los casos relevantes, incluyendo errores y límites materiales.
4. Hacer una autoauditoría estructural, funcional, de permisos y de datos.
5. Entregar al revisor evidencias reproducibles y referencias al cambio.
6. Resolver los hallazgos y repetir solo las comprobaciones afectadas.
7. Marcar la tarea como terminada únicamente cuando la auditoría y la revisión independiente estén aprobadas.

Las tareas técnicas sin un criterio CA directo se auditan contra su resultado verificable y la sección pertinente de la especificación. Para documentación o estructura, basta una revisión documental reproducible; no se inventan pruebas ejecutables sin valor.

## 7. Auditoría obligatoria por tarea

Usar `docs/auditorias/plantilla.md`. No cerrar una tarea únicamente porque compila o porque su pantalla abre. Comprobar, según su alcance:

- Estructura: ubicación correcta, responsabilidades separadas, sin duplicación de reglas ni accesos indebidos a otro módulo.
- Funcionalidad: comportamiento acordado, casos límite, criterios CA vinculados y ausencia de ampliaciones no solicitadas.
- Datos: integridad, migraciones, transacciones, historial, cantidades, redondeos e idempotencia cuando correspondan.
- Acceso: permisos en servidor, usuario activo y alcance de datos.
- Interfaz móvil: carga, vacío, error y éxito; controles táctiles, teclado, tamaños soportados, navegación, suspensión/reanudación y correspondencia con los valores del servidor. Verificar las plataformas móviles acordadas, no solo una vista de navegador.
- Composición gráfica: estilo Cupertino, Roboto, Material Symbols Rounded, tokens semánticos, contraste y escalado de texto; adjuntar referencias visuales y capturas de las pantallas modificadas en Android e iOS.
- Notificaciones: destinatarios, permisos del sistema, estado leído/no leído, eventos duplicados, apertura segura, reintentos y funcionamiento sin permiso push cuando el cambio afecte esos flujos.
- Evidencia: comandos reales o pasos manuales, datos usados, resultado esperado y observado, versión del cambio y hallazgos.

Marcar «no aplica» con una explicación cuando un control no sea pertinente. No declarar aprobada una prueba no ejecutada ni usar una captura como única evidencia de atomicidad, permisos o cálculos.

| Autor | Revisor principal |
| --- | --- |
| Integrante 1 | Integrante 4 |
| Integrante 2 | Integrante 1 |
| Integrante 3 | Integrante 2 |
| Integrante 4 | Integrante 3 |

El revisor puede sustituirse por otro integrante distinto del autor, dejando constancia. En cobro y cancelación también participa el integrante 2 para revisar inventario; en identidad y autorización participa el integrante 1 si no es el autor. No atribuir aprobaciones a una persona que no revisó el cambio.

Bloquean el cierre los incumplimientos de alcance o criterios, defectos de permisos, corrupción de datos, errores de importes o stock, pruebas relevantes fallidas y falta de evidencia o revisión. Las observaciones cosméticas sin impacto funcional pueden quedar como pendientes explícitos con responsable. Si cambia la implementación después de aprobarse, se reabre la parte de auditoría afectada.

## 8. Integración y cierre

Trabajar en cambios pequeños vinculados al ID de tarea. Si se usa Git, crear ramas cortas por tarea y solicitudes de integración con problema, cambio, evidencia y riesgos; no sobrescribir trabajo ajeno ni resolver conflictos aceptando archivos completos sin revisar.

La verificación automatizada compartida ejecutará los controles de formato, compilación y pruebas aplicables acordados en E1-02. Cada autor ejecuta primero lo correspondiente a su cambio. Las comprobaciones críticas de concurrencia y rollback se hacen con la base de datos real elegida, no solo con simulaciones.

La matriz de aceptación asigna un único responsable principal por criterio y colaboradores cuando se necesitan. No marcar un CA aprobado hasta que exista evidencia sobre módulos integrados; una simulación permite avanzar, pero no sustituye la comprobación final.

No implementar funcionalidades excluidas en `spec.md`. No cambiar esa especificación para hacer pasar una prueba. No guardar contraseñas, tokens ni datos reales sensibles en documentos de auditoría. Las tareas de este paquete comienzan pendientes; redactar un plan no equivale a ejecutar sus tareas.

## 9. Composición gráfica obligatoria

La interfaz y navegación seguirán un estilo Cupertino con Flutter en Android e iOS: barras de navegación claras, jerarquía de título y contenido, listas agrupadas, controles segmentados, interruptores, hojas modales y navegación de lista a detalle. En la fase PC se conservarán los tokens, fuente e iconos, adaptando distribución, foco y navegación al ancho de ventana y a teclado/ratón.

En la composición móvil compacta, usar una barra inferior con destinos estables autorizados para el usuario: Inicio, Venta, Gestión y Avisos, según permisos. Cada destino llevará icono y texto; cambiar de pestaña preservará su navegación. Las pestañas navegan y no ejecutan acciones como cobrar o cancelar. Los apartados sin datos muestran un estado vacío; no desaparecen por estar vacíos. En ventanas amplias de la fase PC se podrá usar navegación lateral con los mismos destinos y permisos. Referencia de navegación: [Apple HIG, tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars).

Respetar áreas seguras, teclado y retorno del sistema Android y gestos iOS. Los diálogos de permiso y avisos del sistema operativo conservan su apariencia nativa; el estilo propio se aplica dentro de la app.

### Tipografía e iconografía

- Fuente de la app: **Roboto**, con pesos regular 400, medio 500 y negrita 700. Usar tamaño escalable del sistema, sin impedir el aumento de texto. Fuente: [Roboto, Google Fonts](https://fonts.google.com/specimen/Roboto).
- Iconos: **Material Symbols Rounded**, con un tratamiento consistente de tamaño y peso. Estado normal sin relleno y selección con relleno cuando exista esa variante. No mezclar librerías de iconos decorativamente. Referencia: [Material Symbols](https://developers.google.com/fonts/docs/material_symbols).
- Incluir los recursos necesarios y sus licencias en el paquete móvil; no depender de descargar tipografías o iconos al abrir una pantalla.
- Los iconos funcionales tendrán nombre accesible. Las acciones destructivas y navegación principal también tendrán texto visible.

### Paleta semántica de referencia

Esta tabla es la fuente única de valores iniciales. Definir tokens comunes y no escribir colores aislados en cada pantalla.

| Token | Color | Uso y combinación |
| --- | --- | --- |
| `accion.primaria` / `estado.exito` | Verde `#166534` | Guardar, cobrar, confirmar y éxito; texto blanco. |
| `acento.navegacion` | Morado `#6D28D9` | Selección, navegación, enlaces y énfasis de promociones; texto blanco cuando sea fondo sólido. |
| `estado.error` | Rojo `#B91C1C` | Error, agotado, acción destructiva y aviso crítico; texto blanco sobre fondo sólido. |
| `estado.advertencia` | Amarillo `#FACC15` | Bajo stock o atención pendiente; texto `#713F12`, nunca blanco. |
| `superficie.exito` | Verde suave `#DCFCE7` | Fondo contextual con texto `#166534`. |
| `superficie.acento` | Morado suave `#EDE9FE` | Fondo contextual con texto `#6D28D9`. |
| `superficie.error` | Rojo suave `#FEE2E2` | Fondo contextual con texto `#B91C1C`. |
| `superficie.advertencia` | Amarillo suave `#FEF9C3` | Fondo contextual con texto `#713F12`. |
| `fondo` / `superficie` | `#F7F8FA` / `#FFFFFF` | Fondo general y superficies de contenido. |
| `texto.principal` / `texto.secundario` | `#1F2937` / `#4B5563` | Contenido sobre superficies claras. |
| `borde.control` | `#6B7280` | Contorno cuando sea necesario para identificar un control sobre superficie clara. |
| `separador` | `#D1D5DB` | Divisores decorativos; no usar como única señal de un control o estado. |

Predominarán superficies neutras y suaves; reservar los colores saturados para acciones y estados. No usar el color como única forma de distinguir éxito, error, agotado, selección o lectura: acompañarlo con texto, icono o forma.

Exigir al menos 4.5:1 entre texto informativo y su fondo, y 3:1 para los límites o iconos necesarios para reconocer controles activos. Verificar cada combinación final, no solo sus colores por separado. Referencias: [contraste de texto](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) y [contraste de controles](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

### Seguimiento de diseño por tarea

Aplicar [docs/diseno-interfaz.md](docs/diseno-interfaz.md). Toda tarea que modifique una pantalla deberá identificar sus componentes/tokens, actualizar su fila de seguimiento, adjuntar capturas en Android e iOS y revisar contenido largo, aumento de texto, teclado, estados y accesibilidad. No cerrar una tarea visual con discrepancias funcionales, texto cortado o contraste insuficiente. Una captura de diseño no equivale a una pantalla implementada y probada.

## 10. Notificaciones internas y externas

La app tendrá un centro **Avisos** y notificaciones **push** del sistema operativo. Este requerimiento sustituye expresamente la exclusión anterior de push. No incluye correo, SMS, WhatsApp, campañas comerciales ni mensajería entre trabajadores.

- Definir eventos útiles de los módulos existentes: bajo stock/agotado, inicio/fin o suspensión de promociones vigentes y ventas canceladas. No crear un aviso por cada consulta o venta normal.
- Mantener lectura por usuario, filtros por módulo, contador de no leídos y vínculo a un destino autorizado. Leer un aviso no resuelve la condición de bajo stock ni modifica el negocio.
- Solicitar permiso push en contexto, permitir preferencias por módulo y conservar el centro interno si el sistema operativo deniega los avisos.
- La entrega externa depende de permisos, conexión y decisiones del sistema/proveedor; no prometer entrega inmediata ni exactamente una visualización por dispositivo. Deduplicar los registros internos y usar identificadores estables para reducir duplicados externos.
- El contenido de pantalla bloqueada será genérico, sin montos, existencias ni nombres de trabajadores. Consultar el detalle solo tras autenticación y validación de permisos actuales.
- Registrar y renovar dispositivos; desvincularlos al cerrar sesión, cambiar de cuenta o desactivar al usuario. Nunca guardar credenciales del proveedor en la app.
- Cada módulo audita sus eventos y destinatarios; el integrante 1 audita almacenamiento, bandeja de envío, permisos del sistema, apertura del destino y entrega en Android e iOS.

## 11. Lenguajes y portabilidad obligatorios

- Frontend: Dart + Flutter. Backend: TypeScript estricto + NestJS sobre Node.js LTS compatible. Datos: PostgreSQL + TypeORM. Decisión y razones en [0001-stack-y-plataformas.md](docs/decisiones/0001-stack-y-plataformas.md).
- E1-01 registra versiones y compatibilidad; no vuelve a dejar abierta la elección de lenguaje. Conservar archivos de bloqueo y usar migraciones explícitas, sin sincronización automática de esquema.
- El backend usa decimal.js desde cadenas para aritmética exacta; PostgreSQL usa `numeric`. DTO/OpenAPI transmiten dinero y cantidades como cadenas. No introducir `number`, `parseFloat` o `double` como fuente de verdad para esos valores.
- Un `QueryRunner`/`EntityManager` compartido materializa la transacción de ventas e inventario, encapsulado por un puerto común. No acceder a repositorios globales durante ese flujo para salir de su transacción.
- Pantallas y estado del cliente dependen de repositorios y puertos de capacidad, no directamente de plugins móviles. Aislar almacenamiento seguro, notificaciones, impresión y enlaces.
- Registrar compatibilidad Android/iOS/Windows de dependencias. No asumir soporte de escritorio por el solo hecho de que una librería funcione en Flutter móvil.
- La preparación de ventanas amplias y teclado comienza en el MVP; la entrega funcional Windows corresponde a E1-12, E2-11, E3-10 y E4-12. Sus auditorías son obligatorias al ejecutar esa fase, pero no se exigen para declarar terminado el MVP móvil.
- iOS requiere su entorno de compilación Apple; Windows requiere el suyo. Registrar las plataformas realmente compiladas y probadas, y no atribuir validación a macOS/Linux por haber probado Windows.
