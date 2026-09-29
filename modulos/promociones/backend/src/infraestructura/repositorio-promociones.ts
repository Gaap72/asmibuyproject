/**
 * Repositorio de Persistencia PostgreSQL para Promociones (Integrante 3)
 * Soporta consultas parametrizadas `pg` y fallback simulado para entornos de prueba.
 */

import { PromocionEntidad, EstadoPromocion, ErrorPromocion } from '../dominio/tipos';

export interface InterfaceRepositorioPromociones {
  listar(): Promise<PromocionEntidad[]>;
  obtenerPorId(id: number): Promise<PromocionEntidad | null>;
  obtenerElegibles(ahora?: Date): Promise<PromocionEntidad[]>;
  crear(datos: Omit<PromocionEntidad, 'id' | 'creado_en' | 'actualizado_en'>): Promise<PromocionEntidad>;
  actualizar(id: number, cambios: Partial<PromocionEntidad>): Promise<PromocionEntidad>;
  cambiarEstado(id: number, nuevoEstado: EstadoPromocion): Promise<PromocionEntidad>;
}

/**
 * Repositorio de PostgreSQL basado en el cliente `pg`
 */
export class RepositorioPromocionesPg implements InterfaceRepositorioPromociones {
  constructor(private readonly pgPoolOrClient: any) {}

  async listar(): Promise<PromocionEntidad[]> {
    if (!this.pgPoolOrClient || typeof this.pgPoolOrClient.query !== 'function') {
      throw new ErrorPromocion('DB_NO_CONECTADA', 'El cliente PostgreSQL no está disponible.', 500);
    }

    const sql = `
      SELECT pr.*, p.nombre AS platillo_nombre
      FROM promociones pr
      JOIN platillos p ON pr.platillo_id = p.id
      ORDER BY pr.id DESC;
    `;
    const res = await this.pgPoolOrClient.query(sql);
    return res.rows;
  }

  async obtenerPorId(id: number): Promise<PromocionEntidad | null> {
    if (!this.pgPoolOrClient) return null;

    const sql = `
      SELECT pr.*, p.nombre AS platillo_nombre
      FROM promociones pr
      JOIN platillos p ON pr.platillo_id = p.id
      WHERE pr.id = $1;
    `;
    const res = await this.pgPoolOrClient.query(sql, [id]);
    return res.rows.length ? res.rows[0] : null;
  }

  async obtenerElegibles(ahora: Date = new Date()): Promise<PromocionEntidad[]> {
    if (!this.pgPoolOrClient) return [];

    const sql = `
      SELECT pr.*, p.nombre AS platillo_nombre
      FROM promociones pr
      JOIN platillos p ON pr.platillo_id = p.id
      WHERE pr.estado = 'ACTIVA'
        AND p.activo = TRUE
        AND (
          pr.duracion = 'PERMANENTE'
          OR (pr.duracion = 'TEMPORAL' AND pr.fecha_inicio <= $1 AND $1 < pr.fecha_fin)
        )
      ORDER BY pr.id ASC;
    `;
    const res = await this.pgPoolOrClient.query(sql, [ahora.toISOString()]);
    return res.rows;
  }

  async crear(datos: Omit<PromocionEntidad, 'id' | 'creado_en' | 'actualizado_en'>): Promise<PromocionEntidad> {
    const sql = `
      INSERT INTO promociones (
        nombre, platillo_id, tipo, porcentaje, n, m, duracion, fecha_inicio, fecha_fin, estado, creado_por
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;
    const params = [
      datos.nombre,
      datos.platillo_id,
      datos.tipo,
      datos.porcentaje || null,
      datos.n || null,
      datos.m || null,
      datos.duracion,
      datos.fecha_inicio || null,
      datos.fecha_fin || null,
      datos.estado || 'ACTIVA',
      datos.creado_por
    ];

    const res = await this.pgPoolOrClient.query(sql, params);
    return res.rows[0];
  }

  async actualizar(id: number, cambios: Partial<PromocionEntidad>): Promise<PromocionEntidad> {
    const actual = await this.obtenerPorId(id);
    if (!actual) {
      throw new ErrorPromocion('PROMOCION_NO_ENCONTRADA', `La promoción #${id} no existe.`, 404);
    }
    if (actual.estado === 'RETIRADA') {
      throw new ErrorPromocion('PROMOCION_RETIRADA', 'No se puede modificar una promoción retirada.', 400);
    }

