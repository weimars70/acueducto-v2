import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Param,
} from '@nestjs/common';
import { CuotasDiferidosService } from './cuotas-diferidos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('view_cuotas_diferidos')
export class CuotasDiferidosController {
  constructor(private readonly cuotasDiferidosService: CuotasDiferidosService) {}

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('sortBy') sortBy: string = 'fecha',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query() filters: Record<string, any>,
  ) {
    // Remover parámetros de paginación y ordenamiento de los filtros
    delete filters.page;
    delete filters.limit;
    delete filters.sortBy;
    delete filters.sortOrder;

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    return this.cuotasDiferidosService.findAll(pageNumber, pageSize, filters, sortBy, sortOrder);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.cuotasDiferidosService.findOne(parseInt(id, 10));
  }

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    return this.cuotasDiferidosService.search(query, pageNumber, pageSize);
  }
}

@Controller('cuotas-diferidos')
export class CuotasDiferidosCrudController {
  constructor(private readonly cuotasDiferidosService: CuotasDiferidosService) {}

  @Post()
  async create(@Body() createCuotaDto: any) {
    return this.cuotasDiferidosService.create(createCuotaDto);
  }
}