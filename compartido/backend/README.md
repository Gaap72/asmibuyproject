# Infraestructura compartida del servidor

Responsable: integrante 1. Lenguaje: TypeScript estricto. Leer [arquitectura](../../docs/arquitectura-tecnica.md) y [reglas de plataforma](../../modulos/plataforma-accesos/AGENTS.md).

Este paquete reunirá contexto de transacción, errores estructurados, representación exacta de dinero/cantidades, reloj de servidor y contratos comunes mínimos. El registro de eventos y los permisos pertenecen al módulo de plataforma y se exponen por su contrato; no se duplican aquí.

El contexto transaccional permite pasar el mismo `QueryRunner`/`EntityManager` entre adaptadores sin acoplar el dominio a TypeORM. Las reglas de redondeo deben ser explícitas y comprobadas, usando decimal.js desde cadenas. No convertir esta carpeta en un contenedor de todos los servicios del sistema.

Tareas: E1-01, E1-02 y colaboración E3-03/E3-05/E4-04. Auditar exactitud decimal, rollback compartido y ausencia de dependencias circulares.
