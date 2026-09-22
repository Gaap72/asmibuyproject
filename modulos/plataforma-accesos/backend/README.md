# Backend de plataforma y accesos

Responsable: integrante 1. Lenguaje: TypeScript estricto con NestJS. Persistencia: PostgreSQL mediante TypeORM. Leer [AGENTS del módulo](../AGENTS.md), [plan](../plan.md) y [arquitectura](../../../docs/arquitectura-tecnica.md).

Separar `src/dominio/`, `aplicacion/`, `infraestructura/` e `interfaz/`, con pruebas en `test/`. Exportar el módulo NestJS y los contratos públicos de identidad, permisos, auditoría y eventos. El arranque y la conexión global se componen desde `app/backend/`.

- [ ] E1-03/E1-04: identidad, sesiones, un rol por cuenta, permisos y protección del último administrador.
- [ ] E1-06: bitácora sin secretos y consistente con los cambios administrativos.
- [ ] E1-10/E1-11: bandeja transaccional de eventos, destinatarios, preferencias, dispositivos y adaptadores de entrega.
- [ ] E1-08: respaldo/restauración PostgreSQL con envíos externos deshabilitados durante pruebas.

Entregar DTO/OpenAPI; no exponer entidades ORM directamente. Verificar autorización en servidor para móvil y PC sin crear una API distinta por sistema operativo. Auditar cambios de permisos durante sesiones, duplicados, rollback y recepción de solicitudes desde clientes distintos. Seguir las auditorías por ID del plan.
