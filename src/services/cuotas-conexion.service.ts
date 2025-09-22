import { apiClient } from './api/client';
import { storageService } from './database/storage.service';

export interface CuotaConexion {
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

export interface CuotasConexionResponse {
  data: CuotaConexion[];
  total: number;
  page: number;
  limit: number;
}

export const cuotasConexionService = {
  async getCuotasConexion(
    page: number = 1, 
    limit: number = 1000, 
    filters: Record<string, any> = {},
    sortBy: string = 'fecha',
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): Promise<CuotasConexionResponse> {
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

      const { data } = await apiClient.get<CuotasConexionResponse>(`/view_cuotas_conexion?${params.toString()}`);
      return data;
    } catch (error) {
      console.error('Error fetching cuotas conexion:', error);
      
      // En caso de error de conexión, intentar obtener datos locales si están disponibles
      if (error.isConnectionError) {
        try {
          // Intentar obtener datos del almacenamiento local
          const localData = await storageService.getCuotasConexion();
          return {
            data: localData || [],
            total: localData?.length || 0,
            page: 1,
            limit: localData?.length || 0
          };
        } catch (localError) {
          console.warn('No local data available for cuotas conexion');
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

  async getCuotaById(codigo: number): Promise<CuotaConexion | null> {
    try {
      const { data } = await apiClient.get<CuotaConexion>(`/view_cuotas_conexion/${codigo}`);
      return data;
    } catch (error) {
      console.error('Error fetching cuota conexion by id:', error);
      
      if (error.isConnectionError) {
        try {
          const localData = await storageService.getCuotaConexionById(codigo);
          return localData;
        } catch (localError) {
          console.warn('No local data available for cuota conexion');
          return null;
        }
      }
      
      throw error;
    }
  },

  async searchCuotasConexion(filters: {
    codigo?: number;
    instalacion_codigo?: number;
    nombre?: string;
    fecha?: string;
    saldo?: number;
  }): Promise<CuotaConexion[]> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const { data } = await apiClient.get<CuotaConexion[]>(`/view_cuotas_conexion/search?${queryParams}`);
      return data;
    } catch (error) {
      console.error('Error searching cuotas conexion:', error);
      
      if (error.isConnectionError) {
        try {
          // Filtrar datos locales si están disponibles
          const localData = await storageService.getCuotasConexion();
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
          console.warn('No local data available for cuotas conexion search');
          return [];
        }
      }
      
      throw error;
    }
  },

  async create(cuotaData: Omit<CuotaConexion, 'codigo' | 'nombre'>): Promise<CuotaConexion> {
    try {
      const { data } = await apiClient.post<CuotaConexion>('/cuotas-conexion', cuotaData);
      return data;
    } catch (error) {
      console.error('Error creating cuota conexion:', error);
      throw error;
    }
  }
};