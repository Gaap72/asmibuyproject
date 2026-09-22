# Aplicación Flutter: punto de composición

Responsable: integrante 1. Stack: Dart + Flutter. Leer [arquitectura](../../docs/arquitectura-tecnica.md), [decisión](../../docs/decisiones/0001-stack-y-plataformas.md) y [reglas de plataforma](../../modulos/plataforma-accesos/AGENTS.md).

Aquí se creará el ejecutable Flutter que compone los paquetes frontend de los cuatro módulos. Contendrá el arranque, navegación autorizada, inyección de servicios, configuración de API y runners Android/iOS; Windows se habilitará para la comprobación inicial de portabilidad y su entrega completa corresponde a E1-12.

Las pantallas de negocio permanecen en `modulos/<modulo>/frontend/`. Los tokens y adaptadores comunes pertenecen a `compartido/frontend/`. No guardar credenciales de base de datos ni lógica de servidor en este paquete.

Tareas: E1-01, E1-02, E1-07, E1-11 y E1-12. Antes de cerrar cada una se verifica el arranque aplicable, las rutas y plataformas afectadas y su auditoría individual. Este directorio contiene una guía, no un proyecto Flutter inicializado.
