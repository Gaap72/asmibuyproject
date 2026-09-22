# Frontend de promociones

Responsable: integrante 3. Lenguaje: Dart con Flutter. Leer [AGENTS](../AGENTS.md), [plan](../plan.md) y [arquitectura](../../../docs/arquitectura-tecnica.md).

Mantener formularios, estado y navegación en `lib/src/presentacion/`, y DTO/repositorios de la API en `datos/`. Usar componentes Cupertino y tokens comunes. La app configura promociones y presenta resultados del servidor; no incorpora una copia del motor NxM.

- [ ] E3-06: administrar porcentaje, monto, cantidad, participantes y Temporal/Permanente.
- [ ] E3-07: entregar a caja presentación de nombre, ahorro y bonificaciones del resultado económico.
- [ ] E3-09: abrir avisos de vigencia desde el centro compartido sin depender de temporizadores del teléfono.
- [ ] E3-10, fase PC: adaptar formularios y selección de participantes a ventana, teclado y ratón.

Conservar los decimales como datos exactos y la zona horaria acordada. No inferir vigencia final a partir del reloj del dispositivo ni alterar el descuento recibido. Auditar ambas plataformas móviles y después Windows, incluyendo fechas, texto ampliado y equivalencia de resultados para el mismo contrato.
