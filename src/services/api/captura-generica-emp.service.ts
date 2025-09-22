import { apiClient } from './client';
import type { CreateCapturaGenericaEmpDto, UpdateCapturaGenericaEmpDto } from '../../types/captura-generica-emp';

export const capturaGenericaEmpService = {
  async createOrUpdate(data: CreateCapturaGenericaEmpDto | UpdateCapturaGenericaEmpDto) {
    try {
      const response = await apiClient.post('/captura-generica-emp', data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error en createOrUpdate:', error);
      throw new Error(error.response?.data?.message || 'Error al guardar el registro');
    }
  },

  async getAll(tabla: string, codigo_empresa: number) {
    try {
      const response = await apiClient.get('/captura-generica-emp', {
        params: { tabla, codigo_empresa }
      });
      // El backend devuelve { success: true, data: array }
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error en getAll:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener los registros');
    }
  },

  async getByCodigo(codigo: number, codigo_empresa: number) {
    try {
      const response = await apiClient.get(`/captura-generica-emp/${codigo}`, {
        params: { codigo_empresa }
      });
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error en getByCodigo:', error);
      throw new Error(error.response?.data?.message || `Error al obtener el registro con código ${codigo}`);
    }
  },

  async delete(codigo: number, codigo_empresa: number) {
    try {
      const response = await apiClient.delete(`/captura-generica-emp/${codigo}`, {
        params: { codigo_empresa }
      });
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error en delete:', error);
      throw new Error(error.response?.data?.message || `Error al eliminar el registro con código ${codigo}`);
    }
  }
};