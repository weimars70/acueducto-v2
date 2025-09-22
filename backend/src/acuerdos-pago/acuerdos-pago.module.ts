import { Module } from '@nestjs/common';
import { AcuerdosPagoController } from './acuerdos-pago.controller';
import { AcuerdosPagoService } from './acuerdos-pago.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AcuerdosPagoController],
  providers: [AcuerdosPagoService],
  exports: [AcuerdosPagoService],
})
export class AcuerdosPagoModule {}