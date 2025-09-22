<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="q-pa-lg">
          <q-card-section>
            <div class="text-h6 text-center q-mb-md">FACTURAR</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="onSubmit" class="q-gutter-md">
              <!-- Selector de Mes -->
              <q-select
                v-model="selectedMonth"
                :options="monthOptions"
                label="Mes"
                outlined
                emit-value
                map-options
                :rules="[val => !!val || 'Seleccione un mes']"
              />

              <!-- Selector de Año -->
              <q-select
                v-model="selectedYear"
                :options="yearOptions"
                label="Año"
                outlined
                emit-value
                map-options
                :rules="[val => !!val || 'Seleccione un año']"
              />

              <!-- Botón Aceptar -->
              <div class="row justify-center q-mt-lg">
                <q-btn
                  type="submit"
                  color="primary"
                  label="Aceptar"
                  icon="check"
                  size="lg"
                  :loading="loading"
                  :disable="loading"
                  class="q-px-xl"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { facturasService } from '../services/facturas.service';
import { useAuthStore } from '../stores/auth';

const $q = useQuasar();
const authStore = useAuthStore();
const loading = ref(false);
const selectedMonth = ref<number | null>(null);
const selectedYear = ref<number | null>(null);

const monthOptions = [
  { label: 'ENERO', value: 1 },
  { label: 'FEBRERO', value: 2 },
  { label: 'MARZO', value: 3 },
  { label: 'ABRIL', value: 4 },
  { label: 'MAYO', value: 5 },
  { label: 'JUNIO', value: 6 },
  { label: 'JULIO', value: 7 },
  { label: 'AGOSTO', value: 8 },
  { label: 'SEPTIEMBRE', value: 9 },
  { label: 'OCTUBRE', value: 10 },
  { label: 'NOVIEMBRE', value: 11 },
  { label: 'DICIEMBRE', value: 12 }
];

const yearOptions = ref<{ label: string; value: number }[]>([]);

// Generar opciones de años (desde 2020 hasta año actual + 2)
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  
  for (let year = 2020; year <= currentYear + 2; year++) {
    years.push({ label: year.toString(), value: year });
  }
  
  yearOptions.value = years;
};

const onSubmit = async () => {
  if (!selectedMonth.value || !selectedYear.value) {
    $q.notify({
      type: 'negative',
      message: 'Por favor seleccione mes y año'
    });
    return;
  }

  try {
    loading.value = true;
    
    // Primero validar si hay consumos sin facturar
    const validacion = await facturasService.validarConsumosSinFacturar(
      selectedMonth.value, 
      selectedYear.value,
      authStore.codigoEmpresa
    );
    
    // Si no hay datos para facturar, mostrar mensaje y salir
    if (!validacion.data.tiene_datos) {
      $q.notify({
        type: 'warning',
        message: validacion.data.mensaje,
        position: 'center',
        timeout: 4000
      });
      loading.value = false;
      return;
    }
    
    // Si hay datos, mostrar diálogo de confirmación
    $q.dialog({
      title: 'Confirmar Facturación',
      message: `${validacion.data.mensaje}. ¿Desea continuar con la facturación?`,
      cancel: {
        label: 'Cancelar',
        color: 'negative',
        flat: true
      },
      ok: {
        label: 'Continuar',
        color: 'primary'
      },
      persistent: true,
      class: 'centered-dialog',
      style: 'text-align: center;'
    }).onOk(async () => {
      try {
        // Proceder con la facturación
        await facturasService.generarFactura(selectedMonth.value!, selectedYear.value!, authStore.codigoEmpresa);
        
        $q.notify({
          type: 'positive',
          message: `Facturación generada exitosamente para ${monthOptions.find(m => m.value === selectedMonth.value)?.label} ${selectedYear.value}`,
          position: 'center',
          timeout: 3000
        });
        
        // Resetear formulario
        selectedMonth.value = null;
        selectedYear.value = null;
        
      } catch (error) {
        console.error('Error al generar factura:', error);
        $q.notify({
          type: 'negative',
          message: error instanceof Error ? error.message : 'Error al generar la factura',
          position: 'center',
          timeout: 2000,
        });
      }
    }).onCancel(() => {
      // Usuario canceló, no hacer nada
      $q.notify({
        type: 'info',
        message: 'Facturación cancelada',
        timeout: 2000,
        position: 'center'
      });
    });
    
  } catch (error) {
    console.error('Error al validar consumos:', error);
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Error al validar consumos sin facturar',
      position: 'center',
      timeout: 2000,
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  generateYearOptions();
  
  // Establecer mes y año actual por defecto
  const now = new Date();
  selectedMonth.value = now.getMonth() + 1;
  selectedYear.value = now.getFullYear();
});
</script>

<style lang="scss" scoped>
.q-card {
  max-width: 400px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.text-h6 {
  font-weight: 600;
  color: #1976d2;
}

.q-btn {
  font-weight: 600;
}
</style>

<style lang="scss">
/* Estilos globales para el diálogo de confirmación */
.centered-dialog .q-dialog__inner {
  padding: 16px;
}

.centered-dialog .q-card {
  text-align: center;
  min-width: 350px;
}

.centered-dialog .q-card__section {
  text-align: center;
}

.centered-dialog .q-dialog__title {
  text-align: center;
  font-weight: 600;
  color: #1976d2;
}

.centered-dialog .q-dialog__message {
  text-align: center;
  font-size: 16px;
  line-height: 1.5;
  margin: 16px 0;
}

.centered-dialog .q-dialog__actions {
  justify-content: center;
  gap: 12px;
}
</style>