import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuotasConexionController, CuotasConexionCrudController } from './cuotas-conexion.controller';
import { CuotasConexionService } from './cuotas-conexion.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [CuotasConexionController, CuotasConexionCrudController],
  providers: [CuotasConexionService],
  exports: [CuotasConexionService],
})
export class CuotasConexionModule {}