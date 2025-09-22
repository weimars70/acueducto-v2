import { Module } from '@nestjs/common';
import { CuotasMedidorController, CuotasMedidorCrudController } from './cuotas-medidor.controller';
import { CuotasMedidorService } from './cuotas-medidor.service';

@Module({
  controllers: [CuotasMedidorController, CuotasMedidorCrudController],
  providers: [CuotasMedidorService],
  exports: [CuotasMedidorService],
})
export class CuotasMedidorModule {}