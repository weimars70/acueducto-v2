import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConsumoModule } from './consumo/consumo.module';
import { InstalacionesModule } from './instalaciones/instalaciones.module';
import { DatabaseModule } from './database/database.module';
import { PdfModule } from './pdf/pdf.module';
import { GenericCaptureModule } from './generic-capture/generic-capture.module';
import { EmpresasModule } from './empresas/empresas.module';
import { CapturaGenericaEmpModule } from './captura-generica-emp/captura-generica-emp.module';
import { DynamicMaestrosModule } from './dynamic-maestros/dynamic-maestros.module';
import { CuotasConexionModule } from './cuotas-conexion/cuotas-conexion.module';
import { CuotasMedidorModule } from './cuotas-medidor/cuotas-medidor.module';
import { CuotasDiferidosModule } from './cuotas-diferidos/cuotas-diferidos.module';
import { AcuerdosPagoModule } from './acuerdos-pago/acuerdos-pago.module';
import { FacturasModule } from './facturas/facturas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ConsumoModule,
    InstalacionesModule,
    PdfModule,
    GenericCaptureModule,
    EmpresasModule,
    CapturaGenericaEmpModule,
    DynamicMaestrosModule,
    CuotasConexionModule,
    CuotasMedidorModule,
    CuotasDiferidosModule,
    AcuerdosPagoModule,
    FacturasModule,
  ],
})
export class AppModule {}