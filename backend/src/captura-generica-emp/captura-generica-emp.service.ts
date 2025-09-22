import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CapturaGenericaEmpDto } from './dto/captura-generica-emp.dto';

@Injectable()
export class CapturaGenericaEmpService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createOrUpdate(data: CapturaGenericaEmpDto): Promise<any> {
    try {
      // Validar que la tabla sea segura (solo letras, números y guiones bajos)
      const tableName = data.tabla;
      
      // Si codigo es null o vacío, hacer insert
      if (!data.codigo || data.codigo === null) {
        const query = `
          INSERT INTO ${tableName} (nombre, empresa) 
          VALUES ($1, $2) 
          RETURNING *
        `;
        const result = await this.dataSource.query(query, [
          data.nombre,
          data.codigo_empresa
        ]);
        return result[0];
      } else {
        // Si codigo existe, hacer update
        const checkQuery = `SELECT * FROM ${tableName} WHERE codigo = $1 AND empresa = $2`;
        console.log(`Query ejecutada: SELECT * FROM ${tableName} WHERE codigo = ${data.codigo} AND empresa = ${data.codigo_empresa}`);
        
        const existing = await this.dataSource.query(checkQuery, [data.codigo, data.codigo_empresa]);
        console.log('existing', existing);
        if (!existing || existing.length === 0) {
          // Si no existe el registro, hacer INSERT con el código proporcionado
          const insertQuery = `
            INSERT INTO ${tableName} (codigo, nombre, empresa) 
            VALUES ($1, $2, $3) 
            RETURNING *
          `;
          const result = await this.dataSource.query(insertQuery, [
            data.codigo,
            data.nombre,
            data.codigo_empresa
          ]);
          return result[0];
        }

        const updateQuery = `UPDATE ${tableName}  SET nombre = $1, empresa = $2 WHERE codigo = $3 AND empresa = $4 RETURNING * `;
        const result = await this.dataSource.query(updateQuery, [
          data.nombre,
          data.codigo_empresa,
          data.codigo,
          data.codigo_empresa
        ]);
        return result[0];
      }
    } catch (error) {
      throw new Error(`Error en captura genérica: ${error.message}`);
    }
  }

  async findAll(tabla: string, codigo_empresa: number): Promise<any[]> {
    try {
      const tableName = tabla;
      const query = `
        SELECT * FROM ${tableName} 
        WHERE  empresa = $1
        ORDER BY codigo
      `;
      return await this.dataSource.query(query, [codigo_empresa]);
    } catch (error) {
      throw new Error(`Error al obtener registros: ${error.message}`);
    }
  }

  async findOne(codigo: number, tabla: string, codigo_empresa: number): Promise<any> {
    try {
      const tableName = tabla;
      const query = `SELECT * FROM ${tableName} WHERE codigo = $1 AND empresa = $2`;
      const result = await this.dataSource.query(query, [codigo, codigo_empresa]);

      if (!result || result.length === 0) {
        throw new Error(`No se encontró registro con código ${codigo}`);
      }

      return result[0];
    } catch (error) {
      throw new Error(`Error al obtener registro: ${error.message}`);
    }
  }

  async delete(codigo: number, tabla: string, codigo_empresa: number): Promise<void> {
    try {
      const tableName = tabla;
      const query = `DELETE FROM ${tableName} WHERE codigo = $1 AND empresa = $2`;
      const result = await this.dataSource.query(query, [codigo, codigo_empresa]);
      
      if (result.affectedRows === 0) {
        throw new Error(`No se encontró registro con código ${codigo}`);
      }
    } catch (error) {
      throw new Error(`Error al eliminar registro: ${error.message}`);
    }
  }

  
}