import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { FacturasService } from './facturas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GenerarFacturaDto } from './dto/generar-factura.dto';

@Controller('facturas')
@UseGuards(JwtAuthGuard)
export class FacturasController {
  constructor(private readonly facturasService: FacturasService) {}

  @Post('validar')
  async validarConsumosSinFacturar(@Body() generarFacturaDto: GenerarFacturaDto) {
    try {
      const result = await this.facturasService.validarConsumosSinFacturar(
        generarFacturaDto.mes,
        generarFacturaDto.year,
        generarFacturaDto.empresa
      );

      return {
        success: true,
        data: result
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('generar')
  async generarFactura(@Body() generarFacturaDto: GenerarFacturaDto) {
    try {
      const result = await this.facturasService.generarFactura(
        generarFacturaDto.mes,
        generarFacturaDto.year,
        generarFacturaDto.empresa
      );

      return {
        success: true,
        message: 'Facturación generada exitosamente',
        data: result
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('estado')
  async getEstadoFacturacion() {
    try {
      const estado = await this.facturasService.getEstadoFacturacion();
      return {
        success: true,
        data: estado
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('historial')
  async getHistorialFacturacion(@Query('limit') limit: string = '10') {
    try {
      const historial = await this.facturasService.getHistorialFacturacion(
        parseInt(limit, 10)
      );
      return {
        success: true,
        data: historial
      };
    } catch (error) {
      throw error;
    }
  }
}