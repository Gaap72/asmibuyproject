# Organización del equipo para el MVP

Esta carpeta contiene la especificación del sistema y una distribución de desarrollo para cuatro integrantes. Los números identifican responsabilidades; pueden reemplazarse por los nombres del equipo cuando se asignen.

El MVP se entregará en Android e iOS, preparado para una segunda fase en PC con Windows como primer destino. Punto de Venta y BackOffice vivirán en una app Dart/Flutter; la API TypeScript/NestJS y PostgreSQL central se ejecutarán en servidor. No se incluye una interfaz web. La fase PC reutiliza el cliente y la API, adaptando ventanas, teclado, ratón y capacidades nativas.

Se emplea `AGENTS.md` como nombre de los archivos de reglas. La referencia inicial a `AGENTS.ms` se interpretó como una errata.

## Documentos de entrada

- [Especificación funcional](spec.md).
- [Reglas universales](AGENTS.md).
- [Matriz de los 35 criterios de aceptación](docs/matriz-aceptacion.md).
- [Plantilla de auditoría por tarea](docs/auditorias/plantilla.md).
- [Composición gráfica y seguimiento de diseño](docs/diseno-interfaz.md).
- [Decisión de lenguajes y stack](docs/decisiones/0001-stack-y-plataformas.md).
- [Arquitectura y criterios de la fase PC](docs/arquitectura-tecnica.md).
- [Arranque del frontend Flutter](app/frontend/README.md) y [backend NestJS](app/backend/README.md).

## Reparto de trabajo

| Integrante | Parte del programa | Plan | Reglas locales |
| --- | --- | --- | --- |
| 1 | Plataforma, accesos, diseño compartido, centro de Avisos, push y recuperación. | [Plan 1](modulos/plataforma-accesos/plan.md) | [AGENTS 1](modulos/plataforma-accesos/AGENTS.md) |
| 2 | Ingredientes, platillos, recetas, inventario y alertas personalizadas. | [Plan 2](modulos/catalogo-inventario/plan.md) | [AGENTS 2](modulos/catalogo-inventario/AGENTS.md) |
| 3 | Descuentos, vigencias, permanencia, 2×1, 3×1, 3×2 y cálculo de promociones. | [Plan 3](modulos/promociones/plan.md) | [AGENTS 3](modulos/promociones/AGENTS.md) |
| 4 | Órdenes, caja, cobro, cancelaciones, comprobantes, historial y reportes. | [Plan 4](modulos/ventas-reportes/plan.md) | [AGENTS 4](modulos/ventas-reportes/AGENTS.md) |

Cada integrante construye las pantallas, reglas, persistencia y verificaciones de su área. Así se pueden entregar partes completas y evitar que toda la interfaz dependa de una sola persona. La integración final tiene responsabilidades repartidas: el integrante 1 coordina entorno y ejecución; el 4 coordina el flujo de venta; cada propietario resuelve los hallazgos de su módulo.

La composición se comparte entre módulos: Cupertino para interfaz/navegación, Roboto para texto, Material Symbols Rounded para iconos y paleta verde, morado, rojo y amarillo con superficies suaves. Las capturas y auditorías se registran por pantalla en la guía de diseño.

El alcance actualizado incluye notificaciones dentro de la app y push Android/iOS. El integrante 1 mantiene el mecanismo común; inventario, promociones y ventas producen sus eventos. Sustituye la exclusión anterior de push y no incorpora correo, SMS o chat.

## Prompts para iniciar el trabajo

Cada integrante puede copiar el contenido completo de su archivo en su asistente de desarrollo, abierto en la raíz del proyecto. Los prompts indican responsabilidad, lectura, primera tarea y auditoría; los detalles y dependencias completos siguen en cada `plan.md` y `AGENTS.md`.

| Integrante | Prompt listo para copiar | Primera tarea |
| --- | --- | --- |
| 1 — Plataforma y accesos | [prompt.md](modulos/plataforma-accesos/prompt.md) | E1-01 |
| 2 — Catálogo e inventario | [prompt.md](modulos/catalogo-inventario/prompt.md) | E2-01 |
| 3 — Promociones | [prompt.md](modulos/promociones/prompt.md) | E3-01 |
| 4 — Ventas y reportes | [prompt.md](modulos/ventas-reportes/prompt.md) | E4-01 |

Las cuatro tareas iniciales permiten acordar contratos en paralelo. Después se respetan las dependencias de implementación y las revisiones entre integrantes. Estos prompts no inician agentes automáticamente ni completan tareas por sí mismos.

## Cómo usar los planes

1. Leer `spec.md`, el `AGENTS.md` general y los dos documentos del módulo asignado.
2. Comenzar por contratos y acuerdos. En E1-01 fijar versiones compatibles de Dart/Flutter, TypeScript/NestJS, PostgreSQL/TypeORM, entornos, moneda y zona horaria. El stack ya está definido.
3. Respetar las dependencias por ID. Los contratos permiten construir en paralelo con datos simulados claramente identificados.
4. Registrar cada entrega en `docs/auditorias/<ID>.md` y pedir revisión a otro integrante.
5. Marcar las casillas de cierre solo después de verificar, corregir hallazgos e integrar el cambio.

