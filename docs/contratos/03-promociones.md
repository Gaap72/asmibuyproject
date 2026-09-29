# Contrato de Descuentos y Promociones (Integrante 3)
**Versión:** 2.1  
**Fecha:** 28 de septiembre de 2026  
**Autor:** Integrante 3 (Descuentos y Promociones)  
**Revisor Principal:** Integrante 2 (Catálogo e Inventario)  
**Revisores Adicionales:** Integrante 4 (Ventas e Historial) e Integrante 1 (Plataforma y Accesos)

Este documento establece la especificación formal del contrato económico, esquemas de datos, tipos DTO, endpoints y lógica de cálculo exacto de promociones para el uso de los Integrantes 1 (Plataforma), 2 (Catálogo e Inventario) y 4 (Ventas e Historial).

---

## 1. Esquema de Datos y Persistencia

El módulo de Descuentos y Promociones es propietario exclusivo de la tabla `promociones` en PostgreSQL.

### 1.1 `promociones`
Almacena las reglas de promociones y descuentos configuradas por la administración.

* `id` (`SERIAL PRIMARY KEY`): Identificador único de la promoción.
* `nombre` (`VARCHAR(100) NOT NULL`): Nombre descriptivo de la promoción (ejemplo: "2x1 en Hamburguesa Clásica", "15% de Descuento en Tacos").
* `platillo_id` (`INTEGER NOT NULL REFERENCES platillos(id) ON DELETE RESTRICT`): Platillo único al que aplica la promoción. No se permite la mezcla de distintos platillos en una sola promoción.
* `tipo` (`VARCHAR(20) NOT NULL`): Tipo de regla de descuento (`'PORCENTAJE'` o `'NXM'`).
* `porcentaje` (`NUMERIC(5, 2) NULL`): Porcentaje de descuento (mayor que `0.00` y menor o igual a `100.00`). Obligatorio cuando `tipo = 'PORCENTAJE'`.
* `n` (`INTEGER NULL`): Número total de unidades en el grupo NxM (`n > m >= 1`). Obligatorio cuando `tipo = 'NXM'`.
* `m` (`INTEGER NULL`): Número de unidades que se cobran en el grupo NxM (`n > m >= 1`). Obligatorio cuando `tipo = 'NXM'`.
* `duracion` (`VARCHAR(20) NOT NULL`): Modalidad de vigencia (`'TEMPORAL'` o `'PERMANENTE'`).
* `fecha_inicio` (`TIMESTAMPTZ NULL`): Fecha y hora de inicio UTC (inclusivo: `fecha_inicio <= ahora`). Obligatorio cuando `duracion = 'TEMPORAL'`.
* `fecha_fin` (`TIMESTAMPTZ NULL`): Fecha y hora de fin UTC (exclusivo: `ahora < fecha_fin`). Obligatorio cuando `duracion = 'TEMPORAL'`.
* `estado` (`VARCHAR(20) NOT NULL DEFAULT 'ACTIVA'`): Estado operativo (`'ACTIVA'`, `'INACTIVA'` o `'RETIRADA'`).
  * `ACTIVA`: Elegible para ser evaluada y aplicada en ventas.
  * `INACTIVA`: Suspendida temporalmente por administración; no se evalúa.
  * `RETIRADA`: Retirada definitivamente por administración; no se evalúa ni se reactiva. Se conserva por integridad de referencias e historial.
* `creado_por` (`INTEGER NOT NULL REFERENCES usuarios(id)`): Identificador del administrador que creó la regla.
* `creado_en` (`TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP`): Instante de creación.
* `actualizado_en` (`TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP`): Instante de última modificación.

---

## 2. Tipos e Interfaces DTO (TypeScript)

Todas las cantidades numéricas, decimales e importes monetarios se transmiten como cadenas en JSON para preservar la exactitud sin imprecisiones flotantes.

