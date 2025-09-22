import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';

interface CrudOperation {
  action: 'create' | 'read' | 'update' | 'delete' | 'list';
  table: string;
  data?: Record<string, any>;
  id?: number | string;
  filters?: Record<string, any>;
  pagination?: {
    page: number;
    limit: number;
  };
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

interface CrudResponse<T = Record<string, any>> {
  success: boolean;
  data?: T | T[];
  message?: string;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string;
}

@Injectable()
export class DynamicMaestrosService {
  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

  async executeOperation(operation: CrudOperation): Promise<CrudResponse> {
    try {
      switch (operation.action) {
        case 'list':
          return await this.list(operation);
        case 'read':
          return await this.read(operation);
        case 'create':
          return await this.create(operation);
        case 'update':
          return await this.update(operation);
        case 'delete':
          return await this.delete(operation);
        default:
          throw new Error(`Operación no soportada: ${operation.action}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async list(operation: CrudOperation): Promise<CrudResponse> {
    const { table, pagination, filters, sort } = operation;
    
    // Validar que la tabla existe
    await this.validateTable(table);

    let query = `SELECT * FROM ${table}`;
    const params: any[] = [];
    let paramIndex = 1;

    // Aplicar filtros
    const whereConditions: string[] = [];
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (key === 'search' && value) {
          // Búsqueda general en campos de texto
          const textColumns = await this.getTextColumns(table);
          if (textColumns.length > 0) {
            const searchConditions = textColumns.map(col => {
              const currentParamIndex = paramIndex++;
              params.push(`%${value}%`);
              return `LOWER(${col}::text) LIKE LOWER($${currentParamIndex})`;
            });
            whereConditions.push(`(${searchConditions.join(' OR ')})`);
          }
        } else if (value !== undefined && value !== null && key !== 'search' && key !== 'sortBy' && key !== 'sortOrder') {
          whereConditions.push(`${key} = $${paramIndex}`);
          params.push(value);
          paramIndex++;
        }
      }
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    // Aplicar ordenamiento
    if (sort) {
      query += ` ORDER BY ${sort.field} ${sort.direction.toUpperCase()}`;
    }

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as count_query`;
    const countResult = await this.pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Aplicar paginación
    if (pagination) {
      const offset = (pagination.page - 1) * pagination.limit;
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(pagination.limit, offset);
    }
    
    const result = await this.pool.query(query, params);

    const response: CrudResponse = {
      success: true,
      data: result.rows,
    };

    if (pagination) {
      response.pagination = {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
      };
    }

    return response;
  }

  private async read(operation: CrudOperation): Promise<CrudResponse> {
    const { table, id } = operation;
    
    await this.validateTable(table);
    
    const primaryKey = await this.getPrimaryKey(table);
    const query = `SELECT * FROM ${table} WHERE ${primaryKey} = $1`;
    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) {
      throw new Error(`Registro no encontrado en ${table} con id ${id}`);
    }

    return {
      success: true,
      data: result.rows[0],
    };
  }

  private async create(operation: CrudOperation): Promise<CrudResponse> {
    const { table, data } = operation;
    
    await this.validateTable(table);
    
    if (!data || Object.keys(data).length === 0) {
      throw new Error('No se proporcionaron datos para crear el registro');
    }

    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`);

    const query = `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;

    const result = await this.pool.query(query, values);

    return {
      success: true,
      data: result.rows[0],
      message: 'Registro creado exitosamente',
    };
  }

  private async update(operation: CrudOperation): Promise<CrudResponse> {
    const { table, id, data } = operation;
    
    await this.validateTable(table);
    
    if (!data || Object.keys(data).length === 0) {
      throw new Error('No se proporcionaron datos para actualizar el registro');
    }

    const primaryKey = await this.getPrimaryKey(table);
    const columns = Object.keys(data);
    const values = Object.values(data);
    
    const setClause = columns.map((col, index) => `${col} = $${index + 1}`).join(', ');
    
    const query = `
      UPDATE ${table}
      SET ${setClause}
      WHERE ${primaryKey} = $${values.length + 1}
      RETURNING *
    `;

    const result = await this.pool.query(query, [...values, id]);

    if (result.rows.length === 0) {
      throw new Error(`Registro no encontrado en ${table} con id ${id}`);
    }

    return {
      success: true,
      data: result.rows[0],
      message: 'Registro actualizado exitosamente',
    };
  }

  private async delete(operation: CrudOperation): Promise<CrudResponse> {
    const { table, id } = operation;
    
    await this.validateTable(table);
    
    const primaryKey = await this.getPrimaryKey(table);
    const query = `DELETE FROM ${table} WHERE ${primaryKey} = $1 RETURNING *`;
    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) {
      throw new Error(`Registro no encontrado en ${table} con id ${id}`);
    }

    return {
      success: true,
      data: result.rows[0],
      message: 'Registro eliminado exitosamente',
    };
  }

  async getTableSchema(table: string): Promise<ColumnInfo[]> {
    await this.validateTable(table);
    
    const query = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position
    `;
    
    const result = await this.pool.query(query, [table]);
    return result.rows;
  }

  private async validateTable(table: string): Promise<void> {
    const query = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = $1
    `;
    
    const result = await this.pool.query(query, [table]);
    
    if (result.rows.length === 0) {
      throw new Error(`La tabla '${table}' no existe`);
    }
  }

  private async getPrimaryKey(table: string): Promise<string> {
    const query = `
      SELECT a.attname
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = $1::regclass AND i.indisprimary
    `;
    
    const result = await this.pool.query(query, [table]);
    
    if (result.rows.length === 0) {
      throw new Error(`No se encontró clave primaria para la tabla '${table}'`);
    }
    
    return result.rows[0].attname;
  }

  private async getTextColumns(table: string): Promise<string[]> {
    const query = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = $1 
      AND data_type IN ('text', 'character varying', 'character', 'varchar', 'char')
    `;
    
    const result = await this.pool.query(query, [table]);
    return result.rows.map(row => row.column_name);
  }
}