La jerarquía de archivos es intencional: el `AGENTS.md` raíz aplica al proyecto entero y el archivo de cada módulo aplica al código que se cree bajo ese módulo. Si se cambia esa ubicación, trasladar también las instrucciones para conservar su alcance.

Cada módulo tiene ahora carpetas `frontend/` y `backend/` con su guía de implementación. Son paquetes locales que se integrarán en una sola aplicación y un solo servidor. Las carpetas de arranque y compartidas también tienen guías; todavía no contienen una app compilable ni un backend implementado.

## Orden de trabajo y dependencias

| Etapa | Trabajo y responsables | Condición para avanzar |
| --- | --- | --- |
| 0. Acuerdos | E1-01 y E1-02; contratos E2-01, E3-01 y E4-01. | Entornos Android/iOS, estructura, tipos, permisos, migraciones, transacciones y contratos compatibles. |
| 1. Fundamentos en paralelo | Identidad E1-03/E1-04; catálogo e inventario E2-02/E2-03; promociones E3-02/E3-03/E3-04; borradores E4-02. | Datos y reglas básicos verificables en cada módulo. |
| 2. Primera venta integrada | Inventario E2-04, cálculo E3-05/E3-07, cotización E4-03 y confirmación E4-04. | Venta y consumos atómicos, precio aceptado e idempotencia. |
| 3. Operación completa | Pantallas, alertas, reintegros, cancelación, comprobantes y reportes; centro E1-10, push E1-11 y eventos E2-10/E3-09/E4-11. | Uso completo y avisos operativos por dueño, caja y almacén. |
| 4. Auditoría y entrega | Cierres E2-09, E3-08, E4-09, E4-10 y E1-09; restauración E1-08. | 35 CA verificados, seguimiento visual aprobado y procedimientos de ejecución y recuperación comprobados. |
| 5. Fase PC posterior | E1-12, E2-11, E3-10 y E4-12. | Criterios PC-01 a PC-04 verificados en Windows, incluyendo interacción, sesión y capacidades del destino. |

Estas etapas son hitos de integración, no semanas ni una estimación de duración. Las pantallas y documentación independientes pueden avanzar antes de cerrar una etapa. Una tarea de cierre valida lo ya construido; no debe utilizarse como dependencia previa para empezar su propia implementación.

Hay 45 tareas documentadas: 41 del MVP móvil y 4 de la fase PC posterior. Por integrante: 12, 11, 10 y 12 respectivamente. Los IDs conservan las referencias anteriores y se ejecutan por dependencias, no necesariamente en orden numérico. Las tareas de notificaciones preceden a los cierres móviles; las tareas PC no son prerrequisito de esos cierres.

## Acuerdos de integración que deben respetarse

| Productor | Consumidor | Entrega |
| --- | --- | --- |
| Integrante 1 | Los otros tres | Contexto de usuario, permisos, transacción, bitácora, tokens/componentes visuales y contrato de eventos/notificaciones. |
| Integrante 2 | Integrantes 3 y 4 | Catálogo de platillos activos y precios; al 4 además demanda de ingredientes, disponibilidad, consumo y reintegro dentro de su transacción. |
| Integrante 3 | Integrante 4 | Evaluación de promociones sin escrituras de venta: subtotal, descuento, total, bonificaciones por partida y copia histórica de reglas. |
| Integrante 4 | BackOffice y reportes | Órdenes e importes confirmados, estados y cancelaciones; usa lecturas públicas de inventario cuando corresponda. |
| Integrantes 2, 3 y 4 | Servicio común de Avisos | Eventos transaccionales de stock, vigencia de promociones y cancelaciones, con destinatarios elegibles y claves de deduplicación. |

No se duplica el cálculo de precios en caja ni se permite que inventario confirme por separado los movimientos de una venta. Los contratos se documentarán en `docs/contratos/` durante las tareas iniciales; sus nombres y datos deben acordarse antes de consumirlos.

## Revisión y definición de terminado

Cada tarea requiere autoauditoría y revisión de otro integrante, incluso si solo modifica estructura, contratos o documentación. Las evidencias se ajustan al tipo de trabajo. No es necesario escribir pruebas artificiales para cambios documentales.

Una tarea no está terminada si falta una dependencia real, solo funciona con simulaciones, incumple su contrato, carece de auditoría o mantiene un defecto que afecte permisos, dinero, inventario o historial.

Las revisiones de interfaz se hacen sobre la app en emulador, simulador o dispositivo Android/iOS. La validación final incluye dispositivos físicos de ambas plataformas y casos de pérdida de conexión, suspensión y reanudación; si un entorno de una plataforma objetivo no está disponible, se registra como pendiente y no se declara esa plataforma validada.

Para diseño se revisan Cupertino, fuente, iconos, colores, contraste, texto ampliado y lectores de pantalla. Para notificaciones se revisan ambos canales, permisos denegados/revocados, lectura, destinatarios, reintentos y apertura segura, sin atribuir entrega garantizada a un proveedor push.

Al crear estos documentos, todas las tareas de implementación y los criterios CA permanecen pendientes. No se ha desarrollado ni probado la aplicación.
