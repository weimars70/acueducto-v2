import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface AcuerdoPago {
  codigo: string;
  instalacion_codigo: string;
  nombre: string;
  fecha: Date;
  saldo: number;
  cuota: number;
  por_interes: number;
  empresa: string;
}

@Injectable()
export class AcuerdosPagoService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'codigo',
    sortOrder: 'ASC' | 'DESC' = 'ASC',
    filters: any = {},
    empresaCodigo?: string
  ): Promise<{ data: AcuerdoPago[]; total: number }> {
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    const params: any[] = [];
    let paramIndex = 1;

    // Filtro obligatorio por empresa
    if (empresaCodigo) {
      whereClause = 'WHERE empresa = $' + paramIndex;
      params.push(empresaCodigo);
      paramIndex++;
    }

    // Filtros adicionales
    if (filters.codigo) {
      whereClause += whereClause ? ' AND ' : 'WHERE ';
      whereClause += `codigo ILIKE $${paramIndex}`;
      params.push(`%${filters.codigo}%`);
      paramIndex++;
    }

    if (filters.instalacion_codigo) {
      whereClause += whereClause ? ' AND ' : 'WHERE ';
      whereClause += `instalacion_codigo ILIKE $${paramIndex}`;
      params.push(`%${filters.instalacion_codigo}%`);
      paramIndex++;
    }

    if (filters.nombre) {
      whereClause += whereClause ? ' AND ' : 'WHERE ';
      whereClause += `nombre ILIKE $${paramIndex}`;
      params.push(`%${filters.nombre}%`);
      paramIndex++;
    }

    if (filters.fecha_desde) {
      whereClause += whereClause ? ' AND ' : 'WHERE ';
      whereClause += `fecha >= $${paramIndex}`;
      params.push(filters.fecha_desde);
      paramIndex++;
    }

    if (filters.fecha_hasta) {
      whereClause += whereClause ? ' AND ' : 'WHERE ';
      whereClause += `fecha <= $${paramIndex}`;
      params.push(filters.fecha_hasta);
      paramIndex++;
    }

    // Consulta para obtener los datos
    const dataQuery = `
      SELECT codigo, instalacion_codigo, nombre, fecha, saldo, cuota, por_interes, empresa
      FROM view_cuotas_diferidos
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(limit, offset);

    // Consulta para obtener el total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM view_cuotas_diferidos
      ${whereClause}
    `;

    const countParams = params.slice(0, -2); // Remover limit y offset para el count

    try {
      const [dataResult, countResult] = await Promise.all([
        this.dataSource.query(dataQuery, params),
        this.dataSource.query(countQuery, countParams)
      ]);

      // Manejar la respuesta según la estructura de PostgreSQL
      const data = dataResult || [];
      const total = countResult && countResult.length > 0 ? parseInt(countResult[0].total) : 0;

      return {
        data,
        total
      };
    } catch (error) {
      console.error('Error en AcuerdosPagoService.findAll:', error);
      throw error;
    }
  }

  async findOne(id: string, empresaCodigo?: string): Promise<AcuerdoPago | null> {
    let whereClause = 'WHERE codigo = $1';
    const params: any[] = [id];

    if (empresaCodigo) {
      whereClause += ' AND empresa = $2';
      params.push(empresaCodigo);
    }

    const query = `
      SELECT codigo, instalacion_codigo, nombre, fecha, saldo, cuota, por_interes, empresa
      FROM view_cuotas_diferidos
      ${whereClause}
    `;

    try {
      const result = await this.dataSource.query(query, params);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error en AcuerdosPagoService.findOne:', error);
      throw error;
    }
  }

  async search(
    searchTerm: string,
    empresaCodigo?: string,
    limit: number = 10
  ): Promise<AcuerdoPago[]> {
    let whereClause = `WHERE (
      codigo ILIKE $1 OR 
      instalacion_codigo ILIKE $1 OR 
      nombre ILIKE $1
    )`;
    
    const params: any[] = [`%${searchTerm}%`];

    if (empresaCodigo) {
      whereClause += ' AND empresa = $2';
      params.push(empresaCodigo);
    }

    const query = `
      SELECT codigo, instalacion_codigo, nombre, fecha, saldo, cuota, por_interes, empresa
      FROM view_cuotas_diferidos
      ${whereClause}
      ORDER BY codigo
      LIMIT $${params.length + 1}
    `;

    params.push(limit);

    try {
      const result = await this.dataSource.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error en AcuerdosPagoService.search:', error);
      throw error;
    }
  }
}