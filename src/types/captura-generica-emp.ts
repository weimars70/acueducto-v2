export interface CapturaGenericaEmp {
  codigo: number;
  nombre: string;
  empresa: number;
  tabla: string;
}

export interface CreateCapturaGenericaEmpDto {
  codigo?: number;
  nombre: string;
  codigo_empresa: number;
  tabla: string;
}

export interface UpdateCapturaGenericaEmpDto {
  codigo: number;
  nombre: string;
  codigo_empresa: number;
  tabla: string;
}