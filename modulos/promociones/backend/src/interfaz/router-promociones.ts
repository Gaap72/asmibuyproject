/**
 * Enrutador Express para Descuentos y Promociones (Integrante 3)
 */

import { Router } from 'express';
import { ControladorPromociones } from './controlador-promociones';
import { ServicioPromociones } from '../aplicacion/servicio-promociones';

export function crearRouterPromociones(servicio: ServicioPromociones): Router {
  const router = Router();
  const controlador = new ControladorPromociones(servicio);

  router.get('/', controlador.listar);
  router.post('/evaluar', controlador.evaluar);
  router.get('/:id', controlador.obtenerPorId);
  router.post('/', controlador.crear);
  router.put('/:id', controlador.actualizar);
  router.patch('/:id/estado', controlador.cambiarEstado);

  return router;
}
