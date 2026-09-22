# Componentes y adaptadores compartidos del cliente

Responsable: integrante 1. Lenguaje: Dart. Leer [arquitectura](../../docs/arquitectura-tecnica.md), [diseño](../../docs/diseno-interfaz.md) y [reglas de plataforma](../../modulos/plataforma-accesos/AGENTS.md).

Este paquete reunirá tokens de diseño, Roboto, Material Symbols Rounded, componentes Cupertino reutilizables, cliente HTTP, manejo de sesión y contratos de capacidades de dispositivo. Las implementaciones de notificaciones, almacenamiento seguro e impresión se seleccionan por plataforma/capacidad.

Los módulos usan esta base mediante su entrada pública. No incluir aquí un motor alternativo de promociones ni reglas de stock. No importar paquetes backend TypeScript. Mantener pruebas de formato de valores, estados comunes, accesibilidad y selección de adaptadores.

Tareas: E1-02, E1-03, E1-07, E1-11 y E1-12. La auditoría registra compatibilidad Android/iOS y revisión de portabilidad Windows, sin afirmar que todos los plugins comparten soporte.
