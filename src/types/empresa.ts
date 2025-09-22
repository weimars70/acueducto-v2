export interface Empresa {
  codigo: number;
  codigo_alterno: string;
  nombre: string;
  direccion: string;
  ident: string;
  telefono: string;
}

export interface CreateEmpresaDto {
  codigo_alterno: string;
  nombre: string;
  direccion: string;
  ident: string;
  telefono: string;
}

export interface UpdateEmpresaDto {
  codigo_alterno?: string;
  nombre?: string;
  direccion?: string;
  ident?: string;
  telefono?: string;
}