# Frontend de catálogo e inventario

Responsable: integrante 2. Lenguaje: Dart con Flutter. Leer [AGENTS del módulo](../AGENTS.md), [plan](../plan.md) y [arquitectura](../../../docs/arquitectura-tecnica.md).

Implementar las pantallas y view models en `lib/src/presentacion/`; los servicios HTTP, DTO y repositorios cliente en `datos/`. Consumir el diseño y los adaptadores comunes por su API pública. Mantener las cantidades exactas recibidas, sin recalcular existencias autoritativas en el dispositivo.

- [ ] E2-06: catálogo y editor de recetas, unidades y validaciones comprensibles.
- [ ] E2-07: existencias, movimientos, mínimos individuales y estados bajo/agotado.
- [ ] E2-10: integrar los avisos del servicio común, sin otro motor push.
- [ ] E2-11, fase PC: listas/detalle adaptables, teclado y ratón, conservando repositorios y contratos.

No confundir una respuesta pendiente con un ajuste guardado. La validación local ayuda al formulario, pero el backend confirma cantidades, permisos y movimientos. Auditar teclado decimal, texto largo, contraste, tamaños de ventana y correspondencia de las cantidades con la API según el ID de tarea.
