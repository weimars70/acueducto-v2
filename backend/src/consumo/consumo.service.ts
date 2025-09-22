import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { Consumption } from '../entities/consumption.entity';
import { CreateConsumoDto } from './dto/create-consumo.dto';
import { Observable, fromEvent } from 'rxjs';
import { EventEmitter } from 'events';

@Injectable()
export class ConsumoService implements OnModuleInit {
  private eventEmitter: EventEmitter;

  constructor(
    @InjectRepository(Consumption)
    private readonly consumoRepository: Repository<Consumption>,
    private connection: Connection,
  ) {
    this.eventEmitter = new EventEmitter();
  }

  async onModuleInit() {
    try {
      const queryRunner = this.connection.createQueryRunner();
      await queryRunner.connect();

      await queryRunner.query('LISTEN consumo_channel');

      const client = queryRunner.stream as any;
      if (client && client.connection) {
        client.connection.on(
          'notification',
          (msg: { channel: string; payload?: string }) => {
            if (msg.channel === 'consumo_channel') {
              this.eventEmitter.emit('consumption_update', {
                type: 'consumo_update',
                data: msg.payload ? JSON.parse(msg.payload) : {},
              });
            }
          },
        );
      }
    } catch (error) {
      console.error('Error setting up PostgreSQL notifications:', error);
    }
  }

  async findOne(id: number) {
    console.log('id::::', id);
    try {
      if (isNaN(id) || !Number.isInteger(id)) {
        throw new Error('El ID debe ser un número entero válido');
      }

      console.log('Query findOne:', 'SELECT * FROM consumo WHERE codigo = $1');
      console.log('Parámetros findOne:', { id });

      const consumption = await this.consumoRepository
        .createQueryBuilder('consumo')
        .where('consumo.codigo = :id', { id })
        .getOne();

      if (!consumption) {
        throw new Error(`Consumo con ID ${id} no encontrado`);
      }

      return consumption;
    } catch (error) {
      throw new Error(`Error al obtener consumo: ${error.message}`);
    }
  }

  async getPreviousReading(instalacion: number, codigo: number) {
    try {
      console.log('Query getPreviousReading:', 'SELECT * FROM get_previous_reading($1)');
      console.log('Parámetros getPreviousReading:', { instalacion, codigo });

      const result = await this.consumoRepository.query(
        `SELECT * FROM get_previous_reading($1)`,
        [instalacion],
      );

      if (!result || result.length === 0) {
        return {
          lectura_anterior: 0,
          promedio: 0,
        };
      }

      return result[0];
    } catch (error) {
      throw new Error(`Error al obtener lectura anterior: ${error.message}`);
    }
  }

  async getBasicInfo(id: number) {
    try {
      console.log('Query getBasicInfo:', 'SELECT mes_codigo, year, instalacion, nombre as cliente, sector, direccion, lectura as lectura_actual FROM consumo WHERE codigo = $1');
      console.log('Parámetros getBasicInfo:', { id });

      const result = await this.consumoRepository
        .createQueryBuilder('consumo')
        .select([
          'consumo.mes_codigo',
          'consumo.year',
          'consumo.instalacion',
          'consumo.nombre as cliente',
          'consumo.sector as sector',
          'consumo.direccion',
          'consumo.lectura as lectura_actual',
        ])
        .where('consumo.codigo = :id', { id })
        .getRawOne();

      if (!result) {
        throw new Error(`Consumo con ID ${id} no encontrado`);
      }

      return result;
    } catch (error) {
      throw new Error(`Error al obtener información básica: ${error.message}`);
    }
  }

  async findAll(page: number, limit: number, filters: Record<string, any>) {
    try {
      let query = `
        SELECT 
          codigo,
          instalacion,
          nombre,
          lectura,
          fecha,
          mes,
          year,
          mes_codigo,
          consumo,
          consumo_facturar,
          medidor,
          otros_cobros,
          reconexion,
          facturado
        FROM public.view_consumo
        WHERE 1=1
      `;

      const queryParams: any[] = [];
      let paramCount = 1;

      if (filters.nombre) {
        query += ` AND nombre ILIKE $${paramCount}`;
        queryParams.push(`%${filters.nombre}%`);
        paramCount++;
      }

      if (filters.year) {
        query += ` AND year = $${paramCount}`;
        queryParams.push(filters.year);
        paramCount++;
      }

      if (filters.mes_codigo) {
        query += ` AND mes_codigo = $${paramCount}`;
        queryParams.push(filters.mes_codigo);
        paramCount++;
      }

      if (filters.instalacion) {
        query += ` AND instalacion = $${paramCount}`;
        queryParams.push(filters.instalacion);
        paramCount++;
      }

      if (filters.empresa) {
        query += ` AND empresa = $${paramCount}`;
        queryParams.push(filters.empresa);
        paramCount++;
      }

      // Obtener el total de registros
      const countQuery = `SELECT COUNT(*) FROM (${query}) as count_query`;
      //console.log('Query findAll (count):', countQuery);
      //console.log('Parámetros findAll (count):', queryParams);

      const totalResult = await this.consumoRepository.query(
        countQuery,
        queryParams,
      );
      const total = parseInt(totalResult[0].count);

      // Agregar paginación
      query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      queryParams.push(limit, (page - 1) * limit);

      //console.log('Query findAll (data):', query);
      //console.log('Parámetros findAll (data):', queryParams);

      const data = await this.consumoRepository.query(query, queryParams);

      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new Error(`Error al obtener consumos: ${error.message}`);
    }
  }

