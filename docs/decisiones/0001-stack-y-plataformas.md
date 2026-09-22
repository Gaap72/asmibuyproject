# Decisión 0001: lenguajes, stack y crecimiento a PC

- Fecha: 2026-09-20.
- Estado: decisión técnica definida para implementar los planes; la aplicación todavía no está construida.
- Alcance actual: Android e iOS. Preparación desde el inicio para una segunda fase de PC, tomando Windows como primer objetivo de escritorio. macOS y Linux quedan como destinos posibles posteriores.

## Decisión

| Capa | Lenguaje | Tecnología y responsabilidad |
| --- | --- | --- |
| Frontend | Dart | Flutter: una base de pantallas, estado, navegación y acceso a la API para móvil y la futura app de PC. |
| Backend | TypeScript con comprobación estricta | NestJS sobre una versión LTS de Node.js compatible: API, permisos, reglas de negocio, transacciones y procesos de notificación. |
| Persistencia | SQL | PostgreSQL: datos centrales, restricciones, bloqueo y transacciones. TypeORM integra entidades y migraciones con NestJS. |
| Contrato entre cliente y servidor | JSON y OpenAPI | API REST versionada en `/api/v1`; importes y cantidades decimales se transmiten como cadenas, sin pérdida de precisión. |

**Dart es el lenguaje principal de las aplicaciones y TypeScript el complemento del servidor.** Esta es la elección para las necesidades del proyecto, no una afirmación de que exista un lenguaje universalmente mejor.

## Motivos

Flutter permite compilar aplicaciones de escritorio para Windows, macOS y Linux y reutilizar código del cliente. Esto encaja con conservar las pantallas y el estilo gráfico al ampliar el producto. El soporte de un destino no garantiza que todos sus plugins funcionen en él: se revisan uno por uno. [Documentación de Flutter para escritorio](https://docs.flutter.dev/platform-integration/desktop).

La separación de presentación, estado y acceso a datos permite probar la interfaz y adaptar su distribución a distintas entradas y tamaños. Aplicaremos esa separación dentro de los paquetes de cada integrante. [Guía de arquitectura de Flutter](https://docs.flutter.dev/app-architecture/guide).

NestJS aporta una organización por módulos apropiada para repartir el backend entre cuatro responsables y ofrece integración con TypeORM. Mantendremos una sola aplicación de servidor y una base de datos, para simplificar la transacción que une venta e inventario. [NestJS](https://docs.nestjs.com/) y [su integración de base de datos](https://docs.nestjs.com/techniques/database).

PostgreSQL encaja con las relaciones ya definidas y admite tipos numéricos exactos. El inventario y los importes requieren precisión y consistencia; no se tratarán como números aproximados. [Tipos numéricos de PostgreSQL](https://www.postgresql.org/docs/current/datatype-numeric.html).

## Complementos seleccionados

- Persistencia del backend: TypeORM y controlador PostgreSQL. Migraciones explícitas y `synchronize: false` en los entornos del proyecto.
- Cálculos decimales del backend: `decimal.js`, construido desde cadenas y con redondeo explícito. No usar `number`, `parseFloat` o conversiones intermedias de punto flotante para dinero o cantidades exactas. [Documentación de decimal.js](https://mikemcl.github.io/decimal.js/).
- Contrato de API: OpenAPI, DTO de entrada/salida y validación del servidor. Los modelos del cliente son Dart; no se comparten clases TypeScript o entidades ORM con la app.
- Estado del frontend: separación vista/view model/repositorio, con primitivas observables de Flutter como base. No introducir otra librería de estado por módulo. Si aparece una necesidad concreta, acordar una sola solución y registrarla.
- Pruebas: `flutter_test` e `integration_test` en el cliente; Jest y pruebas HTTP/integración sobre PostgreSQL real en el backend. La configuración exacta de comandos se fija en E1-02.
- Móvil: adaptadores para almacenamiento seguro, impresión nativa y push. El servicio push puede usar FCM para Android e iOS con la configuración APNs correspondiente. No añadir Firebase como segunda base de datos ni como otra autoridad de roles.

La elección de servicios móviles no resuelve automáticamente las capacidades de PC. Se registrará una matriz de compatibilidad y se implementarán adaptadores específicos donde haga falta. Para Firebase se comprobará la compatibilidad de cada producto; su documentación advierte límites de uso en Windows. [Matriz oficial de Firebase para Flutter](https://firebase.google.com/docs/flutter/setup).

## Costes y límites de la decisión

- El equipo mantendrá dos lenguajes: Dart y TypeScript. El beneficio buscado es reutilizar el frontend entre plataformas y centralizar todas las reglas que afectan dinero, stock y permisos en el servidor.
- Compartir código no equivale a compartir un ejecutable. Cada sistema necesita su compilación, configuración y comprobaciones.
- La app seguirá necesitando conexión al servidor. La futura versión PC no introduce otra base local operativa ni sincronización sin conexión.
- No se añade una interfaz web. Flutter se utilizará para las aplicaciones acordadas y previstas.
- La versión PC requiere trabajo de distribución de ventanas, teclado, ratón, foco, almacenamiento de sesión, impresión y notificaciones. No se considera terminada por abrir una ventana del proyecto móvil.

## Entornos y versiones

Usar versiones estables y compatibles, fijadas en los archivos del proyecto y de bloqueo al iniciar E1-01/E1-02. No depender permanentemente de «latest» ni copiar una versión de ejemplo sin comprobar compatibilidad.

Para compilar iOS se necesita un entorno macOS con sus herramientas de Apple; el destino Windows se compila con herramientas Windows. Esto debe resolverse en el equipo o en sus entornos de integración antes de declarar entregable una plataforma. [Configuración oficial de plataformas Flutter](https://docs.flutter.dev/install/custom).

La tecnología queda decidida ahora; E1-01 verifica versiones, disponibilidad de equipos, plugins, convenciones y acceso a servicios. No se ha instalado el stack ni ejecutado compilaciones al redactar esta decisión.

## Aplicación a las tareas

- Las 41 tareas del MVP mantienen su alcance móvil y se detallan con Dart/Flutter y TypeScript/NestJS/PostgreSQL.
- E1-02 incorpora una comprobación temprana de portabilidad del contenedor Flutter a Windows y aislamiento de plugins, sin exigir todavía una versión completa de PC.
- Las tareas E1-12, E2-11, E3-10 y E4-12 planifican la segunda fase para Windows. No son prerrequisito para cerrar el MVP Android/iOS.
- Cambiar el stack acordado requiere una nueva decisión que explique el motivo y actualice contratos, planes y guías. No crear una implementación paralela por preferencia individual.
