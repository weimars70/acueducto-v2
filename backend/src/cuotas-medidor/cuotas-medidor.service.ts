import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface CuotaMedidor {
  codigo: number;
  instalacion_codigo: number;
  nombre: string;
  fecha: Date;
  saldo: number;
  cuota: number;
  por_interes: number;
}

@Injectable()
export class CuotasMedidorService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters: Record<string, any> = {},
    sortBy: string = 'fecha',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ): Promise<{ data: CuotaMedidor[]; total: number; page: number; limit: number }> {
    try {
      let query = this.dataSource
        .createQueryBuilder()
        .select('*')
        .from('view_cuotas_medidor', 'vcm');

      // Aplicar filtros
      if (filters.codigo) {
        query = query.andWhere('vcm.codigo = :codigo', {
          codigo: parseInt(filters.codigo, 10),
        });
      }

      if (filters.instalacion_codigo) {
        query = query.andWhere('vcm.instalacion_codigo::text ILIKE :instalacion_codigo', {
          instalacion_codigo: `%${filters.instalacion_codigo}%`,
        });
      }

      if (filters.nombre) {
        query = query.andWhere('vcm.nombre ILIKE :nombre', {
          nombre: `%${filters.nombre}%`,
        });
      }

      if (filters.saldo_min) {
        query = query.andWhere('vcm.saldo >= :saldo_min', {
          saldo_min: parseFloat(filters.saldo_min),
        });
      }

      if (filters.cuota_min) {
        query = query.andWhere('vcm.cuota >= :cuota_min', {
          cuota_min: parseFloat(filters.cuota_min),
        });
      }

      if (filters.cuota_max) {
        query = query.andWhere('vcm.cuota <= :cuota_max', {
          cuota_max: parseFloat(filters.cuota_max),
        });
      }

      if (filters.saldo_max) {
        query = query.andWhere('vcm.saldo <= :saldo_max', {
          saldo_max: parseFloat(filters.saldo_max),
        });
      }

      if (filters.fecha_desde) {
        query = query.andWhere('vcm.fecha >= :fecha_desde', {
          fecha_desde: filters.fecha_desde,
        });
      }

      if (filters.fecha_hasta) {
        query = query.andWhere('vcm.fecha <= :fecha_hasta', {
          fecha_hasta: filters.fecha_hasta,
        });
      }

      // Contar total de registros
      const totalQuery = this.dataSource
        .createQueryBuilder()
        .select('COUNT(*)', 'count')
        .from('view_cuotas_medidor', 'vcm');
      
      // Aplicar los mismos filtros para el conteo
      if (filters.codigo) {
        totalQuery.andWhere('vcm.codigo = :codigo', {
          codigo: parseInt(filters.codigo),
        });
      }

      if (filters.instalacion_codigo) {
        totalQuery.andWhere('vcm.instalacion_codigo::text ILIKE :instalacion_codigo', {
          instalacion_codigo: `%${filters.instalacion_codigo}%`,
        });
      }

      if (filters.nombre) {
        totalQuery.andWhere('vcm.nombre ILIKE :nombre', {
          nombre: `%${filters.nombre}%`,
        });
      }

      if (filters.saldo_min) {
        totalQuery.andWhere('vcm.saldo >= :saldo_min', {
          saldo_min: parseFloat(filters.saldo_min),
        });
      }

      if (filters.saldo_max) {
        totalQuery.andWhere('vcm.saldo <= :saldo_max', {
          saldo_max: parseFloat(filters.saldo_max),
        });
      }

      if (filters.fecha_desde) {
        totalQuery.andWhere('vcm.fecha >= :fecha_desde', {
          fecha_desde: filters.fecha_desde,
        });
      }

      if (filters.fecha_hasta) {
        totalQuery.andWhere('vcm.fecha <= :fecha_hasta', {
          fecha_hasta: filters.fecha_hasta,
        });
      }

      const totalResult = await totalQuery.getRawOne();
      const total = parseInt(totalResult.count);

      // Aplicar paginación
      const offset = (page - 1) * limit;
      query = query.offset(offset).limit(limit);

      // Aplicar ordenamiento dinámico
      const validColumns = ['codigo', 'instalacion_codigo', 'nombre', 'fecha', 'saldo', 'cuota', 'por_interes'];
      const columnToSort = validColumns.includes(sortBy) ? sortBy : 'fecha';
      query = query.orderBy(`vcm.${columnToSort}`, sortOrder);

      const data = await query.getRawMany();

      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error en findAll:', error);
      throw error;
    }
  }

  async findOne(id: number): Promise<CuotaMedidor> {
    try {
      const result = await this.dataSource
        .createQueryBuilder()
        .select('*')
        .from('view_cuotas_medidor', 'vcm')
        .where('vcm.codigo = :id', { id })
        .getRawOne();

      if (!result) {
        throw new Error(`Cuota medidor con ID ${id} no encontrada`);
      }

      return result;
    } catch (error) {
      console.error('Error en findOne:', error);
      throw error;
    }
  }

  async search(
    query: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: CuotaMedidor[]; total: number; page: number; limit: number }> {
    try {
      const searchQuery = this.dataSource
        .createQueryBuilder()
        .select('*')
        .from('view_cuotas_medidor', 'vcm')
        .where('vcm.nombre ILIKE :query', { query: `%${query}%` })
        .orWhere('vcm.instalacion_codigo::text ILIKE :query', { query: `%${query}%` });

      // Contar total
      const totalQuery = this.dataSource
        .createQueryBuilder()
        .select('COUNT(*)', 'count')
        .from('view_cuotas_medidor', 'vcm')
        .where('vcm.nombre ILIKE :query', { query: `%${query}%` })
        .orWhere('vcm.instalacion_codigo::text ILIKE :query', { query: `%${query}%` });

      const totalResult = await totalQuery.getRawOne();
      const total = parseInt(totalResult.count);

      // Aplicar paginación
      const offset = (page - 1) * limit;
      searchQuery.offset(offset).limit(limit);

      // Ordenar por fecha descendente por defecto
      searchQuery.orderBy('vcm.fecha', 'DESC');

      const data = await searchQuery.getRawMany();

      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error en search:', error);
      throw error;
    }
  }

  async create(createCuotaDto: {
    instalacion_codigo: number;
    fecha: string;
    valor: number;
    por_interes: number;
    cuota: number;
    saldo: number;
    empresa: number;
  }): Promise<CuotaMedidor> {
    try {
      const result = await this.dataSource.query(
        `INSERT INTO cuotas_medidor (instalacion_codigo, valor, saldo, fecha, cuota, por_interes, empresa)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          createCuotaDto.instalacion_codigo,
          createCuotaDto.valor,
          createCuotaDto.saldo,
          createCuotaDto.fecha,
          createCuotaDto.cuota,
          createCuotaDto.por_interes,
          createCuotaDto.empresa,
        ]
      );

      if (!result || result.length === 0) {
        throw new Error('No se pudo crear la cuota de medidor');
      }

      return result[0];
    } catch (error) {
      console.error('Error creating cuota medidor:', error);
      console.error('Query que falló:', `INSERT INTO cuotas_medidor (instalacion_codigo, valor, saldo, fecha, cuota, por_interes, empresa) VALUES (...)`);
      throw new Error('Error al crear la cuota de medidor');
    }
  }
}