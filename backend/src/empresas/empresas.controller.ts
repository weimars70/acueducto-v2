import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('empresas')
@UseGuards(JwtAuthGuard)
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Post()
  async create(@Body() createEmpresaDto: CreateEmpresaDto) {
    return await this.empresasService.create(createEmpresaDto);
  }

  @Get()
  async findAll() {
    return await this.empresasService.findAll();
  }

  @Get(':codigo')
  async findOne(@Param('codigo', ParseIntPipe) codigo: number) {
    return await this.empresasService.findOne(codigo);
  }

  @Get('codigo/:codigoAlterno')
  async findByCodigoAlterno(@Param('codigoAlterno') codigoAlterno: string) {
    return await this.empresasService.findByCodigoAlterno(codigoAlterno);
  }

  @Put(':codigo')
  async update(
    @Param('codigo', ParseIntPipe) codigo: number,
    @Body() updateEmpresaDto: UpdateEmpresaDto,
  ) {
    return await this.empresasService.update(codigo, updateEmpresaDto);
  }

  @Delete(':codigo')
  async remove(@Param('codigo', ParseIntPipe) codigo: number) {
    await this.empresasService.remove(codigo);
    return { message: 'Empresa eliminada exitosamente' };
  }
}