```ts
export type TipoPromocion = 'PORCENTAJE' | 'NXM';
export type DuracionPromocion = 'TEMPORAL' | 'PERMANENTE';
export type EstadoPromocion = 'ACTIVA' | 'INACTIVA' | 'RETIRADA';

export interface PromocionDTO {
  id: number;
  nombre: string;
  platilloId: number;
  platilloNombre?: string;
  tipo: TipoPromocion;
  porcentaje?: string | null; // Ejemplo: "15.00" o "100.00"
  n?: number | null;          // Ejemplo: 2 o 3
  m?: number | null;          // Ejemplo: 1
  duracion: DuracionPromocion;
  fechaInicio?: string | null; // ISO 8601 UTC (ejemplo: "2026-09-28T00:00:00.000Z")
  fechaFin?: string | null;    // ISO 8601 UTC (ejemplo: "2026-09-29T00:00:00.000Z")
  estado: EstadoPromocion;
  creadoPor: number;
  creadoEn: string;            // ISO 8601 UTC
  actualizadoEn: string;       // ISO 8601 UTC
}

export interface CrearPromocionDTO {
  nombre: string;
  platilloId: number;
  tipo: TipoPromocion;
  porcentaje?: string;
  n?: number;
  m?: number;
  duracion: DuracionPromocion;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface ActualizarPromocionDTO {
  nombre?: string;
  platilloId?: number;
  tipo?: TipoPromocion;
  porcentaje?: string;
  n?: number;
  m?: number;
  duracion?: DuracionPromocion;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface ItemOrdenEntradaDTO {
  platilloId: number;
  cantidad: number; // Entero positivo de unidades solicitadas/entregadas
}

export interface PromocionAplicadaCopiaDTO {
  id: number;
  nombre: string;
  tipo: TipoPromocion;
  parametros: {
    porcentaje?: string;
    n?: number;
    m?: number;
  };
  duracion: DuracionPromocion;
  ahorro: string; // Importe descontado por la promoción (ejemplo: "30.00")
}

export interface LineaEvaluadaDTO {
  platilloId: number;
  platilloNombre: string;
  precioUnitario: string;           // Ejemplo: "120.00"
  cantidadEntregada: number;        // Unidades totales físicas (ej. 5)
  cantidadCobradas: number;         // Unidades facturadas (ej. 3)
  cantidadBonificadas: number;      // Unidades bonificadas (ej. 2)
  subtotalSinDescuento: string;     // cantidadEntregada * precioUnitario
  ahorroLinea: string;              // Ahorro total alcanzado en esta línea
  subtotalConDescuento: string;     // subtotalSinDescuento - ahorroLinea
  promocionAplicada?: PromocionAplicadaCopiaDTO | null;
}

export interface EvaluacionPromocionesResultadoDTO {
  items: LineaEvaluadaDTO[];
  subtotalGeneral: string;         // Suma de subtotalSinDescuento de todas las líneas
  descuentoTotal: string;          // Ahorro total de la orden
  totalOrden: string;              // subtotalGeneral - descuentoTotal
  promocionAplicadaOrden?: PromocionAplicadaCopiaDTO | null; // Única promoción aplicada a toda la orden
}
```

---

## 3. Algoritmo y Reglas del Cálculo Único en Servidor

El backend es el **único responsable** de calcular y validar descuentos y promociones. El cliente/UI no realiza cálculos de importes finales ni reglas de elegibilidad.

### 3.1 Criterios de Elegibilidad
Una promoción es elegible si cumple simultáneamente:
1. `estado = 'ACTIVA'`.
2. Si `duracion = 'TEMPORAL'`: `fecha_inicio <= hora_servidor_utc < fecha_fin` (Inicio inclusivo, fin exclusivo).
3. Si `duracion = 'PERMANENTE'`: Siempre elegible mientras continúe `ACTIVA`.
4. Platillo activo y con receta válida en el catálogo (`platillos.activo = TRUE`).

### 3.2 Regla de Selección (Una Sola Promoción por Orden)
1. Se evalúan todas las promociones elegibles aplicables a los platillos presentes en el carrito/orden.
2. Cada promoción elegible se simula sobre la línea correspondiente a su `platillo_id`.
3. Se selecciona la **única promoción** que genere el **mayor ahorro efectivo total** (`ahorroLinea`).
4. **Desempate:** En caso de que dos o más promociones elegibles generen exactamente el mismo importe de ahorro, se selecciona la promoción que tenga el **menor identificador** (`id`).
5. Todas las demás líneas de la orden conservan su precio público sin descuento (`ahorroLinea = "0.00"`).

