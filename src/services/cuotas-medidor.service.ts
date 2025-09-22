import { apiClient } from './api/client';
import { storageService } from './database/storage.service';

export interface CuotaMedidor {
  codigo: number;
  instalacion_codigo: number;
  nombre: string;
  fecha: string;
  saldo: number;
  cuota: number;
  por_interes: number;
}

export interface CuotasMedidorResponse {
  data: CuotaMedidor[];
  total: number;
  page: number;
  limit: number;
}

export const cuotasMedidorService = {
  async getCuotasMedidor(
    page: number = 1, 
    limit: number = 1000, 
    filters: Record<string, any> = {},
    sortBy: string = 'fecha',
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): Promise<CuotasMedidorResponse> {
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

      const { data } = await apiClient.get<CuotasMedidorResponse>(`/view_cuotas_medidor?${params.toString()}`);
      return data;
    } catch (error) {
      console.error('Error fetching cuotas medidor:', error);
      
      // En caso de error de conexión, intentar obtener datos locales si están disponibles
      try {
        const localData = await storageService.getCuotasMedidor();
        if (localData && localData.length > 0) {
          console.log('Usando datos locales de cuotas medidor');
          
          // Aplicar filtros localmente si es necesario
          let filteredData = localData;
          
          if (filters.codigo) {
            filteredData = filteredData.filter(item => item.codigo === parseInt(filters.codigo));
          }
          
          if (filters.instalacion_codigo) {
            filteredData = filteredData.filter(item => 
              item.instalacion_codigo.toString().includes(filters.instalacion_codigo.toString())
            );
          }
          
          if (filters.nombre) {
            filteredData = filteredData.filter(item => 
              item.nombre.toLowerCase().includes(filters.nombre.toLowerCase())
            );
          }
          
          return {
            data: filteredData.slice((page - 1) * limit, page * limit),
            total: filteredData.length,
            page,
            limit
          };
        }
      } catch (localError) {
        console.error('Error accessing local cuotas medidor data:', localError);
      }
      
      throw error;
    }
  },

  async getCuotaById(codigo: number): Promise<CuotaMedidor | null> {
    try {
      const { data } = await apiClient.get<CuotaMedidor>(`/view_cuotas_medidor/${codigo}`);
      return data;
    } catch (error) {
      console.error('Error fetching cuota medidor by ID:', error);
      
      // Intentar obtener de datos locales
      try {
        const localData = await storageService.getCuotasMedidor();
        const cuota = localData?.find(item => item.codigo === codigo);
        return cuota || null;
      } catch (localError) {
        console.error('Error accessing local cuota medidor data:', localError);
        return null;
      }
    }
  },

  async searchCuotasMedidor(filters: {
    codigo?: number;
    instalacion_codigo?: number;
    nombre?: string;
    fecha?: string;
    saldo?: number;
  }): Promise<CuotaMedidor[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters.codigo) params.append('codigo', filters.codigo.toString());
      if (filters.instalacion_codigo) params.append('instalacion_codigo', filters.instalacion_codigo.toString());
      if (filters.nombre) params.append('nombre', filters.nombre);
      if (filters.fecha) params.append('fecha', filters.fecha);
      if (filters.saldo) params.append('saldo', filters.saldo.toString());

      const { data } = await apiClient.get<CuotasMedidorResponse>(`/view_cuotas_medidor?${params.toString()}`);
      return data.data;
    } catch (error) {
      console.error('Error searching cuotas medidor:', error);
      
      // Fallback a datos locales
      try {
        const localData = await storageService.getCuotasMedidor();
        if (!localData) return [];
        
        return localData.filter(item => {
          if (filters.codigo && item.codigo !== filters.codigo) return false;
          if (filters.instalacion_codigo && item.instalacion_codigo !== filters.instalacion_codigo) return false;
          if (filters.nombre && !item.nombre.toLowerCase().includes(filters.nombre.toLowerCase())) return false;
          if (filters.fecha && item.fecha !== filters.fecha) return false;
          if (filters.saldo && item.saldo !== filters.saldo) return false;
          return true;
        });
      } catch (localError) {
        console.error('Error accessing local cuotas medidor data:', localError);
        return [];
      }
    }
  },

  async syncCuotasMedidor(): Promise<void> {
    try {
      const response = await this.getCuotasMedidor(1, 10000); // Obtener todos los registros
      await storageService.saveCuotasMedidor(response.data);
      console.log('Cuotas medidor sincronizadas correctamente');
    } catch (error) {
      console.error('Error syncing cuotas medidor:', error);
      throw error;
    }
  },

  async create(cuotaData: Omit<CuotaMedidor, 'codigo' | 'nombre'>): Promise<CuotaMedidor> {
    try {
      const { data } = await apiClient.post<CuotaMedidor>('/cuotas-medidor', cuotaData);
      return data;
    } catch (error) {
      console.error('Error creating cuota medidor:', error);
      throw error;
    }
  }
};