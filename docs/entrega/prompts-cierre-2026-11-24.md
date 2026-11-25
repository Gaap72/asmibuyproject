# Prompts de cierre para la entrega del 24-11-2026

Preparado por el orquestador a partir del diagnóstico del 24-11-2026 sobre `main` (`a7d3720`). Cada integrante copia **su** prompt en su asistente (Claude Code, Codex u otro), trabajando sobre un clon actualizado del repositorio. Los prompts no aprueban nada: las decisiones de revisión las registra cada persona.

## Orden del día

| Fase | Qué | Quién | Depende de |
| --- | --- | --- | --- |
| 1 · Código (en paralelo) | [P1-A](#p1-a-integrante-1--dependencias-interfaz-y-proxy) dependencias, rama de interfaz y proxy · [P2-A](#p2-a-integrante-2--avisos-con-mensaje-de-error) Avisos · [P4-A](#p4-a-integrante-4--prueba-dependiente-de-la-hora) prueba W4 | 1, 2 y 4 | — |
| 2 · Integración | [P1-B](#p1-b-integrante-1--supabase-despliegue-y-respaldo) migrar Supabase, desplegar y restaurar respaldo | 1 | Fase 1 fusionada en `main` |
| 3 · QA (en paralelo) | [P2-B](#p2-b-integrante-2--qa-de-catálogo-e-inventario), [P3-A](#p3-a-integrante-3--qa-de-promociones), [P4-B](#p4-b-integrante-4--qa-de-venta-historial-y-anulación) y [PM](#pm--qa-en-teléfonos-físicos) teléfonos | 2, 3, 4 y quien tenga los teléfonos | Fase 2 desplegada |
| 4 · Revisión | [PR](#pr--registrar-la-decisión-humana-de-revisión) decisiones humanas | Cada revisor según `AGENTS.md` | Evidencia de su tarea |
| 5 · Cierre | [PO](#po--orquestador--cierre-y-acta-de-entrega) matriz, acta y etiqueta | Orquestador | Fases 1 a 4 |

Si algo no puede terminarse hoy (por ejemplo, no hay un iPhone disponible), **se entrega igual con ese punto declarado como pendiente en el acta**. Nunca se marca como hecho sin evidencia.

## Reglas comunes (incluidas en cada prompt)

```text
REGLAS COMUNES DEL PROYECTO ASMIBUY
- Repositorio: https://github.com/Surer46/asmibuyproject (rama main). Antes de empezar: git fetch y git pull --ff-only.
- Lee AGENTS.md, spec.md 2.1 y el AGENTS.md/plan.md de tu módulo. Solo toca archivos de tu módulo o los que este prompt indique.
- No escribas, imprimas ni subas credenciales: DATABASE_URL vive solo en app/backend/.env (ignorado por git). Las pruebas de concurrencia usan TEST_DATABASE_URL con una base LOCAL asmibuy_test_*.
- No inventes aprobaciones ni marques tareas como terminadas: el estado queda "en revisión" hasta que el revisor humano registre su decisión.
- Distingue en los informes: "reportado por el ejecutor", "verificado" (comando real y salida) y "aprobado por revisor humano".
- Antes de commit: npm run build:backend, npm run build:frontend y git diff --check. Commits pequeños por ID, mensaje claro. No hagas force push ni reescribas historia de main.
- Registra cada resultado en docs/auditorias/<ID>.md (plantilla en docs/auditorias/plantilla.md) con fecha, entorno, versión, pasos, esperado y observado.
```

---

## P1-A Integrante 1 · Dependencias, interfaz y proxy

```text
Eres el asistente del integrante 1 (Plataforma y accesos) del proyecto Asmibuy. Aplica las REGLAS COMUNES (pegadas abajo).

Objetivo: dejar main sin vulnerabilidades de producción, integrar la rama de interfaz y preparar el login para el despliegue detrás de un proxy.

1. Dependencias (A-ENT-01)
   - En una rama fix/entrega-dependencias: ejecuta `npm audit fix` (sin --force). Confirma que no hay cambios de versión mayor en package.json/package-lock.json.
   - Verifica: `npm audit --omit=dev` debe decir 0 vulnerabilidades (antes: body-parser alta, @angular/router alta solo SSR, qs moderada). Registra también el resultado de `npm audit` completo.
   - Compila backend y frontend y ejecuta `NODE_ENV=test node app/backend/dist/scripts/verificar-accesos-w1.js` y `verificar-auditoria3-w1.js`.

2. Rama de interfaz fix/ui-revision-interfaces-02 (H-01 a H-10)
   - Actualízala con main, compílala y abre un pull request hacia main. En la descripción enumera H-01 a H-10 y la evidencia (axe, 22/22, capturas si existen).
   - Crea docs/auditorias/UI-REV-02.md con alcance, archivos, comprobaciones reales y "en revisión". Pide revisión al integrante 4 (tu revisor principal). Ese PR también toca venta.component.ts y historial.component.ts (módulo 4) y gestion.component.ts (módulos 2 y 3): avisa a esos integrantes.
   - No fusiones el PR tú solo si tu equipo exige aprobación; si el equipo acuerda fusionar hoy, hazlo después de la aprobación registrada.

3. Login detrás de proxy (A-ENT-02)
   - El límite de intentos (`LoginRateLimiter`) cuenta por IP y el backend no configura `trust proxy`. En el despliegue (proxy o mismo origen HTTPS) todas las cajas parecerían una sola IP y 5 errores bloquearían a todo el personal hasta 15 min.
   - Añade en app/backend/src/index.ts la configuración `app.set('trust proxy', <valor>)` controlada por una variable de entorno TRUST_PROXY (por defecto desactivada en local), documéntala en app/backend/.env.example y en el README. Valora que el bloqueo por IP use un umbral mayor que el bloqueo por IP+correo.
   - Prueba: con TRUST_PROXY activo y cabecera X-Forwarded-For distinta, dos usuarios no se bloquean entre sí; 5 fallos del mismo correo sí bloquean ese correo (429 con Retry-After).

4. Documentación menor
   - .env.example dice que DB_SSL_CA es una "ruta", pero config/database.ts usa su contenido PEM. Corrige el comentario o el código para que coincidan.
   - Opcional si da tiempo (DCU-02): que mantenimiento-cuentas.js pida la contraseña por entrada oculta en lugar de argumento.

Entrega: PRs o commits por punto, resultados de comandos en docs/auditorias/ENT-W1-2026-11-24.md, estado "en revisión". Avisa al orquestador cuando main tenga todo fusionado para pasar a la fase 2.

[PEGA AQUÍ LAS REGLAS COMUNES]
```

## P1-B Integrante 1 · Supabase, despliegue y respaldo

```text
Eres el asistente del integrante 1 (Plataforma y accesos) del proyecto Asmibuy. Aplica las REGLAS COMUNES (pegadas abajo). Fase 2: integración con Supabase. Trabaja en la máquina donde está app/backend/.env con la conexión real; nunca imprimas su valor.

Sigue docs/auditorias/QA-INT-2026-10-19.md, sección 2.3, y registra todo en docs/auditorias/W1-06.md.

1. Conexión (C-1 a C-4)
   - `npm run build:backend` y `npm run migrate`: deben quedar registradas las 7 migraciones (incluida 007_corregir_defaults_timestamptz) en schema_migraciones; una segunda ejecución no aplica nada.
   - Arranca la API y comprueba GET /api/v1/health: base conectada, TLS validado.
   - Comprueba que el pooler de Supabase acepta el parámetro de conexión `options: '-c timezone=UTC'` de config/database.ts y que `SHOW TimeZone` devuelve UTC. Si el pooler lo rechaza, quita ese parámetro (el `SET timezone` por conexión ya cubre lo mismo) y documenta el cambio.

2. Despliegue HTTPS
   - Confirma la URL del despliegue (web y /api/v1 en el mismo origen HTTPS), NODE_ENV=production, ALLOWED_ORIGINS con ese dominio, SESSION_SECRET propio, TRUST_PROXY según P1-A.
   - Comprueba con el navegador: cookie asmibuy_session con HttpOnly, Secure y SameSite=Lax; login, /auth/me y logout; una escritura sin token CSRF responde 403.

3. Datos de QA
   - Crea las cuentas de QA (un ADMINISTRADOR y dos TRABAJADOR) con mantenimiento-cuentas.js, sin dejar contraseñas en documentos. Comparte las credenciales por un canal privado del equipo, no en el repositorio.

4. Respaldo y restauración (CW-20)
   - Cuando el QA de la fase 3 haya generado ventas, exporta con pg_dump (procedimiento de modulos/plataforma-accesos/respaldo-postgresql.bat) y restaura en una base local aislada asmibuy_test_restauracion.
   - Contrasta conteos y totales: usuarios, ingredientes, platillos, receta_detalle, movimientos_inventario (suma por ingrediente), promociones, ordenes (por estado y suma de total de CONFIRMADAS) y orden_detalle. Adjunta las consultas y resultados, no el archivo de respaldo.

Entrega: W1-06.md actualizado con fecha, versión de PostgreSQL de Supabase, URL pública (sin secretos), resultados de C-1 a C-6 y de la restauración. Estado "en revisión" hasta la decisión del integrante 4.

[PEGA AQUÍ LAS REGLAS COMUNES]
```

## P2-A Integrante 2 · Avisos con mensaje de error

```text
Eres el asistente del integrante 2 (Catálogo e inventario) del proyecto Asmibuy. Aplica las REGLAS COMUNES (pegadas abajo).

Corrige DCU-01 de docs/casos-de-uso.md: en app/frontend/src/app/components/avisos/avisos.component.ts, recargarAvisos() solo escribe el error en la consola y deja la lista anterior visible como si siguiera vigente. La arquitectura (docs/arquitectura-tecnica.md) pide mostrar error si la consulta falla.

- Muestra un mensaje de error accesible (role="alert", sin depender solo del color, con los tokens de AGENTS.md) y un botón "Reintentar" de al menos 44×44 px.
- No presentes datos viejos como vigentes: o vacía la lista, o márcala claramente como "no actualizada" con la hora de la última consulta correcta.
- Si la rama fix/ui-revision-interfaces-02 ya se fusionó, parte de esa versión de avisos.component.ts para no generar conflictos; si no, coordina con el integrante 1.
- Verifica: build del frontend; con la API detenida, abrir Avisos muestra el error y Reintentar funciona al volver la API; con la API activa, volver a la pestaña refresca los datos (CW-09).
- Registra en docs/auditorias/ENT-W2-2026-11-24.md y pide revisión al integrante 1.

[PEGA AQUÍ LAS REGLAS COMUNES]
```

## P2-B Integrante 2 · QA de catálogo e inventario

```text
Eres el asistente del integrante 2 (Catálogo e inventario) del proyecto Asmibuy. Aplica las REGLAS COMUNES (pegadas abajo). Fase 3: QA sobre el despliegue con Supabase (URL y cuentas de QA que comparte el integrante 1).

Ejecuta y documenta, en PC y en un teléfono si está disponible, los casos de docs/auditorias/QA-INT-2026-10-19.md:
- CW-03: crea pan (pieza), carne (g) y queso (pieza) y la hamburguesa (1 pan, 150 g carne, 1 queso). El saldo no cambia al guardar la receta. Una receta inválida no aparece en Venta.
- CW-04: stock inicial, entrada y ajuste con motivo; un ajuste mayor que la existencia se rechaza; el saldo coincide con la suma de movimientos y conserva autor y motivo.
- CW-08: pan con mínimo 20 y carne con mínimo 2000. Igualdad → bajo stock; cero → agotado; reposición superior → normal.
- CW-09: Avisos muestra una fila por ingrediente; volver a la pestaña o recargar consulta datos vigentes.
- Comprueba que un TRABAJADOR no ve Gestión y que una petición directa a /api/v1/admin/ingredientes responde 403 (CW-02, junto con el integrante 1).

Por cada caso: fecha, navegador y versión, dispositivo, cuenta usada (sin contraseña), pasos, esperado, observado y captura en docs/auditorias/evidencias/qa-int/. Un fallo abre un hallazgo QA-CWxx-nn con su responsable. Revisa además los casos CU-07 a CU-12 de docs/casos-de-uso.md y los diagramas D2.1/D2.2 de docs/diagramas-de-clase.md, y anota tu decisión documental en sus tablas de "Revisión".

[PEGA AQUÍ LAS REGLAS COMUNES]
```

## P3-A Integrante 3 · QA de promociones

```text
Eres el asistente del integrante 3 (Descuentos y promociones) del proyecto Asmibuy. Aplica las REGLAS COMUNES (pegadas abajo). Fase 3: QA sobre el despliegue con Supabase.

Ejecuta y documenta en PC (y en teléfono si está disponible):
- CW-10: promoción temporal que inicia y termina en minutos próximos: no aplica antes del inicio, aplica en el inicio y deja de aplicar exactamente en el fin. Una permanente no vence. Desactivar y retirar impiden aplicarla; una retirada no se puede editar ni reactivar.
- CW-11: línea de 200 con 15 % → descuento 30 y total 170. Una de 100 % → total 0.00 con SIN_COBRO y el inventario se consume igual.
- CW-12: 5 × 100 en 2x1 → 300; 4 × 100 en 3x1 → 200; se entregan y consumen 5 y 4 unidades.
- CW-13: dos promociones del mismo platillo → gana el mayor ahorro; en empate, el menor id. No se acumulan y las partidas suman el total.
- CW-14 (con el integrante 4): cambia el porcentaje entre cotizar y confirmar → el sistema pide aceptar el nuevo resumen.

Registra evidencia en docs/auditorias/evidencias/qa-int/ y en docs/auditorias/ENT-W3-2026-11-24.md.

Revisión que te corresponde según AGENTS.md (eres revisor principal del integrante 4):
- Revisa docs/auditorias/W4-Auditoria-3.md, el commit 47359a9 y los casos CU-17 a CU-22 y diagramas D4.1/D4.2. Revisa también CU-13 a CU-16 y D3.1/D3.2 de tu módulo.
- Tu decisión (aprobado, aprobado con observaciones o rechazado) la escribes TÚ como persona; el asistente solo te prepara la lista de comprobación. Usa el prompt PR.

[PEGA AQUÍ LAS REGLAS COMUNES]
```

## P4-A Integrante 4 · Prueba dependiente de la hora

```text
Eres el asistente del integrante 4 (Punto de venta e historial) del proyecto Asmibuy. Aplica las REGLAS COMUNES (pegadas abajo).

Corrige A-ENT-03: app/backend/src/scripts/verificar-auditoria1-w4.ts calcula "hoy" con new Date().toISOString() (UTC), pero el historial filtra por días de BUSINESS_TIME_ZONE (America/Mexico_City). Entre las 18:00 y las 24:00 hora local da 35/37.

- Calcula la fecha del día en BUSINESS_TIME_ZONE (por ejemplo con Intl.DateTimeFormat('en-CA', { timeZone })) y úsala para el filtro.
- Busca el mismo patrón en las demás suites W4 (verificar-historial-w4-04, verificar-recorrido-venta-w4-06, verificar-auditoria2/3-w4) y corrígelo si aparece.
- Verifica forzando la hora: ejecuta la suite con TZ=UTC y con la hora de la máquina entre 18:00 y 24:00 locales (o simulando el reloj) y en horario normal: 37/37 en ambos.
- Ejecuta también las 5 suites W4 en memoria y, con TEST_DATABASE_URL local, verificar-auditoria2-w4 (47/47) y verificar-auditoria3-w4 (18/18).
- Registra en docs/auditorias/ENT-W4-2026-11-24.md y pide revisión al integrante 3.

[PEGA AQUÍ LAS REGLAS COMUNES]
```

## P4-B Integrante 4 · QA de venta, historial y anulación

```text
Eres el asistente del integrante 4 (Punto de venta e historial) del proyecto Asmibuy. Aplica las REGLAS COMUNES (pegadas abajo). Fase 3: QA sobre el despliegue con Supabase, con dos sesiones (dos navegadores o un navegador y un teléfono).

- CW-05: vender 2 hamburguesas consume 2 panes, 300 g de carne y 2 quesos, incluidas las unidades gratuitas de una promoción NxM.
- CW-06: con 1 pan en stock, dos cajas confirman a la vez: una venta y otra recibe "stock insuficiente"; el saldo queda en 0 y sin escrituras parciales.
- CW-07: doble clic en Confirmar crea una sola orden; recargar la página tras confirmar recupera la misma orden.
- CW-14: cambiar el precio en Gestión entre cotizar y confirmar → nuevo resumen para aceptar; nunca se cobra otro importe en silencio.
- CW-15: tras cambiar nombre, precio, receta y promoción, el comprobante de una venta anterior conserva los datos originales.
- CW-16: anular con motivo; repetir la anulación no cambia motivo ni autor; no se reintegra stock; el historial la excluye del total. Un TRABAJADOR no puede anular (también por petición directa: 403).
- CW-19: con las herramientas del navegador en "Offline" o cortando la red justo al confirmar, la web no declara éxito, bloquea una venta nueva y, al recuperar la red, "Verificar" o "Reintentar" recupera la misma orden.
- Historial: el filtro de un día local incluye una venta hecha después de las 18:00 hora local.

Registra evidencia en docs/auditorias/evidencias/qa-int/ y en docs/auditorias/W4-06.md. W4-06 queda "en revisión" para el integrante 3.

[PEGA AQUÍ LAS REGLAS COMUNES]
```

## PM · QA en teléfonos físicos

```text
Eres el asistente de quien realizará las pruebas en teléfonos del proyecto Asmibuy. Aplica las REGLAS COMUNES (pegadas abajo). Usa la URL HTTPS del despliegue (no IP local) y las cuentas de QA.

Para cada dispositivo disponible (Chrome en Android y Safari en iPhone), prepara y registra:
- Modelo, versión del sistema, navegador y versión exacta (Ajustes/Acerca de).
- CW-17: recorrido completo (login, venta con promoción, comprobante, historial, Avisos y, con cuenta de administrador, Gestión) a partir de 360 px de ancho, sin desplazamiento horizontal. En iPhone prueba también en horizontal.
- CW-18: texto ampliado al 200 % del sistema, foco visible con teclado Bluetooth si hay, objetivos táctiles cómodos, errores legibles junto al campo, contraste. Iconos con nombre para lector de pantalla (TalkBack/VoiceOver) en los botones de editar, pausar, retirar y salir.
- CW-19 en el teléfono: activa el modo avión justo después de tocar Confirmar; la web no declara éxito; al volver la red, la venta pendiente se verifica o reintenta con la misma orden.
- El botón Atrás del navegador funciona en todas las pantallas.

Por cada punto: captura en docs/auditorias/evidencias/qa-int/<dispositivo>/ y una fila en docs/auditorias/QA-INT-2026-10-19.md con resultado real. Si un dispositivo no está disponible hoy, escríbelo explícitamente: no se sustituye por emulación.

[PEGA AQUÍ LAS REGLAS COMUNES]
```

## PR · Registrar la decisión humana de revisión

Este prompt **solo prepara** la revisión. La decisión la toma y la firma la persona revisora.

```text
Soy el integrante <N>, revisor de la tarea <ID> del integrante <M> en el proyecto Asmibuy (tabla de revisores en AGENTS.md). Ayúdame a revisar, pero NO escribas la decisión por mí.

1. Lee docs/auditorias/<ID>.md, el plan del módulo, los commits o PR indicados y la evidencia adjunta.
2. Prepárame una lista de comprobación: criterios CW que cubre, qué evidencia es real (comando, salida, captura, entorno) y qué falta o es solo simulación. Señala diferencias entre lo reportado y el código.
3. Ejecuta los comandos de verificación que el informe declara (build y suites) y dime si se reproducen.
4. Deja preparada al final de docs/auditorias/<ID>.md una sección vacía:
   "## Decisión del revisor
   Revisor: <nombre> (integrante <N>) · Fecha: <AAAA-MM-DD> · Decisión: <aprobado | aprobado con observaciones | rechazado>
   Observaciones: <texto>"
   Yo completaré nombre, fecha, decisión y observaciones.

No cambies el estado de la tarea a "terminada": lo hará el autor solo después de que yo registre "aprobado".
```

## PO · Orquestador · Cierre y acta de entrega

```text
Eres el orquestador del proyecto Asmibuy. Aplica las REGLAS COMUNES. Fase 5: cierre de la entrega del 24-11-2026.

1. Actualiza main y haz un clon limpio: npm ci, npm audit --omit=dev (debe ser 0), build de backend y frontend, todas las suites en memoria y, con TEST_DATABASE_URL local, verificar-auditoria2-w4, verificar-auditoria3-w4 y verificar-auditoria3-w3.
2. Revisa cada docs/auditorias/ENT-*.md, W1-06.md, W4-06.md, UI-REV-02.md y QA-INT-2026-10-19.md: qué tiene evidencia real y qué decisión humana está registrada (nombre, fecha y decisión escritos por la persona).
3. Actualiza docs/matriz-aceptacion.md: un criterio pasa de "Pendiente" a "Verificado" solo si tiene evidencia real en el entorno exigido, y a "Aprobado" solo si además tiene decisión humana registrada. Lo demás queda "Pendiente" o "Parcial" con el motivo.
4. Redacta docs/entrega/acta-entrega-2026-11-24.md: versión entregada (SHA), URL del despliegue, qué se verificó y dónde, aprobaciones registradas, pendientes conocidos con responsable y riesgo (por ejemplo, un dispositivo no probado), y límites de la entrega (spec 2.1, Supabase Free).
5. Pregunta al equipo si los 6 documentos académicos locales (Documento_1, Documento_2, EV-01_EV-04, acta_validacion_cliente, DOC-DISENO, DOC-INT) forman parte de la entrega; súbelos solo con autorización.
6. Con autorización del equipo, crea la etiqueta anotada entrega-2026-11-24 sobre el SHA verificado y súbela. Confirma que el SHA remoto coincide.

No marques como aprobado nada sin la decisión escrita por el revisor humano.
```

## Referencia de hallazgos del diagnóstico

| ID | Hallazgo | Prompt |
| --- | --- | --- |
| A-ENT-01 | `npm audit --omit=dev`: `body-parser` (alta, DoS en Express), `@angular/router` (alta, solo SSR) y `qs` (moderada); 28 avisos en total, todos con corrección sin cambio mayor. | P1-A |
| A-ENT-02 | Límite de intentos por IP sin `trust proxy`: riesgo de bloquear a todo el personal en el despliegue. | P1-A |
| A-ENT-03 | `verificar-auditoria1-w4` da 35/37 entre las 18:00 y la medianoche locales por usar el día UTC. | P4-A |
| A-ENT-04 | Rama `fix/ui-revision-interfaces-02` (H-01 a H-10) sin PR, sin auditoría y sin fusionar; compila. | P1-A |
| DCU-01 | Avisos no muestra error y deja datos viejos. | P2-A |
| — | CW-01 a CW-20 pendientes; sin decisiones humanas; sin móviles, Supabase ni restauración. | P1-B, P2-B, P3-A, P4-B, PM, PR, PO |
