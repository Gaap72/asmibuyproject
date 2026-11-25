# Acta de entrega — 2026-11-25

> **BORRADOR — pendiente de revisión del equipo.** Este documento no cierra la entrega ni registra aprobaciones.

Etiquetas usadas: **reportado por el ejecutor** (texto de la evidencia, sin repetir el comando), **verificado (comando real)** (ejecutado por el orquestador sobre un clon limpio) y **aprobado por revisor humano** (decisión con nombre, fecha y decisión).

## a) Versión
- SHA de `main` verificado: `90a913185be5bc4f5b6962e6a1184404db5f06e3` (clon limpio fuera del repositorio, 2026-11-25).
- URL del despliegue: **pendiente (P1-B1)**; `W1-06.md` no registra ninguna.

## b) Alcance entregado
Spec 2.1 con los cuatro módulos (plataforma y accesos, catálogo e inventario, promociones, ventas e historial), con perfiles fijos ADMINISTRADOR y TRABAJADOR. Web móvil adaptable (Angular + Express + PostgreSQL con `pg`). Límites: Supabase Free como base objetivo, sin aplicaciones nativas, sin editor de roles ni notificaciones externas; Avisos es una vista del stock actual.

## c) Correcciones de esta entrega
| ID | Commit | Revisor asignado | Estado |
| --- | --- | --- | --- |
| A-ENT-01 (dependencias) | `a12a440` | integrante 1 | en revisión |
| A-ENT-02 (proxy y límite por IP) | `ed03480` | integrante 1 | en revisión |
| A-ENT-03 (día de prueba en zona del negocio) | `09c8031` | integrante 3 | en revisión |
| A-ENT-04 (interfaz; `d8255db`, fusiones `3f6838c`, `75ca536`, evidencia `ce37c49`) | `d8255db` | integrante 1 (adicional: 4) | en revisión |
| DCU-01 (error de Avisos) | `ad39ea6` | integrante 2 | en revisión |
| DCU-02 (contraseña oculta) | `adccd10` | integrante 1 | en revisión |
| QA-L-01, QA-L-02, QA-L-03 | `d8353e6` | integrante 1 | en revisión |
| QA-L-04 (longitud al crear cuentas) | `90a9131` | integrante 1 | en revisión |

## d) Verificación realizada
**Verificado (comando real)**, clon limpio de `90a9131`, sin `DATABASE_URL`:
- `npm ci` sin errores; `npm audit --omit=dev`: **0 vulnerabilidades**; `npm audit`: 16 moderadas, todas de desarrollo (la auditoría de producción da 0).
- `npm run build:backend` y `npm run build:frontend` sin errores.

Suites en memoria (todas exit 0): accesos-w1 51 exitosas; auditoria3-w1 52; auditoria1-w2 26; auditoria2-w2 14/14; auditoria3-w2 17/17; auditoria1-w3 42/42; auditoria2-w3 16/16; auditoria1-w4 comprobaciones de memoria exitosas (sin n/n en su salida; QA-LOCAL informa 37/37); anulacion-w4-05 21/21; calculo-w3-03 36/36; catalogo-w2-02 22/22; entrega-a-ent-02 8/8; entrega-dcu-02 18/18; entrega-qa-l 18/18; entrega-qa-l-04 7/7; historial-w4-04 15/15; integracion-ventas-w3-05 19/19; inventario-integrado-w2-06 14/14; inventario-w2-03 28/28; minimos-avisos-w2-05 23/23; promociones-integradas-w3-06 33/33; promociones-w3-02 32/32; recorrido-venta-w4-06 28/28; ventas-w4-03 36/36.

Sin base de datos, `auditoria2-w4`, `auditoria3-w3` y `auditoria3-w4` terminan con error: exigen PostgreSQL. Con PostgreSQL local desechable y solo `TEST_DATABASE_URL`: **auditoria2-w4 47/47, auditoria3-w4 18/18, auditoria3-w3 18/18** (PostgreSQL local, no Supabase).

**QA manual local (reportado por el ejecutor, `QA-LOCAL-2026-11-24.md`)**: Zen Browser (basado en Firefox, sin número de versión; no es Chrome ni Edge), PostgreSQL local; solo CW-01 y CW-02 se probaron en navegador, con reservas. **UI-REV-02 (reportado por el ejecutor)**: Edge de escritorio con emulación y Playwright 1.65/axe-core 4.14, 22/22 comprobaciones, sin dispositivos físicos. La comprobación visual de QA-L-01 y QA-L-02 **no se ha ejecutado**.

Estado de los criterios CW en `docs/matriz-aceptacion.md`: Pendiente 1, Parcial 19, Verificado 0, Aprobado 0.

## e) Aprobaciones humanas registradas
**Ninguna registrada a la fecha.** Las secciones «Decisión del revisor» de ENT-A-ENT-01, A-ENT-02, A-ENT-04, DCU-01, DCU-02, ENT-W4, ENT-QA-L y QA-LOCAL están vacías; la de UI-REV-02 conserva el texto de plantilla sin rellenar. `W1-06.md` y `W4-06.md` indican que la tarea sigue en revisión y no autoasignan aprobación; sus «Aprobado» en tablas son texto del ejecutor.

## f) Pendientes conocidos
| Pendiente | Responsable | Riesgo |
| --- | --- | --- |
| P1-B1: Supabase, respaldo previo, migración 007 y despliegue HTTPS (requiere la máquina con `.env` y `pg_dump`) | integrante 1 | Alto: sin S ningún criterio pasa a Verificado |
| P1-B2: restauración, CW-20 | integrante 1 (revisa 4) | Alto: sin prueba de recuperación |
| QA visual en Chrome o Edge: CW-03 a CW-18, más QA-L-01 y QA-L-02 | integrantes por módulo | Medio |
| PM: Chrome Android y Safari iPhone, CW-17 | integrantes 1 y 4 | Medio |
| Repetir en S los CW validados solo en L | integrantes por módulo | Alto |
| Decisiones humanas de todos los ID | revisores asignados | Alto: sin ellas nada pasa a Aprobado |
| QA-L-04: `crearCuentaNominal` hashea sin recortar y `restablecerPassword` recortado; no se cambió para no invalidar cuentas | integrante 1 decide | Bajo |
| El limitador de intentos guarda su estado en memoria: exige una sola instancia | integrante 1 | Medio |

## g) Documentos académicos locales sin seguimiento
`Documento_1`, `Documento_2`, `EV-01_EV-04`, `acta_validacion_cliente`, `DOC-DISENO` y `DOC-INT`: **pendiente de decisión del equipo sobre procedencia e inclusión**. No forman parte de este commit.

## h) Firmas
| Integrante | Nombre | Rol | Fecha | Conformidad |
| --- | --- | --- | --- | --- |
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