  async getLecturasMes(month: number, year: number) {
    try {
      const query = ` SELECT a.codigo as Instalacion,a.nombre,c.nombre as sector,B.lectura, CASE WHEN B.lectura IS NULL THEN 'NO' ELSE 'SI' END AS REGISTRADA
          FROM instalaciones a
          JOIN SECTOR C ON C.CODIGO=a.sector_codigo
          LEFT JOIN CONSUMO B ON A.codigo=B.instalacion AND B.MES=$1 AND B.year=$2 order by a.codigo`;
      
      console.log('Query getLecturasMes:', query);
      console.log('Parámetros getLecturasMes:', { month, year });

      const result = await this.consumoRepository.query(
        query,
        [month, year],
      );
      return result;
    } catch (error) {
      throw new Error(`Error al obtener lectura anterior: ${error.message}`);
    }
  }

  async validarLecturaExistente(instalacion: number, mes: number, year: number) {
    try {
      const query = `
        SELECT COUNT(*) AS total 
        FROM consumo a 
        WHERE a.instalacion = $1 
          AND a.mes = $2 
          AND a.year = $3
      `;
      
      console.log('Query validarLecturaExistente:', query);
      console.log('Parámetros validarLecturaExistente:', { instalacion, mes, year });

      const result = await this.consumoRepository.query(query, [instalacion, mes, year]);
      const total = parseInt(result[0].total);
      
      return {
        existe: total > 0,
        total: total,
        instalacion: instalacion,
        mes: mes,
        year: year
      };
    } catch (error) {
      throw new Error(`Error al validar lectura existente: ${error.message}`);
    }
  }

  async getLastReadings(year: number, month: number) {
    console.log('year::', year);
    try {
      const query = `SELECT * FROM consumo where year=$1 and mes=$2`;
      console.log('Query getLastReadings:', query);
      console.log('Parámetros getLastReadings:', { year, month });

      const result = await this.consumoRepository.query(
        query,
        [year, month],
      );

      const latestReadings = new Map();
      result.forEach((reading) => {
        if (!latestReadings.has(reading.instalacion)) {
          latestReadings.set(reading.instalacion, reading);
        }
      });

      return Array.from(latestReadings.values()).sort(
        (a, b) => a.instalacion - b.instalacion,
      );
    } catch (error) {
      throw new Error(`Error al obtener últimas lecturas: ${error.message}`);
    }
  }

  async create(createConsumoDto: any) {
    console.log('createConsumoDto:::', createConsumoDto);
    try {
      const consumptionData = {
        instalacion: createConsumoDto.instalacion,
        lectura: createConsumoDto.lectura,
        fecha: createConsumoDto.fecha,
        consumo: createConsumoDto.consumo,
        consumo_facturar: createConsumoDto.consumo_facturar,
        mes: createConsumoDto.mes,
        year: createConsumoDto.year,
        medidor: createConsumoDto.medidor,
        otrosCobros: createConsumoDto.otrosCobros,
        reconexion: createConsumoDto.reconexion,
        usuario: createConsumoDto.usuario,
        empresa: createConsumoDto.empresa,
      };

      const consumption = this.consumoRepository.create(consumptionData);
      return await this.consumoRepository.save(consumption);
    } catch (error) {
      throw new Error(`Error al crear consumo: ${error.message}`);
    }
  }

  async update(id: number, updateConsumoDto: CreateConsumoDto) {
    try {
      console.log('Query update (findOne):', 'SELECT * FROM consumo WHERE codigo = $1');
      console.log('Parámetros update (findOne):', { id });

      const consumption = await this.consumoRepository.findOne({
        where: { codigo: id },
      });

      if (!consumption) {
        throw new Error(`Consumo con ID ${id} no encontrado`);
      }

      const consumptionData = {
        instalacion: updateConsumoDto.instalacion,
        lectura: updateConsumoDto.lectura,
        fecha: updateConsumoDto.fecha,
        consumo: updateConsumoDto.consumo,
        consumo_facturar: updateConsumoDto.consumo_facturar,
        mes: updateConsumoDto.mes,
        year: updateConsumoDto.year,
        medidor: updateConsumoDto.medidor,
        otrosCobros: updateConsumoDto.otrosCobros,
        reconexion: updateConsumoDto.reconexion,
        usuario: updateConsumoDto.usuario,
        empresa: updateConsumoDto.empresa,
      };

      console.log('Query update (save):', 'UPDATE consumo SET ... WHERE codigo = $1');
      console.log('Datos a actualizar:', consumptionData);

      Object.assign(consumption, consumptionData);
      return await this.consumoRepository.save(consumption);
    } catch (error) {
      throw new Error(`Error al actualizar consumo: ${error.message}`);
    }
  }

  getConsumptionEvents(): Observable<any> {
    return fromEvent(this.eventEmitter, 'consumption_update');
  }
}
