import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CapturaGenericaEmpService } from './captura-generica-emp.service';
import { CapturaGenericaEmpDto } from './dto/captura-generica-emp.dto';

@Controller('captura-generica-emp')
@UseGuards(JwtAuthGuard)
export class CapturaGenericaEmpController {
  constructor(private readonly capturaGenericaEmpService: CapturaGenericaEmpService) {}

  @Post()
  async createOrUpdate(@Body() data: CapturaGenericaEmpDto) {
    try {
      const result = await this.capturaGenericaEmpService.createOrUpdate(data);
      return {
        success: true,
        data: result,
        message: data.codigo ? 'Registro actualizado exitosamente' : 'Registro creado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  @Get()
  async findAll(@Query('tabla') tabla: string, @Query('codigo_empresa') codigo_empresa: number) {
    try {
      const result = await this.capturaGenericaEmpService.findAll(tabla, codigo_empresa);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  @Get(':codigo')
  async findOne(@Param('codigo') codigo: number, @Query('tabla') tabla: string, @Query('codigo_empresa') codigo_empresa: number) {
    try {
      if (!tabla) {
        return {
          success: false,
          message: 'El parámetro tabla es requerido'
        };
      }
      if (!codigo_empresa) {
        return {
          success: false,
          message: 'El parámetro codigo_empresa es requerido'
        };
      }
      const result = await this.capturaGenericaEmpService.findOne(codigo, tabla, codigo_empresa);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  @Delete(':codigo')
  async delete(@Param('codigo') codigo: number, @Query('tabla') tabla: string, @Query('codigo_empresa') codigo_empresa: number) {
    try {
      if (!tabla) {
        return {
          success: false,
          message: 'El parámetro tabla es requerido'
        };
      }
      if (!codigo_empresa) {
        return {
          success: false,
          message: 'El parámetro codigo_empresa es requerido'
        };
      }
      await this.capturaGenericaEmpService.delete(codigo, tabla, codigo_empresa);
      return {
        success: true,
        message: 'Registro eliminado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}