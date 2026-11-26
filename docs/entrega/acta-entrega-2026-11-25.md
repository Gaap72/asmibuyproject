# Acta de entrega — 2026-11-25

> **BORRADOR — pendiente de revisión del equipo.** Este documento no cierra la entrega ni aprueba nada; transcribe las decisiones escritas en las evidencias.

Etiquetas usadas: **reportado por el ejecutor** (texto de la evidencia, sin repetir el comando), **verificado (comando real)** (ejecutado por el orquestador sobre un clon limpio) y **aprobado por revisor humano** (decisión con nombre, fecha y decisión).

## a) Versión
- SHA de `main` en que se basa esta actualización: `934444f7511a07589df638bd925b38664dd4fe24`.
- Última verificación sobre clon limpio: `90a913185be5bc4f5b6962e6a1184404db5f06e3`. **No se ha repetido sobre el SHA actual.**
- URL del despliegue: **pendiente (P1-B1)**; `W1-06.md` no registra ninguna.

## b) Alcance entregado
Spec 2.1 con los cuatro módulos (plataforma y accesos, catálogo e inventario, promociones, ventas e historial), con perfiles fijos ADMINISTRADOR y TRABAJADOR. Web móvil adaptable (Angular + Express + PostgreSQL con `pg`). Límites: Supabase Free como base objetivo, sin aplicaciones nativas, sin editor de roles ni notificaciones externas; Avisos es una vista del stock actual.

## c) Correcciones de esta entrega
Todas las evidencias declaran «en revisión», tengan o no decisión.

