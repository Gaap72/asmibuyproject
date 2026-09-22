# Instrucciones del integrante 1: plataforma y accesos

Leer primero [AGENTS.md general](../../AGENTS.md), [spec.md](../../spec.md) y [plan propio](plan.md). Estas reglas complementan las universales.

## Responsabilidad y límites

Eres responsable de la base técnica, arranque, identidad, sesiones, usuarios, roles, permisos, bitácora común, composición gráfica compartida, centro de Avisos, entrega push, verificaciones compartidas, respaldo y restauración. Coordinas `app/`, `compartido/` y la convención de migraciones, pero no desarrollas por defecto todas las migraciones ni todas las pantallas del equipo.

La interfaz usa Dart/Flutter para Android e iOS, con preparación para Windows en una segunda fase, y consume una API central TypeScript/NestJS con PostgreSQL/TypeORM. Verificar versiones y entornos de compilación/firma, sin reabrir la elección de stack por módulo. No convertir el BackOffice en un portal web.

Tus tablas son `usuarios`, `roles`, `permisos`, `rol_permisos`, `bitacora_eventos`, `eventos_notificacion`, `notificaciones_usuario`, `dispositivos_notificacion`, `preferencias_notificacion` y `envios_notificacion`. No implementes reglas de stock, selección de promociones ni estados de cobro dentro de este módulo.

## Reglas de estructura

- Mantén políticas de autorización y continuidad del último administrador en `dominio/` y sus casos de uso en `aplicacion/`.
- Aísla persistencia, hash de contraseñas, sesiones y escritura de bitácora en `infraestructura/`.
- Ubica las pantallas y view models en `frontend/lib/src/presentacion/`, y los controladores de API en `backend/src/interfaz/`. Las capas de servidor mencionadas aquí pertenecen a `backend/src/`. El código TypeScript no se empaqueta en la app Flutter.
- Publica interfaces comunes pequeñas; no crees un archivo global que mezcle servicios de todas las áreas.
- Documenta el mecanismo de composición de rutas y pantallas para que los demás registren sus módulos sin editar simultáneamente el mismo archivo.
- La transacción compartida debe permitir que ventas e inventario trabajen con la misma conexión y el mismo commit o rollback.

## Reglas funcionales

- Una cuenta tiene un rol; un rol tiene varios permisos del catálogo definido por la aplicación.
- La desactivación de cuenta y los cambios de permisos surten efecto en la siguiente operación protegida.
- Un usuario no puede asignarse permisos por alterar datos enviados desde el cliente.
- No permitir eliminar o degradar la última cuenta administradora activa, incluso ante solicitudes concurrentes.
- La creación inicial del administrador no usa contraseñas fijas publicadas en el repositorio. Documentar un procedimiento local seguro.
- No guardar secretos en bitácoras ni incluir registro público, recuperación por correo o servicios externos no acordados. Los servicios de entrega push Android/iOS sí forman parte del alcance actualizado; sus credenciales permanecen en servidor.
- Almacenar sesiones en el mecanismo seguro de la plataforma, contemplar reanudación de la app y no dar por vigente un permiso solo porque está en caché.
- El registro de un cambio administrativo y su evento de bitácora deben permanecer consistentes; documentar cómo se garantiza.

## Contratos de salida

Entregar a los demás: usuario autenticado, validación de permiso y alcance, errores de autenticación/autorización, mecanismo de transacción, registro de evento administrativo, componentes comunes y procedimiento de ejecución local. Las reglas de negocio específicas siguen perteneciendo a su módulo.

## Auditoría obligatoria

Por cada tarea, completar `docs/auditorias/<ID>.md`. Revisor principal: integrante 4. Para el contexto de transacción, solicitar además revisión de los integrantes 2 y 4.

Revisar especialmente solicitudes directas sin permiso, sesión de usuario desactivado, permisos retirados durante una sesión, último administrador, acceso a ventas ajenas y ausencia de secretos en registros. Comprobar respaldo y restauración sobre una base aislada con datos representativos, sin sobrescribir información operativa.

No marcar las tareas de infraestructura como terminadas sin instrucciones reproducibles para otra persona. Para una decisión documental, auditar coherencia y dependencias; para una migración o sesión, ejecutar las comprobaciones funcionales pertinentes. No declarar aprobado CA-28 solo porque se creó un archivo de respaldo: restaurarlo y verificar sus datos.

Registrar sistema operativo y entorno móvil de cada prueba visual. Entregar compilaciones internas reproducibles para las plataformas acordadas; publicar en tiendas no forma parte de estas tareas.

## Diseño y notificaciones de tu área

Mantener los tokens, Roboto, Material Symbols Rounded y componentes Cupertino definidos en el [AGENTS general](../../AGENTS.md) y la [guía visual](../../docs/diseno-interfaz.md). E1-07 entrega esa base a los demás; no permitir que cada módulo defina una paleta o navegación distinta. Auditar capturas, contraste, aumento de texto y lectores de pantalla en ambos sistemas.

Entregar un contrato de eventos que los otros módulos puedan escribir en su misma transacción. Mantener el centro interno y la entrega externa separados de las reglas que producen el evento. Procesar después del commit, deduplicar destinatarios, reintentar envíos sin repetir acciones de negocio y descartar avisos que ya no sean pertinentes.

Verificar denegación/revocación del permiso, preferencias por módulo, renovación de tokens, cambio de cuenta, acceso al destino, lectura entre dispositivos y mensajes genéricos en pantalla bloqueada. No prometer que la aceptación del proveedor equivale a visualización garantizada. La restauración de prueba debe mantener desactivada la salida push.

## Stack, carpetas y fase PC

Aplicar [frontend/README.md](frontend/README.md), [backend/README.md](backend/README.md) y la [arquitectura](../../docs/arquitectura-tecnica.md). Componer los paquetes de los cuatro integrantes en `app/frontend/` y `app/backend/`. Centralizar cliente HTTP, tokens visuales, puertos de dispositivo y contexto TypeORM en las carpetas compartidas correspondientes.

Antes de incorporar una dependencia móvil, documentar su soporte de escritorio o su aislamiento detrás de un adaptador. Comprobar desde E1-02 que la base cliente puede compilar para Windows sin arrastrar inicialización móvil incompatible. La entrega funcional de PC, su instalación, teclado/ratón y capacidades nativas se audita en E1-12, después del cierre móvil; no afirmar compatibilidad de push Windows solo por tener FCM configurado en Android/iOS.
