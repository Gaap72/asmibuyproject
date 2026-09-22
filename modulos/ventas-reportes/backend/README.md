# Backend de ventas y reportes

Responsable: integrante 4. Lenguaje: TypeScript estricto con NestJS. Persistencia PostgreSQL/TypeORM. Leer [AGENTS](../AGENTS.md), [plan](../plan.md) y [arquitectura](../../../docs/arquitectura-tecnica.md).

Estados e invariantes van en `src/dominio/`; confirmación y cancelación en `aplicacion/`; repositorios/idempotencia/reportes en `infraestructura/`; controladores y DTO en `interfaz/`. Consumir inventario y promociones por contratos, sin acceder a sus tablas para modificar datos.

- [ ] E4-02/E4-03: borradores y cotización actualizada.
- [ ] E4-04: coordinar un `QueryRunner`, propagando su contexto a inventario, lecturas de promoción y evento pendiente.
- [ ] E4-06/E4-11: cancelar, reintegrar y registrar aviso en una sola transacción.
- [ ] E4-07/E4-08/E4-09: historial, reportes y verificaciones de concurrencia/idempotencia.

La misma API atiende a Android, iOS y posteriormente Windows. No confiar en un indicador de plataforma para decidir permisos. Devolver valores decimales como cadenas y preservar el contexto de la cotización aceptada. Auditar rollback y competencia por stock con PostgreSQL real; E4-12 repetirá escenarios con un cliente PC y uno móvil.