| ID | Commit | Revisor asignado | Estado |
| --- | --- | --- | --- |
| A-ENT-01 (dependencias) | `a12a440` | integrante 1 | en revisión; decisión del 1 |
| A-ENT-02 (proxy y límite por IP) | `ed03480` | integrante 1 | en revisión; decisión del 1 |
| A-ENT-03 (día de prueba en zona del negocio) | `09c8031` | integrante 3 | en revisión; decisión del 3 |
| A-ENT-04 (interfaz; `d8255db`, fusiones `3f6838c`, `75ca536`, evidencia `ce37c49`) | `d8255db` | integrante 1 (adicional: 4) | en revisión; decisiones del 1 y del 4 |
| DCU-01 (error de Avisos) | `ad39ea6` | integrante 2 | en revisión; sin decisión |
| DCU-02 (contraseña oculta) | `adccd10` | integrante 1 | en revisión; decisión del 1 |
| QA-L-01, QA-L-02, QA-L-03 | `d8353e6` | integrante 1 | en revisión; decisión del 1 |
| QA-L-04 (longitud al crear cuentas) | `90a9131` | integrante 1 | en revisión; incluida en la decisión del 1 sobre ENT-QA-L |
| C8 (estados devueltos a «en revisión», A3-1-05) | `df3ed32` | integrantes 1 (W1, W2, plan), 2 (W3) y 3 (W4) | en revisión; decisión solo del 1 |
| QA-V-01 (insumos inactivos en Avisos) | `4fec839` (PR #8) | integrante 1 (adicional: 4) | en revisión; decisión del 1; la del 4, aprobación en GitHub sin registrar en el archivo |
| QA-V-02 (objetivos táctiles de 44 px) | `24951a6` (PR #7) | integrante 4 (adicionales: 4 en Venta e Historial; 2 y 3 en Gestión) | en revisión; aprobación en GitHub sin registrar en el archivo |
| QA-V-03 (token CSRF entre pestañas) | `b1e23dd` | integrantes 1 y 3 | en revisión; decisión del 1; falta el 3 |
| QA-V-04 (catálogo y carrito vigentes) | `934444f` | integrante 3 | en revisión; sin decisión |
| QA-V-05 (metadescripción) | `b1e23dd` | integrante 1 | en revisión; decisión del 1 |
| QA-V-06 (encabezados de Avisos) | `934444f` | integrante 1 | en revisión; sin decisión |
| QA-V-07 (errores por campo en Gestión) | `934444f` | integrantes 1 y 2 | en revisión; sin decisión |

Pull requests fusionados el 2026-11-25 (hora local):

| PR | Fusión | Commits y autor | Revisor asignado | Estado |
| --- | --- | --- | --- | --- |
| #5 (QA CW-10 a CW-14 y revisiones del integrante 3) | `565aa23` | `b2024d4`, `038c7c9`; `Gaap72` (integrante 3) | ENT-W3: integrante 2 (adicional: 4) | en revisión; ENT-W3 sin decisión; sin revisiones en GitHub |
| #7 (QA-V-02) | `76aa096` | `24951a6`; `Asahel-Pech20` (integrante 1) | integrante 4 y dueños de pantalla | en revisión; aprobación en GitHub de `Surer46` sin registrar en el archivo |
| #8 (QA-V-01) | `b3b4741` | `4fec839`; `NATALY3538` (integrante 2) | integrante 1 (adicional: 4) | en revisión; decisión del 1; aprobación en GitHub de `Surer46` sin registrar en el archivo |

Los commits de fusión están firmados por Oscar Michel Matos May (integrante 4).

## d) Verificación realizada
**Verificado (comando real)**, clon limpio de `90a9131`, sin `DATABASE_URL`:
- `npm ci` sin errores; `npm audit --omit=dev`: **0 vulnerabilidades**; `npm audit`: 16 moderadas, todas de desarrollo (la auditoría de producción da 0).
- `npm run build:backend` y `npm run build:frontend` sin errores.

Suites en memoria (todas exit 0): accesos-w1 51 exitosas; auditoria3-w1 52; auditoria1-w2 26; auditoria2-w2 14/14; auditoria3-w2 17/17; auditoria1-w3 42/42; auditoria2-w3 16/16; auditoria1-w4 comprobaciones de memoria exitosas (sin n/n en su salida; QA-LOCAL informa 37/37); anulacion-w4-05 21/21; calculo-w3-03 36/36; catalogo-w2-02 22/22; entrega-a-ent-02 8/8; entrega-dcu-02 18/18; entrega-qa-l 18/18; entrega-qa-l-04 7/7; historial-w4-04 15/15; integracion-ventas-w3-05 19/19; inventario-integrado-w2-06 14/14; inventario-w2-03 28/28; minimos-avisos-w2-05 23/23; promociones-integradas-w3-06 33/33; promociones-w3-02 32/32; recorrido-venta-w4-06 28/28; ventas-w4-03 36/36.

Sin base de datos, `auditoria2-w4`, `auditoria3-w3` y `auditoria3-w4` terminan con error: exigen PostgreSQL. Con PostgreSQL local desechable y solo `TEST_DATABASE_URL`: **auditoria2-w4 47/47, auditoria3-w4 18/18, auditoria3-w3 18/18** (PostgreSQL local, no Supabase).

**Reportado por el ejecutor** sobre el código de `934444f` (`ENT-QA-V-2026-11-25.md`, sin `DATABASE_URL`): ambas compilaciones correctas; entrega-qa-v 55/55, entrega-qa-l 18/18, accesos-w1 51/51, ventas-w4-03 36/36, recorrido-venta-w4-06 28/28, minimos-avisos-w2-05 23/23. No se ejecutaron las demás suites.

**QA visual en Edge 158.0.4370.33 (reportado por el ejecutor, `QA-VISUAL-2026-11-25.md`)**, PostgreSQL local:
- **CW-03 a CW-18 pasan en L-PC.** CW-17 solo en PC (modo dispositivo 360 × 640). CW-07, solo la parte visual.
- Hallazgos: QA-V-03 (CW-06), QA-V-04 (CW-14), QA-V-05, 06 y 07 (CW-18). Sus correcciones son posteriores y no se han comprobado en navegador.
- QA-L-01 y QA-L-03 pasan; QA-L-02 pasa en la repetición en Edge sobre `565aa23`.
- La sección «Decisión del revisor» del informe está vacía.

**Otras comprobaciones en navegador (reportadas por el ejecutor)**: ENT-W3, CW-10 a CW-14 en Chromium 156 con base local; ENT-QA-V-02, Edge 158 con Playwright (asistente); QA-V-01, prueba del revisor en Edge 158; QA-LOCAL, Zen Browser (no es Chrome ni Edge); UI-REV-02, Edge con emulación. Nada en Supabase ni en teléfonos.

Estado de los criterios CW en `docs/matriz-aceptacion.md`: Pendiente 1, Parcial 19, Verificado 0, Aprobado 0.

## e) Aprobaciones humanas registradas
**21 secciones «Decisión del revisor»** con nombre, fecha y decisión, todas del 2026-11-25. Texto literal de revisor y decisión; las observaciones completas están en cada archivo.

| Archivo | Revisor | Fecha | Decisión | Límite citado literalmente |
| --- | --- | --- | --- | --- |
| `W1-01.md` | Matos May Oscar Michel (integrante 4) | 2026-11-25 | aprobado con observaciones | |
| `W1-02.md` | Matos May Oscar Michel (integrante 4) | 2026-11-25 | aprobado con observaciones | «la 007 falta en Supabase (P1-B1)» |
| `W1-03.md` | Matos May Oscar Michel (integrante 4) | 2026-11-25 | aprobado con observaciones | |
| `W1-04.md` | Matos May Oscar Michel (integrante 4) | 2026-11-25 | aprobado con observaciones | «CW-18 pendiente en Chrome/Edge y teléfonos» |
| `W2-01.md` | Pech Ake Santiago Asahel (integrante 1) | 2026-11-25 | aprobado | |
| `W2-02.md` | Pech Ake Santiago Asahel (integrante 1) | 2026-11-25 | aprobado | |
| `W2-03.md` | Pech Ake Santiago Asahel (integrante 1) | 2026-11-25 | aprobado | |
| `W2-04.md` | Pech Ake Santiago Asahel (integrante 1) | 2026-11-25 | aprobado | |
| `W2-05.md` | Pech Ake Santiago Asahel (integrante 1) | 2026-11-25 | aprobado | |
| `W2-06.md` | Pech Ake Santiago Asahel (integrante 1) | 2026-11-25 | aprobado | |
| `ENT-A-ENT-01-2026-11-24.md` | Pech Ake Santiago Asahel (integrante 1) | 2026-11-25 | aprobado con observaciones | |
| `ENT-A-ENT-02-2026-11-24.md` | Pech Ake Santiago Asahel (integrante 1) | 2026-11-25 | aprobado con observaciones | |
| `ENT-A-ENT-04-2026-11-24.md` | Pech Ake Santiago Asahel (integrante 1) | 2026-11-25 | aprobado con observaciones | «La aprobación cubre solo la integración» |
| `ENT-A-ENT-04-2026-11-24.md` | Matos May Oscar Michel (integrante 4), Venta e Historial | 2026-11-25 | aprobado con observaciones | «esta firma es conformidad del dueño del módulo, no revisión independiente» |
| `ENT-C8-2026-11-25.md` | Pech Ake Santiago Asahel (integrante 1) | 2026-11-25 | aprobado con observaciones | «El integrante 1 no firma W1.» |
| `ENT-DCU-02-2026-11-24.md` | Pech Ake Santiago Asahel (integrante 1) | 2026-11-25 | aprobado | |
| `ENT-QA-L-2026-11-25.md` | Pech Ake Santiago Asahel (integrante 1) | 2026-11-25 | aprobado con observaciones | |
| `ENT-QA-V-2026-11-25.md` | Pech Ake Santiago Asahel (integrante 1) | 2026-11-25 | aprobado con observaciones | «Revisa QA-V-03 y QA-V-05.» |
| `QA-V-01.md` | Pech Ake Santiago Asahel (integrante 1) | 2026-11-25 | aprobado | «Revisión principal.» |
| `ENT-W4-2026-11-24.md` | Gaap72 (integrante 3) | 2026-11-25 | aprobado | «El QA integrado en Supabase y en móviles sigue pendiente en W4-06.» |
| `UI-REV-02.md` | Matos May Oscar Michel (integrante 4) | 2026-11-25 | aprobado con observaciones | «Pendientes: flujos con escritura, diálogos, comprobante y teléfonos (PM).» |

Totales: integrante 1, 14; integrante 2, ninguna; integrante 3, 1; integrante 4, 6.

No cuentan en el total, por no ser una sección «Decisión del revisor»:
- `W4-Auditoria-3.md`, línea literal: «Decisión del revisor principal: Gaap72 (integrante 3) · 2026-11-25 · **aprobado**. Lista de comprobación en `ENT-W4-2026-11-24.md`. A3-4-05 (móviles físicos y Supabase) sigue abierto, y faltan las revisiones de los integrantes 2 y 1.»
- Tablas de `docs/casos-de-uso.md` (CU-13 a CU-22) y `docs/diagramas-de-clase.md` (D3 y D4): «Aprobado (Gaap72, 2026-11-25)».
- Aprobaciones en GitHub de los PR #7 y #8, sin registrar como decisión del integrante 4 en el archivo.

## f) Pendientes conocidos

### Firmas que faltan
| Integrante | Como revisor principal | Como revisor adicional |
| --- | --- | --- |
| 1 | QA-V-06 y QA-V-07 (ENT-QA-V) | W4-01 a W4-06; W4-Auditoria-3 |
| 2 | W3-01 a W3-06; ENT-W3; DCU-01; QA-V-07 (promociones); C8 (W3) | W4-01 a W4-06; W4-Auditoria-3; Gestión en UI-REV-02 y ENT-QA-V-02 |
| 3 | W4-01 a W4-06; QA-V-03 (venta) y QA-V-04; C8 (W4) | Gestión en UI-REV-02 y ENT-QA-V-02 |
| 4 | W1-05, W1-06; ENT-QA-V-02 (incluye Venta e Historial) | W2-01, W2-03, W2-06; W3-01, W3-03, W3-05, W3-06; ENT-W3 (CW-14); QA-V-01 |

Además, con la sección vacía:
- `QA-VISUAL`: la columna de revisor asigna CW-05, 06 y 10 a 13 al 2; CW-07 y 14 a 16 al 3; CW-17 al 3 y 4; CW-18 al 4. CW-03, 04, 08 y 09 figuran para el 1, que ejecutó la QA: falta un revisor independiente.
- `QA-LOCAL`: sin revisor nominal.

### Trabajo pendiente
| Pendiente | Responsable | Riesgo |
| --- | --- | --- |
| P1-B1: Supabase, respaldo previo, migración 007 y despliegue HTTPS (requiere la máquina con `.env` y `pg_dump`) | integrante 1 | Alto: sin S ningún criterio pasa a Verificado |
| P1-B2: restauración, CW-20 | integrante 1 (revisa 4) | Alto: sin prueba de recuperación |
| PM: Chrome Android y Safari iPhone (CW-01, 05, 07, 09, 17, 18 y 19 según corresponda) | integrantes por módulo; CW-17: 1 y 4 | Alto |
| Repetir en S los CW validados solo en L | integrantes por módulo | Alto |
| Comprobación visual de QA-V-04, 06 y 07 | autor 4; revisores 3, 1 y 2 | Medio |
| Comprobación visual de QA-V-03 y QA-V-05, pedida en la decisión del integrante 1 | integrante 4 | Medio |
| CW-01 y CW-02 como casos propios en Chrome/Edge (con la interfaz del trabajador sin Gestión); reconexión de CW-19 | integrantes 1 y 4 | Medio |
| QA-V-07: el stock mínimo no se valida en la web | integrante 1 decide | Bajo |
| QA-V-07: selectores y cantidades de la receta sin etiqueta | integrante 1 | Medio: accesibilidad |
| Gestión puede recibir `CSRF_INVALIDO` desde una pestaña vieja (observación del integrante 1 en ENT-QA-V) | integrante 1 decide | Medio |
| Con otra cuenta en la segunda pestaña, la venta queda a su nombre; el integrante 1 pide registrarlo como hallazgo (aún sin ID) | integrantes 1 y 3 | Medio |
| Observaciones de A-ENT-02: `TRUST_PROXY=true`, `intentosRestantes` y comentario de `DB_SSL_CA` | integrante 1 | Medio |
| QA-L-04: `crearCuentaNominal` hashea sin recortar y `restablecerPassword` recortado; no se pide cambio por ahora | integrante 1 decide | Bajo |
| El limitador de intentos guarda su estado en memoria: exige una sola instancia | integrante 1 | Medio |
| Documentos académicos sin seguimiento: decidir procedencia e inclusión (sección g) | equipo | Bajo |

## g) Documentos académicos locales sin seguimiento
`Documento_1`, `Documento_2`, `EV-01_EV-04`, `acta_validacion_cliente`, `DOC-DISENO` y `DOC-INT`: **pendiente de decisión del equipo sobre procedencia e inclusión**. No forman parte de este commit.

## h) Firmas
| Integrante | Nombre | Rol | Fecha | Conformidad |
| --- | --- | --- | --- | --- |
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
