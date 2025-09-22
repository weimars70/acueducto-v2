import Dexie from 'dexie';
import type { Installation } from '../../types/installation';
import type { Consumption } from '../../types/consumption';
import type { CuotaMedidor } from '../cuotas-medidor.service';
import type { AcuerdoPago } from '../acuerdos-pago.service';

interface OfflineConsumption extends Consumption {
  id?: number;
  syncStatus: string;
}

export class AppDatabase extends Dexie {
  installations!: Dexie.Table<Installation, number>;
  consumptions!: Dexie.Table<Consumption, number>;
  offlineConsumptions!: Dexie.Table<OfflineConsumption, number>;
  cuotasMedidor!: Dexie.Table<CuotaMedidor, number>;
  acuerdosPago!: Dexie.Table<AcuerdoPago, number>;

  constructor() {
    super('acueductosDB');
    
    this.version(1).stores({
      installations: '++id, codigo, codigo_medidor, nombre',
      consumptions: '++id, codigo, instalacion, fecha',
      offlineConsumptions: '++id, instalacion, fecha, syncStatus',
      cuotasMedidor: '++id, codigo, instalacion_codigo, nombre, fecha',
      acuerdosPago: '++id, codigo, instalacion_codigo, nombre, fecha, empresa'
    });
  }
}

export const db = new AppDatabase();