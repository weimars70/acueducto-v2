import { Module } from '@nestjs/common';
import { CapturaGenericaEmpController } from './captura-generica-emp.controller';
import { CapturaGenericaEmpService } from './captura-generica-emp.service';

@Module({
  controllers: [CapturaGenericaEmpController],
  providers: [CapturaGenericaEmpService],
  exports: [CapturaGenericaEmpService],
})
export class CapturaGenericaEmpModule {}