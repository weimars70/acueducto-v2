import { Module } from '@nestjs/common';
import { DynamicMaestrosController } from './dynamic-maestros.controller';
import { DynamicMaestrosService } from './dynamic-maestros.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DynamicMaestrosController],
  providers: [DynamicMaestrosService],
  exports: [DynamicMaestrosService],
})
export class DynamicMaestrosModule {}