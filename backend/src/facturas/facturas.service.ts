import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class FacturasService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  /**
   * Valida si hay consumos sin facturar para el mes y año especificados
   * @param mes - Mes (1-12)
   * @param year - Año
   * @param empresa - Código de empresa
   * @returns Cantidad de consumos sin facturar
   */
  async validarConsumosSinFacturar(mes: number, year: number, empresa: number): Promise<any> {
    // Validar parámetros
    if (!mes || mes < 1 || mes > 12) {
      throw new BadRequestException('El mes debe estar entre 1 y 12');
    }

    if (!year || year < 2020 || year > new Date().getFullYear() + 5) {
      throw new BadRequestException('Año inválido');
    }

    if (!empresa || empresa < 1) {
      throw new BadRequestException('El código de empresa es requerido y debe ser mayor a 0');
    }

    try {
      // Query con filtro por empresa
      const query = 'SELECT count(*) as total FROM consumo a WHERE lower(a.facturada) = $1 AND a.mes = $2 AND a.year = $3 AND a.empresa = $4';
      const params = ['no', mes, year, empresa];
      
      console.log('🔍 Query de validación:', query);
      console.log('📊 Parámetros:', params);
      
      // Ejecutar la consulta de validación
      const result = await this.dataSource.query(query, params);

      const total = parseInt(result[0].total, 10);

      return {
        mes,
        year,
        total_sin_facturar: total,
        tiene_datos: total > 0,
        mensaje: total > 0 
          ? `Se encontraron ${total} consumos sin facturar para ${this.getNombreMes(mes)} ${year}`
          : `Sin Datos Para Facturar en ${this.getNombreMes(mes)} ${year}`
      };

    } catch (error) {
      console.error('Error al validar consumos sin facturar:', error);
      throw new InternalServerErrorException('Error al validar consumos sin facturar');
    }
  }

  /**
   * Genera facturas llamando a la función public.func_generar_factura
   * @param mes - Mes (1-12)
   * @param year - Año
   * @param empresa - Código de empresa
   * @returns Resultado de la función
   */
  async generarFactura(mes: number, year: number, empresa: number): Promise<any> {
    // Validar parámetros
    if (!mes || mes < 1 || mes > 12) {
      throw new BadRequestException('El mes debe estar entre 1 y 12');
    }

    if (!year || year < 2020 || year > new Date().getFullYear() + 5) {
      throw new BadRequestException('Año inválido');
    }

    if (!empresa || empresa < 1) {
      throw new BadRequestException('El código de empresa es requerido y debe ser mayor a 0');
    }

    try {
      console.log('🏭 Generando factura para empresa:', empresa, 'mes:', mes, 'año:', year);
      
      // Llamar a la función de PostgreSQL con empresa
      const result = await this.dataSource.query(
        'SELECT public.func_generar_factura($1, $2, $3) as resultado',
        [mes, year, empresa]
      );

      if (!result || result.length === 0) {
        throw new InternalServerErrorException('No se obtuvo respuesta de la función de facturación');
      }

      return {
        mes,
        year,
        resultado: result[0].resultado,
        fecha_generacion: new Date(),
        mensaje: `Facturación generada para ${this.getNombreMes(mes)} ${year}`
      };

    } catch (error) {
      console.error('Error al generar factura:', error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Manejar errores específicos de PostgreSQL
      if (error.code) {
        switch (error.code) {
          case '42883': // función no existe
            throw new InternalServerErrorException('La función de facturación no está disponible en la base de datos');
          case '42P01': // tabla no existe
            throw new InternalServerErrorException('Tablas requeridas para facturación no encontradas');
          default:
            throw new InternalServerErrorException(`Error de base de datos: ${error.message}`);
        }
      }

      throw new InternalServerErrorException('Error interno al generar factura');
    }
  }

  /**
   * Obtiene el estado de la última facturación
   * @returns Estado de facturación
   */
  async getEstadoFacturacion(): Promise<any> {
    try {
      // Aquí puedes implementar una consulta para obtener el estado
      // Por ejemplo, consultar una tabla de log de facturaciones
      const result = await this.dataSource.query(`
        SELECT 
          'activo' as estado,
          NOW() as ultima_consulta,
          'Sistema de facturación operativo' as mensaje
      `);

      return result[0];
    } catch (error) {
      console.error('Error al obtener estado de facturación:', error);
      throw new InternalServerErrorException('Error al obtener el estado de facturación');
    }
  }

  /**
   * Obtiene el historial de facturaciones
   * @param limit - Límite de registros
   * @returns Historial de facturaciones
   */
  async getHistorialFacturacion(limit: number = 10): Promise<any[]> {
    try {
      // Implementar consulta al historial de facturaciones
      // Esta es una implementación de ejemplo
      const result = await this.dataSource.query(`
        SELECT 
          'Facturación' as tipo,
          NOW() - INTERVAL '1 day' * generate_series(0, $1-1) as fecha,
          'Completada' as estado,
          'Facturación mensual' as descripcion
        ORDER BY fecha DESC
        LIMIT $1
      `, [limit]);

      return result;
    } catch (error) {
      console.error('Error al obtener historial de facturación:', error);
      throw new InternalServerErrorException('Error al obtener el historial de facturación');
    }
  }

  /**
   * Obtiene el nombre del mes
   * @param mes - Número del mes (1-12)
   * @returns Nombre del mes
   */
  private getNombreMes(mes: number): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1] || 'Mes inválido';
  }
}