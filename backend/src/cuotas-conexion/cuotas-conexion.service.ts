import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface CuotaConexion {
  codigo: number;
  instalacion_codigo: number;
  nombre: string;
  fecha: Date;
  saldo: number;
  cuota: number;
  por_interes: number;
}

@Injectable()
export class CuotasConexionService {
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
  ): Promise<{ data: CuotaConexion[]; total: number; page: number; limit: number }> {
    try {
      let query = this.dataSource
        .createQueryBuilder()
        .select('*')
        .from('view_cuotas_conexion', 'vcc');

      // Aplicar filtros
      if (filters.codigo) {
        query = query.andWhere('vcc.codigo = :codigo', {
          codigo: parseInt(filters.codigo, 10),
        });
      }

      if (filters.instalacion_codigo) {
        query = query.andWhere('vcc.instalacion_codigo::text ILIKE :instalacion_codigo', {
          instalacion_codigo: `%${filters.instalacion_codigo}%`,
        });
      }

      if (filters.nombre) {
        query = query.andWhere('vcc.nombre ILIKE :nombre', {
          nombre: `%${filters.nombre}%`,
        });
      }

      if (filters.saldo_min) {
        query = query.andWhere('vcc.saldo >= :saldo_min', {
          saldo_min: parseFloat(filters.saldo_min),
        });
      }

      if (filters.cuota_min) {
        query = query.andWhere('vcc.cuota >= :cuota_min', {
          cuota_min: parseFloat(filters.cuota_min),
        });
      }

      if (filters.cuota_max) {
        query = query.andWhere('vcc.cuota <= :cuota_max', {
          cuota_max: parseFloat(filters.cuota_max),
        });
      }

      if (filters.interes_min) {
        query = query.andWhere('vcc.por_interes >= :interes_min', {
          interes_min: parseFloat(filters.interes_min),
        });
      }

      if (filters.interes_max) {
        query = query.andWhere('vcc.por_interes <= :interes_max', {
          interes_max: parseFloat(filters.interes_max),
        });
      }

      if (filters.fecha_desde) {
        query = query.andWhere('vcc.fecha >= :fecha_desde', {
          fecha_desde: filters.fecha_desde,
        });
      }

      if (filters.fecha_hasta) {
        query = query.andWhere('vcc.fecha <= :fecha_hasta', {
          fecha_hasta: filters.fecha_hasta,
        });
      }

      // Contar total de registros
      const totalQuery = this.dataSource
        .createQueryBuilder()
        .select('COUNT(*)', 'count')
        .from('view_cuotas_conexion', 'vcc');
      
      // Aplicar los mismos filtros para el conteo
      if (filters.codigo) {
        totalQuery.andWhere('vcc.codigo = :codigo', {
          codigo: parseInt(filters.codigo),
        });
      }

      if (filters.instalacion_codigo) {
        totalQuery.andWhere('vcc.instalacion_codigo::text ILIKE :instalacion_codigo', {
          instalacion_codigo: `%${filters.instalacion_codigo}%`,
        });
      }

      if (filters.nombre) {
        totalQuery.andWhere('vcc.nombre ILIKE :nombre', {
          nombre: `%${filters.nombre}%`,
        });
      }

      if (filters.saldo_min) {
        totalQuery.andWhere('vcc.saldo >= :saldo_min', {
          saldo_min: parseFloat(filters.saldo_min),
        });
      }

      if (filters.saldo_max) {
        totalQuery.andWhere('vcc.saldo <= :saldo_max', {
          saldo_max: parseFloat(filters.saldo_max),
        });
      }

      if (filters.fecha_desde) {
        totalQuery.andWhere('vcc.fecha >= :fecha_desde', {
          fecha_desde: filters.fecha_desde,
        });
      }

      if (filters.fecha_hasta) {
        totalQuery.andWhere('vcc.fecha <= :fecha_hasta', {
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
      query = query.orderBy(`vcc.${columnToSort}`, sortOrder);

      const data = await query.getRawMany();

      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error fetching cuotas conexion:', error);
      throw new Error('Error al obtener las cuotas de conexión');
    }
  }

  async findOne(id: number): Promise<CuotaConexion> {
    try {
      const result = await this.dataSource
        .createQueryBuilder()
        .select('*')
        .from('view_cuotas_conexion', 'vcc')
        .where('vcc.codigo = :id', { id })
        .getRawOne();

      if (!result) {
        throw new Error('Cuota de conexión no encontrada');
      }

      return result;
    } catch (error) {
      console.error('Error fetching cuota conexion by id:', error);
      throw new Error('Error al obtener la cuota de conexión');
    }
  }

  async search(
    query: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: CuotaConexion[]; total: number; page: number; limit: number }> {
    try {
      const searchQuery = this.dataSource
        .createQueryBuilder()
        .select('*')
        .from('view_cuotas_conexion', 'vcc')
        .where(
          'vcc.instalacion_codigo::text ILIKE :query OR vcc.nombre ILIKE :query',
          { query: `%${query}%` },
        );

      // Contar total de registros
      const total = await searchQuery.getCount();

      // Aplicar paginación
      const offset = (page - 1) * limit;
      const data = await searchQuery
        .offset(offset)
        .limit(limit)
        .orderBy('vcc.fecha', 'DESC')
        .getRawMany();

      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error searching cuotas conexion:', error);
      throw new Error('Error al buscar las cuotas de conexión');
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
  }): Promise<CuotaConexion> {
    try {
      const result = await this.dataSource.query(
        `INSERT INTO cuotas_conexion (instalacion_codigo, valor, saldo, fecha, cuota, por_interes, empresa)
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
        throw new Error('No se pudo crear la cuota de conexión');
      }

      return result[0];
    } catch (error) {
      console.error('Error creating cuota conexion:', error);
      console.error('Query que falló:', `INSERT INTO cuotas_conexion (instalacion_codigo, valor, saldo, fecha, cuota, por_interes, empresa) VALUES (...)`);
      throw new Error('Error al crear la cuota de conexión');
    }
  }
}