import { apiClient } from './api/client';
import type { PaginatedResponse } from '../types/api';

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

export interface AcuerdosPagoFilters {
  codigo?: string;
  instalacion_codigo?: string;
  nombre?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface AcuerdosPagoParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  filters?: AcuerdosPagoFilters;
}

class AcuerdosPagoService {
  private readonly baseUrl = '/view_acuerdos_pago';

  async getAll(params: AcuerdosPagoParams = {}): Promise<PaginatedResponse<AcuerdoPago>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'codigo',
      sortOrder = 'ASC',
      filters = {}
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
      ...filters
    });

    const response = await apiClient.get(`${this.baseUrl}?${queryParams}`);
    return response.data;
  }

  async getById(id: string): Promise<AcuerdoPago> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async search(searchTerm: string, limit: number = 10): Promise<AcuerdoPago[]> {
    const response = await apiClient.get(`${this.baseUrl}/search`, {
      params: {
        q: searchTerm,
        limit
      }
    });
    return response.data;
  }
}

export const acuerdosPagoService = new AcuerdosPagoService();