# Plan del integrante 1: plataforma, identidad y accesos

Estado inicial: pendiente. Responsable personal: por asignar. Revisor principal: integrante 4.

## Resultado a entregar

Una base ejecutable de app móvil Android/iOS y API para los cuatro módulos, inicio de sesión, administración móvil de cuentas y roles, permisos efectivos en servidor, componentes visuales comunes, centro de Avisos, push, auditoría y recuperación. Desarrollar las pantallas y lógica de esta área, no las de los otros integrantes.

Leer [reglas locales](AGENTS.md), [reglas generales](../../AGENTS.md) y [matriz CA](../../docs/matriz-aceptacion.md). Cada tarea requiere una auditoría propia usando la [plantilla](../../docs/auditorias/plantilla.md). Las casillas de implementación solo se cierran con evidencia y revisión independiente; ninguna viene completada.

## Stack y separación de implementación

Frontend: **Dart + Flutter**, en [frontend/](frontend/README.md). Backend: **TypeScript + NestJS**, con **PostgreSQL + TypeORM**, en [backend/](backend/README.md). Coordinar además `app/` y `compartido/`. La [decisión de stack](../../docs/decisiones/0001-stack-y-plataformas.md) ya está definida; se deben verificar versiones y compatibilidad, no elegir otra tecnología por integrante.

Las primeras 11 tareas corresponden al MVP Android/iOS. E1-12 es la fase posterior de Windows; no bloquea el cierre móvil E1-09.

## E1-01 — Fijar versiones, entornos y convenciones del stack

Dependencias: ninguna. Coordinar con los cuatro integrantes. Resultado: decisiones reproducibles sin ampliar el alcance.

- [ ] Fijar versiones estables compatibles de Flutter/Dart, Node.js LTS, TypeScript, NestJS, PostgreSQL, TypeORM y decimal.js; documentar herramientas de compilación/firma para Android/iOS y futura Windows, incluyendo el entorno macOS necesario para iOS.
- [ ] Definir ubicación real de capas, convenciones de identificadores, decimales, moneda, zona horaria y representación de fechas.
- [ ] Registrar matriz de plugins por plataforma y decidir adaptadores para capacidades sin soporte Windows; no introducir otra base de datos o API por plataforma.
- [ ] Elegir estrategia de entrega push Android/iOS, almacenamiento de destinos y ejecución de procesos de eventos; documentar credenciales y entornos necesarios sin guardar secretos.
- [ ] Acordar formatos de contrato, errores, permisos y versionado de datos para detectar cambios antes del cobro.
- [ ] Registrar cómo arrancar un entorno local y qué configuración necesita, sin secretos reales.
- [ ] Cerrar `docs/auditorias/E1-01.md` con revisión estructural y conformidad de los consumidores; no requiere pruebas de negocio todavía.

## E1-02 — Crear la base ejecutable y las herramientas comunes

Dependencias: E1-01. Resultado: módulos conectables y una única infraestructura de transacciones.

- [ ] Inicializar el ejecutable Flutter en `app/frontend/` y NestJS en `app/backend/`, con paquetes locales de cada módulo, workspace Dart y npm workspaces, archivos de bloqueo y entradas públicas.
- [ ] Crear cliente REST y DTO OpenAPI para `/api/v1`, con decimales transmitidos como cadenas, configuración y manejo consistente de errores; conectar el servidor a PostgreSQL.
- [ ] Establecer migraciones con nombres únicos, su orden y un procedimiento para crear una base vacía.
- [ ] Publicar un puerto de transacción respaldado por TypeORM `QueryRunner`/`EntityManager`, compartiendo conexión, bloqueo y rollback entre ventas, inventario y eventos; usar migraciones y `synchronize: false`.
- [ ] Configurar comandos de formato, compilación y pruebas pertinentes, y su ejecución compartida en integración continua si el repositorio la admite.
- [ ] Verificar análisis/pruebas Flutter y TypeScript, pruebas de integración PostgreSQL y compilación inicial del contenedor Windows con adaptadores aislados; esta prueba técnica no equivale a entregar la app PC completa.
- [ ] Comprobar arranque de API y app desde una copia limpia en los entornos móviles acordados, compilación interna y rollback de una operación de prueba; cerrar `docs/auditorias/E1-02.md`.

## E1-03 — Implementar autenticación y sesiones

Dependencias: E1-02. Apoya CA-01 y CA-02.

- [ ] Crear persistencia de usuarios y esquema base de roles para sus relaciones, sin credenciales fijas; el administrador inicial con permisos se configura en E1-04.
- [ ] Implementar inicio/cierre de sesión, almacenamiento seguro de contraseñas y validación de cuenta activa.
- [ ] Implementar restablecimiento administrativo de contraseña con autorización; evitar que sesiones previas eludan la desactivación o los cambios de credenciales.
- [ ] Desarrollar pantalla móvil de acceso, almacenamiento seguro de sesión y manejo de credenciales inválidas, sesión terminada y reanudación de la app.
- [ ] Verificar acceso válido, inválido y sesión de usuario desactivado; cerrar `docs/auditorias/E1-03.md`.

