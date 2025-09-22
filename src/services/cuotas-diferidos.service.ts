import { apiClient } from './api/client';
import { storageService } from './database/storage.service';

export interface CuotaDiferido {
  codigo: number;
  instalacion_codigo: number;
  nombre: string;
  fecha: string;
  valor: number;
  saldo: number;
  cuota: number;
  por_interes: number;
  empresa: number;
}

export interface CuotasDiferidosResponse {
  data: CuotaDiferido[];
  total: number;
  page: number;
  limit: number;
}

export const cuotasDiferidosService = {
  async getCuotasDiferidos(
    page: number = 1, 
    limit: number = 1000, 
    filters: Record<string, any> = {},
    sortBy: string = 'fecha',
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): Promise<CuotasDiferidosResponse> {
    try {
      // Construir parámetros de consulta
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: sortBy,
        sortOrder: sortOrder
      });

      // Agregar filtros a los parámetros
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
          params.append(key, filters[key].toString());
        }
      });

      const { data } = await apiClient.get<CuotasDiferidosResponse>(`/view_cuotas_diferidos?${params.toString()}`);
      return data;
    } catch (error) {
      console.error('Error fetching cuotas diferidos:', error);
      
      // En caso de error de conexión, intentar obtener datos locales si están disponibles
      if (error.isConnectionError) {
        try {
          // Intentar obtener datos del almacenamiento local
          const localData = await storageService.getCuotasDiferidos();
          return {
            data: localData || [],
            total: localData?.length || 0,
            page: 1,
            limit: localData?.length || 0
          };
        } catch (localError) {
          console.warn('No local data available for cuotas diferidos');
          return {
            data: [],
            total: 0,
            page: 1,
            limit: 0
          };
        }
      }
      
      throw error;
    }
  },

  async getCuotaDiferido(id: number): Promise<CuotaDiferido> {
    try {
      const { data } = await apiClient.get<CuotaDiferido>(`/view_cuotas_diferidos/${id}`);
      return data;
    } catch (error) {
      console.error('Error fetching cuota diferido:', error);
      throw error;
    }
  },

  async create(cuotaData: {
    instalacion_codigo: number;
    fecha: string;
    valor: number;
    por_interes: number;
    cuota: number;
    saldo: number;
    empresa: number;
  }): Promise<CuotaDiferido> {
    try {
      const { data } = await apiClient.post<CuotaDiferido>('/cuotas-diferidos', cuotaData);
      return data;
    } catch (error) {
      console.error('Error creating cuota diferido:', error);
      throw error;
    }
  },

  async searchCuotasDiferidos(filters: {
    codigo?: number;
    instalacion_codigo?: number;
    nombre?: string;
    fecha?: string;
    saldo?: number;
  }): Promise<CuotaDiferido[]> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const { data } = await apiClient.get<CuotaDiferido[]>(`/view_cuotas_diferidos/search?${queryParams}`);
      return data;
    } catch (error) {
      console.error('Error searching cuotas diferidos:', error);
      
      if (error.isConnectionError) {
        try {
          // Filtrar datos locales si están disponibles
          const localData = await storageService.getCuotasDiferidos();
          if (!localData) return [];
          
          return localData.filter(cuota => {
            if (filters.codigo && cuota.codigo !== filters.codigo) {
              return false;
            }
            if (filters.instalacion_codigo && cuota.instalacion_codigo !== filters.instalacion_codigo) {
              return false;
            }
            if (filters.nombre && !cuota.nombre.toLowerCase().includes(filters.nombre.toLowerCase())) {
              return false;
            }
            if (filters.fecha && !cuota.fecha.includes(filters.fecha)) {
              return false;
            }
            if (filters.saldo && cuota.saldo !== filters.saldo) {
              return false;
            }
            return true;
          });
        } catch (localError) {
          console.warn('No local data available for search');
          return [];
        }
      }
      
      throw error;
    }
  }
};