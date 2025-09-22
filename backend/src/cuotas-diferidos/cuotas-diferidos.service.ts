import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface CuotaDiferido {
  codigo: number;
  instalacion_codigo: number;
  nombre: string;
  fecha: Date;
  saldo: number;
  cuota: number;
  por_interes: number;
}

@Injectable()
export class CuotasDiferidosService {
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
  ): Promise<{ data: CuotaDiferido[]; total: number; page: number; limit: number }> {
    try {
      let query = this.dataSource
        .createQueryBuilder()
        .select('*')
        .from('view_cuotas_diferidos', 'vcd');

      // Aplicar filtros
      if (filters.codigo) {
        query = query.andWhere('vcd.codigo = :codigo', {
          codigo: parseInt(filters.codigo, 10),
        });
      }

      if (filters.instalacion_codigo) {
        query = query.andWhere('vcd.instalacion_codigo::text ILIKE :instalacion_codigo', {
          instalacion_codigo: `%${filters.instalacion_codigo}%`,
        });
      }

      if (filters.nombre) {
        query = query.andWhere('vcd.nombre ILIKE :nombre', {
          nombre: `%${filters.nombre}%`,
        });
      }



      if (filters.saldo_min) {
        query = query.andWhere('vcd.saldo >= :saldo_min', {
          saldo_min: parseFloat(filters.saldo_min),
        });
      }

      if (filters.cuota_min) {
        query = query.andWhere('vcd.cuota >= :cuota_min', {
          cuota_min: parseFloat(filters.cuota_min),
        });
      }

      if (filters.cuota_max) {
        query = query.andWhere('vcd.cuota <= :cuota_max', {
          cuota_max: parseFloat(filters.cuota_max),
        });
      }

      if (filters.interes_min) {
        query = query.andWhere('vcd.por_interes >= :interes_min', {
          interes_min: parseFloat(filters.interes_min),
        });
      }

      if (filters.interes_max) {
        query = query.andWhere('vcd.por_interes <= :interes_max', {
          interes_max: parseFloat(filters.interes_max),
        });
      }

      if (filters.fecha_desde) {
        query = query.andWhere('vcd.fecha >= :fecha_desde', {
          fecha_desde: filters.fecha_desde,
        });
      }

      if (filters.fecha_hasta) {
        query = query.andWhere('vcd.fecha <= :fecha_hasta', {
          fecha_hasta: filters.fecha_hasta,
        });
      }

      // Contar total de registros
      const totalQuery = this.dataSource
        .createQueryBuilder()
        .select('COUNT(*)', 'count')
        .from('view_cuotas_diferidos', 'vcd');

      // Aplicar los mismos filtros al conteo
      if (filters.codigo) {
        totalQuery.andWhere('vcd.codigo = :codigo', {
          codigo: parseInt(filters.codigo, 10),
        });
      }

      if (filters.instalacion_codigo) {
        totalQuery.andWhere('vcd.instalacion_codigo::text ILIKE :instalacion_codigo', {
          instalacion_codigo: `%${filters.instalacion_codigo}%`,
        });
      }

      if (filters.nombre) {
        totalQuery.andWhere('vcd.nombre ILIKE :nombre', {
          nombre: `%${filters.nombre}%`,
        });
      }

      if (filters.concepto) {
        totalQuery.andWhere('vcd.concepto ILIKE :concepto', {
          concepto: `%${filters.concepto}%`,
        });
      }

      if (filters.saldo_min) {
        totalQuery.andWhere('vcd.saldo >= :saldo_min', {
          saldo_min: parseFloat(filters.saldo_min),
        });
      }

      if (filters.cuota_min) {
        totalQuery.andWhere('vcd.cuota >= :cuota_min', {
          cuota_min: parseFloat(filters.cuota_min),
        });
      }

      if (filters.cuota_max) {
        totalQuery.andWhere('vcd.cuota <= :cuota_max', {
          cuota_max: parseFloat(filters.cuota_max),
        });
      }

      if (filters.interes_min) {
        totalQuery.andWhere('vcd.por_interes >= :interes_min', {
          interes_min: parseFloat(filters.interes_min),
        });
      }

      if (filters.interes_max) {
        totalQuery.andWhere('vcd.por_interes <= :interes_max', {
          interes_max: parseFloat(filters.interes_max),
        });
      }

      if (filters.fecha_desde) {
        totalQuery.andWhere('vcd.fecha >= :fecha_desde', {
          fecha_desde: filters.fecha_desde,
        });
      }

      if (filters.fecha_hasta) {
        totalQuery.andWhere('vcd.fecha <= :fecha_hasta', {
          fecha_hasta: filters.fecha_hasta,
        });
      }

      // Obtener el total
      const totalResult = await totalQuery.getRawOne();
      const total = parseInt(totalResult.count, 10);

      // Aplicar ordenamiento
      query = query.orderBy(`vcd.${sortBy}`, sortOrder);

      // Aplicar paginación
      const offset = (page - 1) * limit;
      query = query.offset(offset).limit(limit);

      const data = await query.getRawMany();

      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error fetching cuotas diferidos:', error);
      throw new Error('Error al obtener las cuotas diferidos');
    }
  }

  async findOne(id: number): Promise<CuotaDiferido> {
    try {
      const result = await this.dataSource.query(
        'SELECT * FROM view_cuotas_diferidos WHERE codigo = $1',
        [id]
      );

      if (!result || result.length === 0) {
        throw new Error('Cuota diferido no encontrada');
      }

      return result[0];
    } catch (error) {
      console.error('Error fetching cuota diferido:', error);
      throw new Error('Error al obtener la cuota diferido');
    }
  }

  async search(
    query: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: CuotaDiferido[]; total: number; page: number; limit: number }> {
    try {
      const searchQuery = this.dataSource
        .createQueryBuilder()
        .select('*')
        .from('view_cuotas_diferidos', 'vcd')
        .where('vcd.nombre ILIKE :query', { query: `%${query}%` })
        .orWhere('vcd.instalacion_codigo::text ILIKE :query', { query: `%${query}%` });

      // Contar total de registros
      const totalQuery = this.dataSource
        .createQueryBuilder()
        .select('COUNT(*)', 'count')
        .from('view_cuotas_diferidos', 'vcd')
        .where('vcd.nombre ILIKE :query', { query: `%${query}%` })
        .orWhere('vcd.instalacion_codigo::text ILIKE :query', { query: `%${query}%` });

      const totalResult = await totalQuery.getRawOne();
      const total = parseInt(totalResult.count, 10);

      // Aplicar paginación
      const offset = (page - 1) * limit;
      searchQuery.offset(offset).limit(limit);

      const data = await searchQuery.getRawMany();

      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error searching cuotas diferidos:', error);
      throw new Error('Error al buscar las cuotas diferidos');
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
  }): Promise<CuotaDiferido> {
    try {
      const result = await this.dataSource.query(
        `INSERT INTO cuotas_diferidos (instalacion_codigo, valor, saldo, fecha, cuota, por_interes, empresa)
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
        throw new Error('No se pudo crear la cuota diferido');
      }

      return result[0];
    } catch (error) {
      console.error('Error creating cuota diferido:', error);
      console.error('Query que falló:', `INSERT INTO cuotas_diferidos (instalacion_codigo, valor, saldo, fecha, cuota, por_interes, empresa) VALUES (...)`);
      throw new Error('Error al crear la cuota diferido');
    }
  }
}