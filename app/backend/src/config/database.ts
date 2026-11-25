import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

function obtenerConfiguracionSSL(): boolean | { rejectUnauthorized: boolean; ca?: string } {
  if (!connectionString) return false;
  if (
    process.env.DB_SSL === 'false' ||
    connectionString.includes('sslmode=disable') ||
    connectionString.includes('localhost') ||
    connectionString.includes('127.0.0.1')
  ) {
    return false;
  }

  // Por defecto verificar certificados para evitar ataques de intermediario (MITM)
  const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false';
  const sslConfig: { rejectUnauthorized: boolean; ca?: string } = {
    rejectUnauthorized
  };

  if (process.env.DB_SSL_CA) {
    sslConfig.ca = process.env.DB_SSL_CA;
  }

  return sslConfig;
}

// Configuración de pool con límites prudentes para proveedores gestionados (p. ej. Supabase Free: 5-10 conexiones)
// Se fija explícitamente TimeZone=UTC en la conexión para garantizar consistencia absoluta
// independiente de la zona horaria del host o del cliente (A3-1-02)
export const pool = new Pool({
  connectionString: connectionString || undefined,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: obtenerConfiguracionSSL(),
  options: '-c timezone=UTC'
});

pool.on('connect', (client) => {
  // Garantizar TimeZone UTC a nivel de sesión en cada nueva conexión establecida
  client.query("SET timezone = 'UTC'").catch((err) => {
    console.error('⚠️ [PostgreSQL]: Error al establecer TimeZone UTC en conexión:', err.message);
  });
});

pool.on('error', (err) => {
  console.error('⚠️ [PostgreSQL Pool Error inesperado]:', err.message);
});

/**
 * Arma el detalle del health sin revelar el host. Distingue el entorno solo por el sufijo del host
 * de DATABASE_URL (QA-L-03): «(Supabase)» si termina en supabase.com/.co; «(local)» en otro caso.
 */
export function construirDetalleConexion(url: string | undefined, horaServidor: unknown): string {
  let host = '';
  try {
    host = new URL(url || '').hostname.toLowerCase();
  } catch {
    host = '';
  }
  const entorno = /(^|\.)supabase\.(com|co)$/.test(host) ? ' (Supabase)' : host ? ' (local)' : '';
  return `Conectado a PostgreSQL${entorno}. Hora servidor: ${horaServidor}`;
}

/**
 * Verifica si la conexión con PostgreSQL está activa
 */
export async function probarConexionBD(): Promise<{ conectada: boolean; detalle: string }> {
  if (!connectionString) {
    return {
      conectada: false,
      detalle: 'DATABASE_URL no configurada. Conexión a base de datos requerida para autenticación y persistencia.'
    };
  }
  try {
    const cliente = await pool.connect();
    const res = await cliente.query('SELECT NOW() as fecha_servidor, version() as version_pg');
    cliente.release();
    return {
      conectada: true,
      detalle: construirDetalleConexion(connectionString, res.rows[0].fecha_servidor)
    };
  } catch (error: any) {
    return {
      conectada: false,
      detalle: `Fallo de conexión a base de datos: ${error.message}`
    };
  }
}
