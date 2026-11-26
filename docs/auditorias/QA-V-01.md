# Auditoría QA-V-01: Avisos distingue los insumos inactivos

ID: QA-V-01 (hallazgo de `QA-VISUAL-2026-11-25`, rama `qa/visual-2026-11-25`). Prioridad: P1 (observación de gravedad baja). Estado: **en revisión**.
Autor: integrante 2 (Catálogo e inventario). Revisor principal: integrante 1. Revisión adicional: integrante 4 (consumo del contrato de Avisos). Versión del cambio: rama `fix/qa-v-01-avisos-inactivos`, sobre `main` `2fe9478`.

## Resultado y dependencias

Hallazgo: Avisos mostraba los ingredientes dados de baja (por ejemplo, Lechuga) con su estado de stock y sin indicar que estaban inactivos, lo que podía confundirse con un insumo en uso.

Decisión: se conserva **una fila por ingrediente** (CW-09, `AGENTS.md`: «Avisos es una vista del stock actual con una fila por ingrediente») y se marca el insumo inactivo con texto, no solo con color. No se filtra para no cambiar el criterio CW-09 ni los conteos de las baterías.

Archivos:
- `app/backend/src/routes/inventario.routes.ts`: `GET /api/v1/inventario/avisos` añade el campo `activo` (ya venía de `CatalogoService.listarIngredientes`). Sin cambios de consulta, orden ni prioridad.
- `app/frontend/src/app/services/inventario.service.ts`: `AvisoStockDTO.activo: boolean`.
- `app/frontend/src/app/components/avisos/avisos.component.ts`: si `activo === false`, la tarjeta usa fondo `--color-fondo` y muestra la etiqueta «Inactivo» (icono `block` con `aria-hidden`, borde #6B7280, texto #4B5563) y el texto «Dado de baja: no se usa en recetas ni ventas.».
- `docs/contratos/02-catalogo-inventario.md` §3.2: campo `activo` documentado. Es un campo añadido; ningún consumidor existente cambia.

Criterios relacionados: CW-09 (sin cambio de regla), CW-18 (no depender solo del color).

## Comprobaciones realizadas

Entorno: Windows 11, Node v26.10.0, `npm ci`. Sin `DATABASE_URL` ni `TEST_DATABASE_URL` (modo memoria).

| Área | Evidencia real | Resultado |
| --- | --- | --- |
| Estructura y alcance | Solo archivos de Avisos / inventario (módulo 2) y su contrato. `git diff --check` sin errores | cumple |
| Compilación | `npm run build:backend` y `npm run build:frontend` correctos | cumple |
| Funcionalidad y límites | `verificar-minimos-avisos-w2-05`: 23/23; `verificar-auditoria1-w2`: 26/0; `verificar-auditoria2-w2`: 14/14; `verificar-auditoria3-w2` (desde la raíz del repo): 17/17 | cumple (regresión) |
| Datos y transacciones | No aplica: solo se expone un campo existente, sin escritura | no aplica |
| Acceso y sesión | Sin cambios: la ruta sigue con `exigirAutenticacion` | no aplica |
| Diseño y navegador | **No verificado en navegador.** Falta abrir Avisos con un insumo desactivado (escritorio y 360 px) y adjuntar captura | pendiente |

Nota: `verificar-auditoria3-w2` da 15/17 si se ejecuta desde `app/backend`, porque busca `plan.md` y el contrato con rutas relativas a la raíz. Ocurre igual en `main`; no lo causa este cambio.

## Hallazgos y revisión

Pendiente para el revisor: desactivar un insumo sin platillos activos, abrir Avisos y comprobar la etiqueta «Inactivo» a 360 px y en escritorio, sin desbordamiento horizontal.

## Decisión del revisor
Revisor:
Fecha:
Decisión:
Observaciones:

## Cierre

Queda en revisión hasta la prueba en navegador y la decisión del integrante 1.
