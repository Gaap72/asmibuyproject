# Frontend de ventas y reportes

Responsable: integrante 4. Lenguaje: Dart con Flutter. Leer [AGENTS](../AGENTS.md), [plan](../plan.md) y [arquitectura](../../../docs/arquitectura-tecnica.md).

Separar pantallas y view models de `lib/src/presentacion/` de repositorios/DTO de `datos/`. Usar el puerto compartido de almacenamiento para conservar la clave de una operación en curso, sin acoplar el flujo a un plugin de un solo sistema.

- [ ] E4-05: carrito, cotización aceptada, cobro y recuperación de respuesta incierta.
- [ ] E4-06/E4-07/E4-08: cancelación, comprobante, historial y reportes.
- [ ] E4-11: abrir el detalle autorizado desde Avisos, sin cancelar desde una notificación.
- [ ] E4-12, fase PC: disposición de catálogo/carrito, teclado y ratón, impresión y flujos simultáneos con móvil.

No recalcular el total autoritativo ni generar otra clave ante un simple reintento. Adaptar la disposición según ancho de ventana sin estirar el teléfono a pantalla completa. Auditar foco, confirmaciones, montos exactos, pérdida de conexión y cierre/reanudación en los destinos que corresponden a cada tarea.
