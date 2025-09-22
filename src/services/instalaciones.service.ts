import { apiClient } from './api/client';

export interface Instalacion {
  codigo: string;
  nombre: string;
}

export interface InstalacionesResponse {
  data: Instalacion[];
  total: number;
}

class InstalacionesService {
  async getByEmpresa(empresaCodigo: string): Promise<Instalacion[]> {
    try {
      const response = await apiClient.get<Instalacion[]>('/instalaciones/by-empresa', {
        params: {
          empresa: empresaCodigo
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener instalaciones:', error);
      throw new Error('Error al cargar las instalaciones');
    }
  }

  async search(searchTerm: string, empresaCodigo: string): Promise<Instalacion[]> {
    try {
      const response = await apiClient.get<Instalacion[]>('/instalaciones/search', {
        params: {
          q: searchTerm,
          empresa: empresaCodigo
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al buscar instalaciones:', error);
      throw new Error('Error al buscar instalaciones');
    }
  }
}

export const instalacionesService = new InstalacionesService();