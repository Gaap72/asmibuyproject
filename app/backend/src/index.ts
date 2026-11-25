import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { healthRouter } from './routes/health.routes';
import { authRouter } from './routes/auth.routes';
import { catalogoRouter } from './routes/catalogo.routes';
import { inventarioRouter } from './routes/inventario.routes';
import { promocionesRouter } from './routes/promociones.routes';
import { ventasRouter } from './routes/ventas.routes';
import { verificarSesion, validarCSRF, esOrigenPermitido } from './middlewares/auth.middleware';
import { probarConexionBD } from './config/database';

dotenv.config();

const app = express();

// Proxy de confianza (A-ENT-02): detrás de un proxy inverso req.ip toma X-Forwarded-For.
// Sin TRUST_PROXY no se configura nada (local). Activarlo solo si existe un proxy real.
const trustProxyEnv = (process.env.TRUST_PROXY || '').trim();
if (trustProxyEnv) {
  if (/^\d+$/.test(trustProxyEnv)) {
    app.set('trust proxy', Number(trustProxyEnv));
  } else if (trustProxyEnv.toLowerCase() === 'true') {
    app.set('trust proxy', true);
  } else if (trustProxyEnv.toLowerCase() === 'false') {
    app.set('trust proxy', false);
  } else {
    app.set('trust proxy', trustProxyEnv);
  }
} else if (process.env.NODE_ENV === 'production') {
  console.warn(
    '[Seguridad] TRUST_PROXY no está definida en producción: el límite de intentos de login agrupará a todos los clientes bajo la IP del proxy.'
  );
}
const PORT = process.env.PORT || 3001;

// Cabeceras HTTP de seguridad básicas (A3-1-03)
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('X-XSS-Protection', '0');
  next();
});

// Middlewares estándar con restricción de orígenes permitidos
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || esOrigenPermitido(origin)) {
      callback(null, origin || true);
    } else {
      callback(null, false);
    }
  },
  credentials: true
}));
app.use(express.json());

// Cookie parser sin secreto quemado por defecto (A3-1-03)
if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  console.warn('⚠️ [Seguridad]: SESSION_SECRET no configurado en entorno de producción.');
}
app.use(cookieParser(process.env.SESSION_SECRET || undefined));

// Middleware de sesión automática desde cookie
app.use(verificarSesion);

// Protección CSRF en peticiones mutables
app.use(validarCSRF);

// Registro de rutas API v1
app.use('/api/v1', healthRouter);
app.use('/api/v1', authRouter);
app.use('/api/v1', catalogoRouter);
app.use('/api/v1', inventarioRouter);
app.use('/api/v1', promocionesRouter);
app.use('/api/v1', ventasRouter);

// Manejador de rutas no encontradas (404)
app.use('*', (_req, res) => {
  res.status(404).json({
    codigo: 'RECURSO_NO_ENCONTRADO',
    mensaje: 'La ruta solicitada no existe en la API de Asmibuy.',
    detalles: null
  });
});

// Inicio del servidor
app.listen(PORT, async () => {
  console.log('====================================================');
  console.log('🚀 SERVIDOR BACKEND ASMIBUY API v1 INICIADO');
  console.log(`📡 URL Base: http://localhost:${PORT}/api/v1`);
  console.log(`🩺 Endpoint de Salud: http://localhost:${PORT}/api/v1/health`);
  console.log(`🔐 Autenticación: http://localhost:${PORT}/api/v1/auth/login`);
  console.log('====================================================');

  const bd = await probarConexionBD();
  console.log(`🐘 Estado BD: ${bd.detalle}`);
});

export default app;
