import { apiClient } from './api/client';

export interface GenerarFacturaResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface ValidarConsumoResponse {
  success: boolean;
  data: {
    mes: number;
    year: number;
    total_sin_facturar: number;
    tiene_datos: boolean;
    mensaje: string;
  };
}

class FacturasService {
  private readonly baseUrl = '/facturas';

  /**
   * Valida si hay consumos sin facturar para un mes y año específicos
   * @param mes - Mes (1-12)
   * @param year - Año
   * @param empresa - Código de empresa
   * @returns Promise con la información de validación
   */
  async validarConsumosSinFacturar(mes: number, year: number, empresa: number): Promise<ValidarConsumoResponse> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/validar`, {
        mes,
        year,
        empresa
      });

      return response.data;
    } catch (error: any) {
      console.error('Error al validar consumos sin facturar:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Error al validar consumos sin facturar';

      throw new Error(errorMessage);
    }
  }

  /**
   * Genera facturas para un mes y año específicos
   * Llama a la función public.func_generar_factura(i_mes, i_year)
   * @param mes - Mes (1-12)
   * @param year - Año
   * @param empresa - Código de empresa
   * @returns Promise con la respuesta del servidor
   */
  async generarFactura(mes: number, year: number, empresa: number): Promise<GenerarFacturaResponse> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/generar`, {
        mes,
        year,
        empresa
      });

      return {
        success: true,
        message: response.data.message || 'Facturación generada exitosamente',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error al generar factura:', error);
      
      // Extraer mensaje de error del servidor si está disponible
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Error al generar la factura';

      throw new Error(errorMessage);
    }
  }

  /**
   * Obtiene el estado de la última facturación
   * @returns Promise con información del estado
   */
  async getEstadoFacturacion(): Promise<any> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/estado`);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener estado de facturación:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener el estado de facturación');
    }
  }

  /**
   * Obtiene el historial de facturaciones
   * @param limit - Límite de registros
   * @returns Promise con el historial
   */
  async getHistorialFacturacion(limit: number = 10): Promise<any[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/historial`, {
        params: { limit }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener historial de facturación:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener el historial de facturación');
    }
  }
}

export const facturasService = new FacturasService();