### 3.3 Reglas de Cálculo Exacto por Tipo de Promoción
Todos los cálculos en el servidor se ejecutan utilizando la biblioteca `decimal.js` a partir de las cadenas decimales de precios y porcentajes, con redondeo estándar a 2 decimales mitad hacia arriba (`ROUND_HALF_UP`).

#### 3.3.1 Descuento por Porcentaje (`PORCENTAJE`)
* **Parámetros:** `porcentaje` (`0.01` a `100.00`).
* **Fórmula:**
  * `subtotalSinDescuento = cantidadEntregada * precioUnitario`
  * `ahorroBruto = subtotalSinDescuento * (porcentaje / 100)`
  * `ahorroLinea = round_half_up(ahorroBruto, 2)`
  * `subtotalConDescuento = subtotalSinDescuento - ahorroLinea`
  * `cantidadCobradas = cantidadEntregada`
  * `cantidadBonificadas = 0`
* **Ejemplo 1 (15%):** 1 platillo de $200.00 con 15% de descuento.
  * Subtotal sin descuento: $200.00. Ahorro: $30.00. Total línea: $170.00.
* **Ejemplo 2 (100%):** 1 platillo de $150.00 con 100% de descuento.
  * Subtotal sin descuento: $150.00. Ahorro: $150.00. Total línea: $0.00.
  * *Nota crítica:* Total $0.00 es válido y utiliza la clave de pago `SIN_COBRO`. La unidad entregada consume existencias de inventario normalmente.

#### 3.3.2 Promoción NxM (`NXM`)
* **Parámetros:** Enteros `n` y `m` con `n > m >= 1`.
* **Fórmula para $q$ unidades entregadas (`cantidadEntregada`):**
  * `gruposCompletos = floor(q / n)`
  * `unidadesSobrantes = q mod n`
  * `cantidadCobradas = (gruposCompletos * m) + unidadesSobrantes`
  * `cantidadBonificadas = q - cantidadCobradas = gruposCompletos * (n - m)`
  * `subtotalSinDescuento = q * precioUnitario`
  * `subtotalConDescuento = cantidadCobradas * precioUnitario`
  * `ahorroLinea = cantidadBonificadas * precioUnitario`
* **Regla de Sobrantes y Cantidad Entregada:**
  * Las unidades sobrantes (`q mod n`) se cobran a su precio normal unitario.
  * La cantidad total entregada $q$ jamás se altera ni se añaden unidades automáticamente.
  * Las unidades bonificadas consumen ingredientes de inventario exactamente al igual que las unidades cobradas.
* **Ejemplo 1 (2x1):** 5 unidades de $100.00 en promoción 2x1 ($n=2, m=1$).
  * Grupos completos: `floor(5/2) = 2`. Sobrantes: `5 mod 2 = 1`.
  * Cobradas: `(2 * 1) + 1 = 3`. Bonificadas: `5 - 3 = 2`.
  * Subtotal sin descuento: $500.00. Ahorro: $200.00. Total línea: $300.00.
  * Consumo de inventario: Se consumen ingredientes por las 5 unidades entregadas.
* **Ejemplo 2 (3x1):** 4 unidades de $100.00 en promoción 3x1 ($n=3, m=1$).
  * Grupos completos: `floor(4/3) = 1`. Sobrantes: `4 mod 3 = 1`.
  * Cobradas: `(1 * 1) + 1 = 2`. Bonificadas: `4 - 2 = 2`.
  * Subtotal sin descuento: $400.00. Ahorro: $200.00. Total línea: $200.00.
  * Consumo de inventario: Se consumen ingredientes por las 4 unidades entregadas.

---

## 4. Endpoints Públicos de la API (`/api/v1/promociones`)

