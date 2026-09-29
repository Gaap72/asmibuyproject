/**
 * Controlador de API REST Express para Descuentos y Promociones (Integrante 3)
 */

import { Request, Response } from 'express';
import { ServicioPromociones } from '../aplicacion/servicio-promociones';
import { ErrorPromocion, PlatilloCatalogoRefDTO } from '../dominio/tipos';

export class ControladorPromociones {
  constructor(private readonly servicio: ServicioPromociones) {}

  listar = async (req: Request, res: Response): Promise<void> => {
    try {
      const promociones = await this.servicio.listarPromociones();
      res.status(200).json(promociones);
    } catch (err: any) {
      this.manejarError(res, err);
    }
  };

  obtenerPorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        throw new ErrorPromocion('ID_INVALIDO', 'El identificador de la promoción debe ser un entero positivo.', 400);
      }
      const promo = await this.servicio.obtenerPromocion(id);
      res.status(200).json(promo);
    } catch (err: any) {
      this.manejarError(res, err);
    }
  };

  crear = async (req: Request, res: Response): Promise<void> => {
    try {
      // Verificar perfil de Administrador (inyectado por middleware de sesión W1-02/03 o simulado)
      const usuario = (req as any).usuario;
      if (usuario && usuario.perfil && usuario.perfil !== 'ADMINISTRADOR') {
        throw new ErrorPromocion('ACCESO_DENEGADO', 'Solo el administrador puede crear promociones.', 403);
      }

      const creadoPor = usuario?.id || 1; // ID de usuario por defecto en entornos de prueba
      const nueva = await this.servicio.crearPromocion(req.body, creadoPor);
      res.status(201).json(nueva);
    } catch (err: any) {
      this.manejarError(res, err);
    }
  };

  actualizar = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuario = (req as any).usuario;
      if (usuario && usuario.perfil && usuario.perfil !== 'ADMINISTRADOR') {
        throw new ErrorPromocion('ACCESO_DENEGADO', 'Solo el administrador puede modificar promociones.', 403);
      }

      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        throw new ErrorPromocion('ID_INVALIDO', 'El identificador de la promoción es inválido.', 400);
      }

      const actualizada = await this.servicio.actualizarPromocion(id, req.body);
      res.status(200).json(actualizada);
    } catch (err: any) {
      this.manejarError(res, err);
    }
  };

  cambiarEstado = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuario = (req as any).usuario;
      if (usuario && usuario.perfil && usuario.perfil !== 'ADMINISTRADOR') {
        throw new ErrorPromocion('ACCESO_DENEGADO', 'Solo el administrador puede cambiar el estado de una promoción.', 403);
      }

      const id = Number(req.params.id);
      const { estado } = req.body;
      if (isNaN(id) || id <= 0) {
        throw new ErrorPromocion('ID_INVALIDO', 'El identificador de la promoción es inválido.', 400);
      }
      if (!estado || !['ACTIVA', 'INACTIVA', 'RETIRADA'].includes(estado)) {
        throw new ErrorPromocion('ESTADO_INVALIDO', 'El estado debe ser ACTIVA, INACTIVA o RETIRADA.', 400);
      }

      const actualizada = await this.servicio.cambiarEstado(id, estado);
      res.status(200).json(actualizada);
    } catch (err: any) {
      this.manejarError(res, err);
    }
  };

  evaluar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { items, catalogo } = req.body;
      if (!Array.isArray(items)) {
        throw new ErrorPromocion('ITEMS_REQUERIDOS', 'Se requiere un arreglo de items a cotizar.', 400);
      }

      // Reconstruir mapa de catálogo recibido o usar referencias de prueba
      const platillosMap = new Map<number, PlatilloCatalogoRefDTO>();
      if (Array.isArray(catalogo)) {
        for (const p of catalogo) {
          platillosMap.set(p.id, p);
        }
      }

      const resultado = await this.servicio.evaluarOrden(items, platillosMap);
      res.status(200).json(resultado);
    } catch (err: any) {
      this.manejarError(res, err);
    }
  };

  private manejarError(res: Response, err: any): void {
    if (err instanceof ErrorPromocion) {
      res.status(err.statusHttp).json({
        codigo: err.codigo,
        mensaje: err.message,
        detalles: err.detalles
      });
      return;
    }

    console.error('Error interno en módulo de promociones:', err);
    res.status(500).json({
      codigo: 'ERROR_INTERNO',
      mensaje: 'Ha ocurrido un error inesperado al procesar las promociones.'
    });
  }
}