## E1-04 — Implementar roles, permisos y alcance

Dependencias: E1-03 y contratos iniciales E2-01, E3-01 y E4-01 para acordar sus códigos de permiso. Responsable de CA-01, CA-02 y CA-03.

- [ ] Crear roles, catálogo de permisos, asignación de un rol por usuario y configuración inicial de dueño, caja y almacén; ejecutar el procedimiento documentado del primer administrador sin contraseñas fijas.
- [ ] Publicar el verificador del servidor y definir consulta de ventas propias frente a consulta de todas las ventas.
- [ ] Aplicar los cambios de permisos en la siguiente operación protegida y evitar escalamiento por parámetros manipulados.
- [ ] Proteger la última cuenta administradora ante desactivación, cambios de rol o permisos y solicitudes concurrentes.
- [ ] Verificar solicitudes directas autorizadas/prohibidas y los límites anteriores; cerrar `docs/auditorias/E1-04.md`. La evidencia de CA-01 se completa con el consumidor de ventas integrado.

## E1-05 — Desarrollar administración de usuarios y roles

Dependencias: E1-04. Apoya CA-01 a CA-03.

- [ ] Crear pantallas móviles para listar, crear, editar, activar/desactivar cuentas y restablecer sus contraseñas.
- [ ] Crear pantallas para roles, selección de permisos y asignación de rol a cuentas.
- [ ] Impedir retirar roles con usuarios asignados y mostrar errores de continuidad administrativa.
- [ ] Incorporar estados de carga, vacío, validación y error; comprobar un flujo completo desde la pantalla hasta el servidor.
- [ ] Cerrar `docs/auditorias/E1-05.md` con revisión de interfaz y permisos.

## E1-06 — Implementar bitácora administrativa común

Dependencias: E1-02 y E1-04. Complementa las secciones 8 y 10 de `spec.md`.

- [ ] Crear `bitacora_eventos` y una interfaz para registrar autor, acción, entidad, fecha y cambios relevantes.
- [ ] Registrar modificaciones de cuentas, roles y permisos sin incluir contraseñas ni tokens.
- [ ] Entregar ejemplos para que los integrantes 2 y 3 registren cambios de catálogo, umbrales y promociones; el 4 mantiene además su trazabilidad de ventas.
- [ ] Garantizar consistencia entre cambio administrativo y evento, sin crear pantallas de auditoría no previstas.
- [ ] Verificar autoría, ausencia de secretos y comportamiento ante fallo; cerrar `docs/auditorias/E1-06.md`.

## E1-07 — Entregar composición gráfica, navegación y componentes comunes

Dependencias: E1-02 y E1-04. Responsable de CA-29 y CA-30 con participación de todas las pantallas; guía en `docs/diseno-interfaz.md`.

- [ ] Crear navegación Cupertino con destinos Inicio, Venta, Gestión y Avisos autorizados; conservar estado y retorno en Android e iOS.
- [ ] Publicar tokens de la paleta verde/morado/rojo/amarillo y neutros, Roboto y Material Symbols Rounded empaquetados, más componentes Cupertino de formularios, listas, hojas y mensajes.
- [ ] Verificar contraste, escala tipográfica, áreas táctiles, texto ampliado y lectores de pantalla; mantener el seguimiento por pantalla de `docs/diseno-interfaz.md`.
- [ ] Preparar espacios del inicio del BackOffice para resumen de ventas y alertas; los datos y componentes de negocio los entregan los integrantes 4 y 2.
- [ ] Comprobar navegación protegida, llamadas directas a la API, enlaces internos si existen, regreso y reanudación, y ausencia de errores si falta permiso para un apartado.
- [ ] Cerrar `docs/auditorias/E1-07.md` con revisión de integración de pantallas.

## E1-08 — Preparar y verificar recuperación

Dependencias: E1-02, E1-11, E2-09, E3-08 y E4-10 para la comprobación final. El procedimiento puede prepararse antes; las tareas de los otros módulos no deben esperar a esta. Responsable de CA-28.

- [ ] Documentar configuración, migraciones, creación inicial del administrador, respaldo y restauración.
- [ ] Preparar datos sintéticos con usuarios, permisos, recetas, promociones, ventas, cancelaciones y movimientos.
- [ ] Generar un respaldo con eventos, lectura y preferencias de notificaciones y restaurarlo en una base aislada sin sustituir datos operativos; deshabilitar push en la prueba y documentar conciliación de pendientes.
- [ ] Comprobar relaciones, saldos, totales y posibilidad de iniciar sesión y consultar el historial restaurado.
- [ ] Registrar comandos y resultados reales y cerrar `docs/auditorias/E1-08.md`; aprobar CA-28 únicamente después de restaurar.

