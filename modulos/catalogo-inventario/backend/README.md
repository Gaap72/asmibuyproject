# Backend de catálogo e inventario

Responsable: integrante 2. Lenguaje: TypeScript estricto con NestJS. PostgreSQL/TypeORM para persistencia; decimal.js para cantidades exactas. Leer [AGENTS](../AGENTS.md), [plan](../plan.md) y [arquitectura](../../../docs/arquitectura-tecnica.md).

Separar reglas en `src/dominio/`, casos de uso en `aplicacion/`, persistencia y bloqueos en `infraestructura/`, y controladores/DTO en `interfaz/`. No crear otro servidor ni conexión global por módulo.

- [ ] E2-02/E2-03: catálogo, recetas, restricciones, movimientos y compensaciones.
- [ ] E2-04/E2-08: consumo y reintegro con el mismo contexto transaccional proporcionado por ventas.
- [ ] E2-05/E2-10: condición individual de stock y eventos por transición, guardados junto con la operación.
- [ ] E2-09 y posteriormente E2-11: comprobar que clientes móviles y Windows observan la misma fuente de datos.

Usar `numeric` con escala explícita; no convertir cantidades por `number`. Bloquear ingredientes en orden estable y probar demanda compartida, concurrencia, reintegros históricos y rollback sobre PostgreSQL real. No usar repositorios fuera del `EntityManager` de la operación al consumir o reintegrar. Auditar cada tarea en su archivo previsto.
