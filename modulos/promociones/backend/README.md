# Backend de promociones

Responsable: integrante 3. Lenguaje: TypeScript estricto con NestJS y decimal.js. Persistencia: PostgreSQL/TypeORM. Leer [AGENTS](../AGENTS.md), [plan](../plan.md) y [arquitectura](../../../docs/arquitectura-tecnica.md).

El motor se implementa como reglas puras en `src/dominio/`, sin HTTP, ORM ni lectura implícita del reloj. Los casos de uso en `aplicacion/` aportan datos e instante del servidor. Persistencia y consultas consistentes van en `infraestructura/`; controladores y DTO en `interfaz/`.

- [ ] E3-02: configuración, estados y vigencias.
- [ ] E3-03/E3-04/E3-05: descuentos exactos, NxM, mayor ahorro y distribución de centavos.
- [ ] E3-07: contrato de evaluación y copia histórica para ventas, usando el contexto consistente recibido.
- [ ] E3-09: evaluación periódica del servidor y eventos idempotentes de vigencia.

No usar `number` para dinero ni convertir valores decimales exactos a flotante para compararlos. El mismo motor atiende a móvil y PC. Probar resultados conocidos, empates, sobrantes y redondeo; no calcular el resultado esperado invocando el mismo algoritmo. Cada entrega conserva su auditoría por ID.