## E1-09 — Coordinar la entrega técnica integrada

Dependencias: E1-05 a E1-08, E1-10, E1-11, E2-09, E3-08 y E4-10.

- [ ] Verificar compilación interna y ejecución de la app en las plataformas acordadas, conexión a la API y migraciones desde cero. Registrar dispositivo/emulador/simulador usado; no declarar validada una plataforma no comprobada.
- [ ] Revisar junto al equipo la matriz de 35 CA, seguimiento visual y auditorías por tarea; no sustituir revisiones ausentes con una aprobación global.
- [ ] Repetir controles compartidos solo sobre la versión candidata final o cambios que afecten la integración.
- [ ] Registrar limitaciones conocidas sin presentar módulos pendientes como terminados.
- [ ] Cerrar `docs/auditorias/E1-09.md` cuando la versión, las evidencias y los procedimientos de operación sean reproducibles.

## E1-10 — Implementar centro de Avisos y contrato de eventos

Dependencias: E1-02, E1-04, E1-06 y E1-07. Responsable de CA-31 y CA-34; contrato consumidor para los otros tres módulos.

- [ ] Crear eventos transaccionales pendientes, destinatarios por usuario, lectura y preferencias; documentar el contrato y claves de deduplicación antes de integrar consumidores.
- [ ] Registrar eventos en la transacción recibida y procesarlos después del commit; deduplicar por evento/usuario, validar destinatarios y estado vigente, y no repetir acciones de negocio durante reintentos.
- [ ] Crear centro Cupertino de Avisos, filtros por módulo/lectura, contador de no leídos no resueltos, acciones de lectura y preferencias push; sincronizar estado por usuario entre dispositivos.
- [ ] Proteger consulta, contador y destino con cuenta activa y permisos actuales; resolver recursos inaccesibles sin revelar detalles.
- [ ] Verificar con datos persistidos rollback, procesamiento repetido, lectura entre dispositivos y denegación de acceso; cerrar `docs/auditorias/E1-10.md`. Los productores reales completan la comprobación integrada.

## E1-11 — Implementar push y apertura segura en Android/iOS

Dependencias: E1-10 y E1-03. Responsable de CA-32 y CA-33; apoya CA-34.

- [ ] Integrar permisos en contexto, preferencias por módulo, registro/renovación de destinos y desvinculación al cerrar sesión, cambiar de cuenta o desactivar al usuario.
- [ ] Implementar adaptadores de envío y registro de intentos, identificadores estables, reintentos limitados y limpieza de destinos inválidos; mantener credenciales fuera del móvil.
- [ ] En primer plano actualizar el centro con un solo banner interno; fuera de la app usar mensajes nativos genéricos y abrir solo destinos autorizados tras validar sesión.
- [ ] Verificar ambos sistemas en dispositivos con permiso concedido, denegado y revocado, pérdida de conexión, cambio de usuario y proveedor indisponible; no exigir entrega garantizada en situaciones que el sistema operativo impida.
- [ ] Confirmar que el centro y las operaciones funcionan sin push y que ningún fallo de entrega revierte operaciones; cerrar `docs/auditorias/E1-11.md` con evidencia real Android/iOS.

## E1-12 — Fase PC: entregar base Windows y capacidades nativas

Dependencias: E1-09. Fase posterior al MVP; criterio PC-01 de `docs/arquitectura-tecnica.md`.

- [ ] Preparar compilación e instalación Windows de la app Flutter, reutilizando paquetes, autenticación y la misma API NestJS.
- [ ] Adaptar navegación a ventanas y teclado/ratón, con sesión segura, foco y diseño compartido; no crear una interfaz web alternativa.
- [ ] Completar adaptadores Windows de almacenamiento, notificaciones externas, impresión y enlaces; verificar sus capacidades reales, sin asumir equivalencia con plugins móviles.
- [ ] Verificar instalación, inicio/cierre de sesión, permisos, cambio de cuenta, ventanas reducidas/amplias y recepción/apertura de avisos; documentar los entornos Windows soportados.
- [ ] Cerrar `docs/auditorias/E1-12.md` con evidencia Windows y entregar la base a los otros integrantes; la verificación de toda la operación PC se completa en E4-12.

## Lista de cierre del MVP del integrante

- [ ] Once tareas del MVP entregadas y auditadas; E1-12 queda registrada para la fase PC posterior y no bloquea E1-09.
- [ ] CA-01, CA-02, CA-03, CA-28 y CA-29 a CA-34 con evidencia integrada y revisión de sus colaboradores.
- [ ] Composición gráfica y notificaciones internas/push operativas en Android e iOS.
- [ ] Contratos comunes, ejecución local y recuperación entregados al equipo.
- [ ] Sin credenciales reales en código, documentación ni evidencias.
