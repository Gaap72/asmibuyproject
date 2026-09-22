# Servidor NestJS: punto de composición

Responsable: integrante 1. Stack: TypeScript estricto + NestJS + Node.js LTS + PostgreSQL/TypeORM. Leer [arquitectura](../../docs/arquitectura-tecnica.md), [decisión](../../docs/decisiones/0001-stack-y-plataformas.md) y [reglas de plataforma](../../modulos/plataforma-accesos/AGENTS.md).

Aquí se creará el ejecutable que importa los módulos backend, configura la única base PostgreSQL, registra validación/errores y expone `/api/v1` con contrato OpenAPI. También compone el proceso de notificaciones pendientes y evaluación de vigencias.

No implementar aquí reglas de ingredientes, promociones u órdenes. Permanecen en `modulos/<modulo>/backend/`. Usar migraciones explícitas en `base-datos/migraciones/`, transacciones comunes y configuración por entorno sin secretos publicados. Móvil y PC consumirán la misma API.

Tareas: E1-01, E1-02, E1-06, E1-10 y E1-11. La auditoría incluye arranque, migración desde cero, errores y rollback sobre PostgreSQL real. Este directorio contiene una guía, no un servidor ya ejecutable.
