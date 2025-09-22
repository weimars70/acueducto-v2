import { apiClient } from './client';
import type { Empresa, CreateEmpresaDto, UpdateEmpresaDto } from '../../types/empresa';

export const empresaService = {
  async getEmpresas(): Promise<Empresa[]> {
    try {
      const { data } = await apiClient.get<Empresa[]>('/empresas');
      return data;
    } catch (error) {
      console.error('Error al obtener empresas:', error);
      throw error;
    }
  },

  async getByCodigo(codigo: number): Promise<Empresa> {
    try {
      const { data } = await apiClient.get<Empresa>(`/empresas/${codigo}`);
      return data;
    } catch (error) {
      console.error(`Error al obtener empresa con código ${codigo}:`, error);
      throw error;
    }
  },

  async getByCodigoAlterno(codigoAlterno: string): Promise<Empresa> {
    try {
      const { data } = await apiClient.get<Empresa>(`/empresas/codigo/${codigoAlterno}`);
      return data;
    } catch (error) {
      console.error(`Error al obtener empresa con código ${codigoAlterno}:`, error);
      throw error;
    }
  },

  async create(empresa: CreateEmpresaDto): Promise<Empresa> {
    try {
      const { data } = await apiClient.post<Empresa>('/empresas', empresa);
      return data;
    } catch (error) {
      console.error('Error al crear empresa:', error);
      throw error;
    }
  },

  async update(codigo: number, empresa: UpdateEmpresaDto): Promise<Empresa> {
    try {
      const { data } = await apiClient.put<Empresa>(`/empresas/${codigo}`, empresa);
      return data;
    } catch (error) {
      console.error(`Error al actualizar empresa con código ${codigo}:`, error);
      throw error;
    }
  },

  async delete(codigo: number): Promise<void> {
    try {
      await apiClient.delete(`/empresas/${codigo}`);
    } catch (error) {
      console.error(`Error al eliminar empresa con código ${codigo}:`, error);
      throw error;
    }
  }
};