### 4.1 Evaluación y Cotización de Promociones (`POST /api/v1/promociones/evaluar`)
* **Acceso:** `ADMINISTRADOR` y `TRABAJADOR`.
* **Cuerpo de Solicitud:**
```json
{
  "items": [
    { "platilloId": 1, "cantidad": 5 },
    { "platilloId": 2, "cantidad": 2 }
  ]
}
```
* **Respuesta (200 OK):**
```json
{
  "items": [
    {
      "platilloId": 1,
      "platilloNombre": "Hamburguesa Clásica",
      "precioUnitario": "100.00",
      "cantidadEntregada": 5,
      "cantidadCobradas": 3,
      "cantidadBonificadas": 2,
      "subtotalSinDescuento": "500.00",
      "ahorroLinea": "200.00",
      "subtotalConDescuento": "300.00",
      "promocionAplicada": {
        "id": 4,
        "nombre": "2x1 en Hamburguesas",
        "tipo": "NXM",
        "parametros": { "n": 2, "m": 1 },
        "duracion": "PERMANENTE",
        "ahorro": "200.00"
      }
    },
    {
      "platilloId": 2,
      "platilloNombre": "Refresco de Cola",
      "precioUnitario": "25.00",
      "cantidadEntregada": 2,
      "cantidadCobradas": 2,
      "cantidadBonificadas": 0,
      "subtotalSinDescuento": "50.00",
      "ahorroLinea": "0.00",
      "subtotalConDescuento": "50.00",
      "promocionAplicada": null
    }
  ],
  "subtotalGeneral": "550.00",
  "descuentoTotal": "200.00",
  "totalOrden": "350.00",
  "promocionAplicadaOrden": {
    "id": 4,
    "nombre": "2x1 en Hamburguesas",
    "tipo": "NXM",
    "parametros": { "n": 2, "m": 1 },
    "duracion": "PERMANENTE",
    "ahorro": "200.00"
  }
}
```

### 4.2 Listar Promociones (`GET /api/v1/promociones`)
* **Acceso:** `ADMINISTRADOR` y `TRABAJADOR`.
* **Respuesta (200 OK):** Arreglo de `PromocionDTO`.

### 4.3 Crear Promocion (`POST /api/v1/promociones`)
* **Acceso:** `ADMINISTRADOR` exclusivo.
* **Cuerpo:** `CrearPromocionDTO`.
* **Respuesta:** `201 Created` con `PromocionDTO`.

### 4.4 Editar Promoción (`PUT /api/v1/promociones/:id`)
* **Acceso:** `ADMINISTRADOR` exclusivo.
* **Cuerpo:** `ActualizarPromocionDTO`.
* **Respuesta:** `200 OK` con `PromocionDTO`.

### 4.5 Cambiar Estado de Promoción (`PATCH /api/v1/promociones/:id/estado`)
* **Acceso:** `ADMINISTRADOR` exclusivo.
* **Cuerpo:** `{ "estado": "ACTIVA" | "INACTIVA" | "RETIRADA" }`.
* **Regla:** Una promoción en estado `RETIRADA` no se puede reactivar.

---

## 5. Integración Transaccional con Confirmación de Ventas (Módulo 4)

1. **Re-evaluación en Confirmación:** Durante el procesamiento de `POST /api/v1/ventas/confirmar`, el servidor re-evalúa de forma atómica los precios vigentes, estado de platillos y elegibilidad de promociones.
2. **Detección de Cambios de Vigencia o Precio:** Si entre la cotización del borrador y la confirmación final la promoción expiró, fue desactivada/retirada o cambió el precio, el servidor rechaza la confirmación con el código `RESUMEN_DESACTUALIZADO` para solicitar la re-aceptación del resumen actualizado.
3. **Copia Histórica Inmutable:** Una vez confirmada la orden, los datos de la promoción aplicada (nombre, tipo, parámetros, ahorro) se persisten como copia histórica inmutable en las tablas `ordenes` y `orden_detalle`. Retirar o desactivar una promoción posteriormente **no modifica** las ventas ni los reportes pasados.

---

## 6. Códigos de Error Específicos del Módulo

| Código de Error | HTTP | Descripción |
|---|---|---|
| `PROMOCION_NO_ENCONTRADA` | 404 | La promoción especificada no existe. |
| `PARAMETROS_PROMOCION_INVALIDOS` | 400 | Inconsistencia en tipo/parámetros (ej. Porcentaje <= 0 o > 100, o N <= M o N < 1). |
| `RANGO_FECHAS_INVALIDO` | 400 | Promoción TEMPORAL con `fechaInicio >= fechaFin`. |
| `PROMOCION_RETIRADA` | 400 | Intento de reactivar o modificar una promoción en estado `RETIRADA`. |
| `RESUMEN_DESACTUALIZADO` | 409 | Cambio de precio, receta o vigencia de promoción entre la cotización y la confirmación. |

---
*Fin del contrato de la tarea W3-01.*
