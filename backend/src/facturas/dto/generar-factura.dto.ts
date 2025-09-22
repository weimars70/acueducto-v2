import { IsInt, Min, Max, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class GenerarFacturaDto {
  @IsNotEmpty({ message: 'El mes es requerido' })
  @Type(() => Number)
  @IsInt({ message: 'El mes debe ser un número entero' })
  @Min(1, { message: 'El mes debe ser mayor a 0' })
  @Max(12, { message: 'El mes debe ser menor o igual a 12' })
  mes: number;

  @IsNotEmpty({ message: 'El año es requerido' })
  @Type(() => Number)
  @IsInt({ message: 'El año debe ser un número entero' })
  @Min(2020, { message: 'El año debe ser mayor o igual a 2020' })
  @Max(new Date().getFullYear() + 5, { message: 'El año no puede ser muy futuro' })
  year: number;

  @IsNotEmpty({ message: 'El código de empresa es requerido' })
  @Type(() => Number)
  @IsInt({ message: 'El código de empresa debe ser un número entero' })
  @Min(1, { message: 'El código de empresa debe ser mayor a 0' })
  empresa: number;
}