-- Migración PostgreSQL para el Módulo de Descuentos y Promociones (Integrante 3)
-- Versión 2.1 - MVP Web Móvil

CREATE TABLE IF NOT EXISTS promociones (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  platillo_id INTEGER NOT NULL REFERENCES platillos(id) ON DELETE RESTRICT,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('PORCENTAJE', 'NXM')),
  porcentaje NUMERIC(5, 2) NULL CHECK (porcentaje IS NULL OR (porcentaje > 0.00 AND porcentaje <= 100.00)),
  n INTEGER NULL CHECK (n IS NULL OR n >= 1),
  m INTEGER NULL CHECK (m IS NULL OR (m >= 1 AND n > m)),
  duracion VARCHAR(20) NOT NULL CHECK (duracion IN ('TEMPORAL', 'PERMANENTE')),
  fecha_inicio TIMESTAMPTZ NULL,
  fecha_fin TIMESTAMPTZ NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA' CHECK (estado IN ('ACTIVA', 'INACTIVA', 'RETIRADA')),
  creado_por INTEGER NOT NULL REFERENCES usuarios(id),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_duracion_fechas CHECK (
    (duracion = 'PERMANENTE' AND fecha_inicio IS NULL AND fecha_fin IS NULL) OR
    (duracion = 'TEMPORAL' AND fecha_inicio IS NOT NULL AND fecha_fin IS NOT NULL AND fecha_inicio < fecha_fin)
  ),
  CONSTRAINT chk_tipo_parametros CHECK (
    (tipo = 'PORCENTAJE' AND porcentaje IS NOT NULL AND n IS NULL AND m IS NULL) OR
    (tipo = 'NXM' AND porcentaje IS NULL AND n IS NOT NULL AND m IS NOT NULL)
  )
);

-- Índices para optimizar la consulta de promociones activas por platillo
CREATE INDEX IF NOT EXISTS idx_promociones_platillo_estado ON promociones (platillo_id, estado);
CREATE INDEX IF NOT EXISTS idx_promociones_duracion_fechas ON promociones (duracion, fecha_inicio, fecha_fin);
