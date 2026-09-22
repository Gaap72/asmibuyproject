# Auditoría de tarea: <ID>

Copiar este archivo a `docs/auditorias/<ID>.md` al iniciar una tarea. No marcar casillas de comprobaciones que no se hayan ejecutado.

## Identificación

- Tarea y título:
- Módulo:
- Autor:
- Revisor independiente:
- Colaboradores de revisión, si corresponde:
- Estado: pendiente / en curso / bloqueada / en revisión / terminada.
- Fecha:
- Versión, commit o referencia verificable del cambio:
- Versiones Dart/Flutter, Node.js/TypeScript/NestJS y PostgreSQL/TypeORM utilizadas, según la capa afectada:
- Fase: MVP móvil / ampliación Windows. No confundir comprobación de portabilidad con entrega completa PC.
- Entorno de API/base de datos y plataforma móvil, versión de sistema y dispositivo/emulador/simulador utilizados, si corresponde:
- Secciones de `spec.md` y criterios CA asociados:
- Dependencias y estado real de cada una:

## Alcance y estructura

- Resultado esperado:
- Archivos modificados:
- Contratos o migraciones afectados:
- Justificación de la ubicación del código:
- Compatibilidad con consumidores y trabajo de otros módulos:
- Pantallas y filas de `docs/diseno-interfaz.md` afectadas, componentes y tokens utilizados, o justificación de «no aplica»:
- Referencias a capturas Android/iOS y comparación con la composición acordada, si hay cambio visual:

## Comprobaciones

Para cada fila indicar aprobado, fallido o no aplica. Justificar «no aplica». Adjuntar comandos reales o pasos manuales suficientes para repetir la comprobación.

| Control | Comando o procedimiento y datos | Resultado esperado | Resultado observado | Estado y evidencia |
| --- | --- | --- | --- | --- |
| Estructura y responsabilidades | Pendiente | Pendiente | No ejecutado | Pendiente |
| Separación Dart frontend / TypeScript backend y contratos OpenAPI | Pendiente | Pendiente | No ejecutado | Pendiente |
| Precisión decimal, migraciones y contexto transaccional PostgreSQL/TypeORM | Pendiente | Pendiente | No ejecutado | Pendiente |
| Comportamiento y criterios asociados | Pendiente | Pendiente | No ejecutado | Pendiente |
| Errores y casos límite relevantes | Pendiente | Pendiente | No ejecutado | Pendiente |
| Permisos y alcance de datos | Pendiente | Pendiente | No ejecutado | Pendiente |
| Integridad, historial y migraciones | Pendiente | Pendiente | No ejecutado | Pendiente |
| Atomicidad, concurrencia e idempotencia | Pendiente | Pendiente | No ejecutado | Pendiente |
| Interfaz móvil, mensajes, teclado y navegación | Pendiente | Pendiente | No ejecutado | Pendiente |
| Cupertino, Roboto, Material Symbols y paleta semántica | Pendiente | Pendiente | No ejecutado | Pendiente |
| Contraste, texto ampliado, áreas táctiles y lector de pantalla | Pendiente | Pendiente | No ejecutado | Pendiente |
| Pérdida de conexión y suspensión/reanudación | Pendiente | Pendiente | No ejecutado | Pendiente |
| Avisos internos/push, permisos del sistema y preferencias | Pendiente | Pendiente | No ejecutado | Pendiente |
| Deduplicación, destinatarios, lectura y apertura segura | Pendiente | Pendiente | No ejecutado | Pendiente |
| Integración con consumidores | Pendiente | Pendiente | No ejecutado | Pendiente |
| Compatibilidad de adaptadores y portabilidad Windows, cuando corresponda | Pendiente | Pendiente | No ejecutado | Pendiente |

## Hallazgos y correcciones

| Hallazgo | Impacto y si bloquea | Responsable | Corrección o pendiente explícito | Evidencia de nueva verificación |
| --- | --- | --- | --- | --- |
| Por registrar | Por evaluar | Por asignar | Pendiente | No ejecutado |

## Cierre

- [ ] El autor completó la autoauditoría y registró resultados reales.
- [ ] Se ejecutaron las verificaciones relevantes; no hay fallos bloqueantes.
- [ ] Se comprobaron los contratos y migraciones afectados, o se justificó que no aplican.
- [ ] El revisor examinó el cambio y sus evidencias, y registró su conclusión.
- [ ] Se actualizaron el plan y la matriz CA cuando corresponde.
- [ ] Se actualizó el seguimiento visual con capturas y revisiones de ambos sistemas, o se justificó que no aplica.
- [ ] El cambio quedó integrado en la versión indicada, o la tarea documental quedó entregada y revisada.

Conclusión del autor: pendiente.

Conclusión del revisor: pendiente. Debe registrarla la persona que efectivamente revisó, con fecha y referencia del cambio aprobado.

Decisión final: pendiente / requiere correcciones / aprobada.

Una aprobación pierde vigencia sobre las partes que se modifiquen después; actualizar la evidencia antes de volver a cerrar la tarea.
