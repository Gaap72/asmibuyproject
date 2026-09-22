# Frontend de plataforma y accesos

Responsable: integrante 1. Lenguaje: Dart con Flutter. Leer [AGENTS del módulo](../AGENTS.md), [plan](../plan.md) y [arquitectura general](../../../docs/arquitectura-tecnica.md).

Paquete del cliente para acceso, cuentas, roles, navegación y centro de Avisos. Separar `lib/src/presentacion/` —pantallas y view models—, `datos/` —API y repositorios cliente— y modelos de presentación cuando hagan falta. Exponer una entrada pública para `app/frontend/` y ubicar las pruebas en `test/`.

Lista de implementación vinculada al plan:

- [ ] E1-03/E1-05: acceso, administración y sesión segura, consumiendo la API NestJS.
- [ ] E1-07: componer Cupertino, Roboto, Material Symbols y tokens desde `compartido/frontend/`.
- [ ] E1-10/E1-11: centro, preferencias, permisos de push y apertura autorizada mediante adaptadores Android/iOS.
- [ ] E1-12, fase PC: adaptar ventana, teclado y capacidades Windows conservando los paquetes y la API.

No confiar en los permisos visuales como autorización final. No vincular una notificación a un usuario distinto tras cambiar de cuenta. Auditar estados de sesión, accesibilidad, capturas y los sistemas realmente comprobados. Estas casillas son referencias a las tareas, no entregas adicionales sin auditoría.
