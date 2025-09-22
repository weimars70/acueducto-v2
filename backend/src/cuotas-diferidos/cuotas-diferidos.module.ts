import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuotasDiferidosController, CuotasDiferidosCrudController } from './cuotas-diferidos.controller';
import { CuotasDiferidosService } from './cuotas-diferidos.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [CuotasDiferidosController, CuotasDiferidosCrudController],
  providers: [CuotasDiferidosService],
  exports: [CuotasDiferidosService],
})
export class CuotasDiferidosModule {}