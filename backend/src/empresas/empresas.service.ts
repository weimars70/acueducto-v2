import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from '../entities/empresa.entity';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

@Injectable()
export class EmpresasService {
  constructor(
    @InjectRepository(Empresa)
    private empresaRepository: Repository<Empresa>,
  ) {}

  async create(createEmpresaDto: CreateEmpresaDto): Promise<Empresa> {
    const empresa = this.empresaRepository.create(createEmpresaDto);
    return await this.empresaRepository.save(empresa);
  }

  async findAll(): Promise<Empresa[]> {
    console.log('findAll');
    return await this.empresaRepository.find();
  }

  async findOne(codigo: number): Promise<Empresa> {
    const empresa = await this.empresaRepository.findOne({ where: { codigo } });
    if (!empresa) {
      throw new NotFoundException(`Empresa con código ${codigo} no encontrada`);
    }
    return empresa;
  }

  async update(codigo: number, updateEmpresaDto: UpdateEmpresaDto): Promise<Empresa> {
    const empresa = await this.findOne(codigo);
    Object.assign(empresa, updateEmpresaDto);
    return await this.empresaRepository.save(empresa);
  }

  async remove(codigo: number): Promise<void> {
    const empresa = await this.findOne(codigo);
    await this.empresaRepository.remove(empresa);
  }

  async findByCodigoAlterno(codigoAlterno: string): Promise<Empresa> {
    const empresa = await this.empresaRepository.findOne({ 
      where: { codigo_alterno: codigoAlterno } 
    });
    if (!empresa) {
      throw new NotFoundException(`Empresa con código alterno ${codigoAlterno} no encontrada`);
    }
    return empresa;
  }
}