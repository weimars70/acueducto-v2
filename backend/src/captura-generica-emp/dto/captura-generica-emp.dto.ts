import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CapturaGenericaEmpDto {
  @IsOptional()
  @IsNumber()
  codigo?: number;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsNumber()
  codigo_empresa: number;

  @IsString()
  @IsNotEmpty()
  tabla: string;
}