import { Controller, Get, Param, Query, Headers } from '@nestjs/common';
import { AcuerdosPagoService, AcuerdoPago } from './acuerdos-pago.service';

@Controller('view_acuerdos_pago')
export class AcuerdosPagoController {
  constructor(private readonly acuerdosPagoService: AcuerdosPagoService) {}

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('sortBy') sortBy: string = 'codigo',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    @Query('codigo') codigo?: string,
    @Query('instalacion_codigo') instalacion_codigo?: string,
    @Query('nombre') nombre?: string,
    @Query('fecha_desde') fecha_desde?: string,
    @Query('fecha_hasta') fecha_hasta?: string,
    @Headers('empresa-codigo') empresaCodigo?: string
  ): Promise<{ data: AcuerdoPago[]; total: number; page: number; limit: number }> {
    const filters: any = {};
    
    if (codigo) filters.codigo = codigo;
    if (instalacion_codigo) filters.instalacion_codigo = instalacion_codigo;
    if (nombre) filters.nombre = nombre;
    if (fecha_desde) filters.fecha_desde = fecha_desde;
    if (fecha_hasta) filters.fecha_hasta = fecha_hasta;

    const result = await this.acuerdosPagoService.findAll(
      parseInt(page),
      parseInt(limit),
      sortBy,
      sortOrder,
      filters,
      empresaCodigo
    );

    return {
      ...result,
      page: parseInt(page),
      limit: parseInt(limit)
    };
  }

  @Get('search')
  async search(
    @Query('q') searchTerm: string,
    @Query('limit') limit: string = '10',
    @Headers('empresa-codigo') empresaCodigo?: string
  ): Promise<AcuerdoPago[]> {
    if (!searchTerm) {
      return [];
    }

    return this.acuerdosPagoService.search(
      searchTerm,
      empresaCodigo,
      parseInt(limit)
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Headers('empresa-codigo') empresaCodigo?: string
  ): Promise<AcuerdoPago | null> {
    return this.acuerdosPagoService.findOne(id, empresaCodigo);
  }
}