    const sql = `
      UPDATE promociones
      SET nombre = COALESCE($1, nombre),
          platillo_id = COALESCE($2, platillo_id),
          tipo = COALESCE($3, tipo),
          porcentaje = $4,
          n = $5,
          m = $6,
          duracion = COALESCE($7, duracion),
          fecha_inicio = $8,
          fecha_fin = $9,
          actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *;
    `;
    const params = [
      cambios.nombre ?? null,
      cambios.platillo_id ?? null,
      cambios.tipo ?? null,
      cambios.porcentaje ?? actual.porcentaje,
      cambios.n ?? actual.n,
      cambios.m ?? actual.m,
      cambios.duracion ?? null,
      cambios.fecha_inicio ?? actual.fecha_inicio,
      cambios.fecha_fin ?? actual.fecha_fin,
      id
    ];

    const res = await this.pgPoolOrClient.query(sql, params);
    return res.rows[0];
  }

  async cambiarEstado(id: number, nuevoEstado: EstadoPromocion): Promise<PromocionEntidad> {
    const actual = await this.obtenerPorId(id);
    if (!actual) {
      throw new ErrorPromocion('PROMOCION_NO_ENCONTRADA', `La promoción #${id} no existe.`, 404);
    }
    if (actual.estado === 'RETIRADA') {
      throw new ErrorPromocion('PROMOCION_RETIRADA', 'Una promoción retirada no puede cambiar de estado ni reactivarse.', 400);
    }

    const sql = `
      UPDATE promociones
      SET estado = $1,
          actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;
    const res = await this.pgPoolOrClient.query(sql, [nuevoEstado, id]);
    return res.rows[0];
  }
}

/**
 * Repositorio Simulado en Memoria para Pruebas Independientes sin DB Conectada
 */
export class RepositorioPromocionesSimulado implements InterfaceRepositorioPromociones {
  private promociones: Map<number, PromocionEntidad> = new Map();
  private secId = 1;

  constructor(iniciales: PromocionEntidad[] = []) {
    for (const p of iniciales) {
      this.promociones.set(p.id, { ...p });
      if (p.id >= this.secId) this.secId = p.id + 1;
    }
  }

  async listar(): Promise<PromocionEntidad[]> {
    return Array.from(this.promociones.values()).sort((a, b) => b.id - a.id);
  }

  async obtenerPorId(id: number): Promise<PromocionEntidad | null> {
    const p = this.promociones.get(id);
    return p ? { ...p } : null;
  }

  async obtenerElegibles(ahora: Date = new Date()): Promise<PromocionEntidad[]> {
    const t = ahora.getTime();
    return Array.from(this.promociones.values()).filter(p => {
      if (p.estado !== 'ACTIVA') return false;
      if (p.duracion === 'TEMPORAL') {
        if (!p.fecha_inicio || !p.fecha_fin) return false;
        const ini = new Date(p.fecha_inicio).getTime();
        const fin = new Date(p.fecha_fin).getTime();
        if (t < ini || t >= fin) return false;
      }
      return true;
    }).sort((a, b) => a.id - b.id);
  }

  async crear(datos: Omit<PromocionEntidad, 'id' | 'creado_en' | 'actualizado_en'>): Promise<PromocionEntidad> {
    const id = this.secId++;
    const nueva: PromocionEntidad = {
      ...datos,
      id,
      creado_en: new Date(),
      actualizado_en: new Date()
    };
    this.promociones.set(id, nueva);
    return { ...nueva };
  }

  async actualizar(id: number, cambios: Partial<PromocionEntidad>): Promise<PromocionEntidad> {
    const actual = this.promociones.get(id);
    if (!actual) {
      throw new ErrorPromocion('PROMOCION_NO_ENCONTRADA', `La promoción #${id} no existe.`, 404);
    }
    if (actual.estado === 'RETIRADA') {
      throw new ErrorPromocion('PROMOCION_RETIRADA', 'No se puede modificar una promoción retirada.', 400);
    }

    const actualizada: PromocionEntidad = {
      ...actual,
      ...cambios,
      actualizado_en: new Date()
    };
    this.promociones.set(id, actualizada);
    return { ...actualizada };
  }

  async cambiarEstado(id: number, nuevoEstado: EstadoPromocion): Promise<PromocionEntidad> {
    const actual = this.promociones.get(id);
    if (!actual) {
      throw new ErrorPromocion('PROMOCION_NO_ENCONTRADA', `La promoción #${id} no existe.`, 404);
    }
    if (actual.estado === 'RETIRADA') {
      throw new ErrorPromocion('PROMOCION_RETIRADA', 'Una promoción retirada no puede cambiar de estado ni reactivarse.', 400);
    }

    actual.estado = nuevoEstado;
    actual.actualizado_en = new Date();
    this.promociones.set(id, actual);
    return { ...actual };
  }
}
