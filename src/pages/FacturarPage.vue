<template>
  <q-page class="page-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <div class="title-section">
            <div class="title-icon">
              <q-icon name="receipt" size="24px" />
            </div>
            <h1 class="page-title">Facturar</h1>
          </div>
        </div>
      </div>
    </div>

    <!-- Formulario de Facturación -->
    <div class="facturar-section">
      <div class="facturar-header">
        <div class="facturar-title">
          <q-icon name="description" class="facturar-icon" />
          <span>Generar Facturación</span>
        </div>
      </div>
      
      <div class="facturar-content">
        <div class="form-container">
          <q-form @submit="onSubmit" class="facturar-form">
            <div class="form-grid">
              <!-- Selector de Mes -->
              <div class="form-item">
                <q-select
                  v-model="selectedMonth"
                  :options="monthOptions"
                  label="Mes"
                  outlined
                  emit-value
                  map-options
                  :rules="[val => !!val || 'Seleccione un mes']"
                  class="modern-input"
                />
              </div>

              <!-- Selector de Año -->
              <div class="form-item">
                <q-select
                  v-model="selectedYear"
                  :options="yearOptions"
                  label="Año"
                  outlined
                  emit-value
                  map-options
                  :rules="[val => !!val || 'Seleccione un año']"
                  class="modern-input"
                />
              </div>
            </div>

            <!-- Botón Aceptar -->
            <div class="form-actions">
              <q-btn
                type="submit"
                label="Generar Facturación"
                icon="receipt_long"
                size="lg"
                :loading="loading"
                :disable="loading"
                class="primary-btn"
              />
            </div>
          </q-form>
        </div>
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
    
    // Verificar que el usuario esté autenticado y tenga código de empresa
    if (!authStore.codigoEmpresa) {
      $q.notify({
        type: 'negative',
        message: 'No se pudo obtener el código de empresa. Por favor inicie sesión nuevamente.'
      });
      loading.value = false;
      return;
    }
    
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
        // Verificar que el código de empresa esté disponible
        if (!authStore.codigoEmpresa) {
          $q.notify({
            type: 'negative',
            message: 'Error: No se pudo obtener el código de empresa. Por favor, inicie sesión nuevamente.',
            position: 'center'
          });
          return;
        }
        
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
.page-container {
  max-width: 1400px;
  margin: 0 auto;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #43e97b 100%);
  min-height: 100vh;
  padding: 20px;
  border-radius: 20px;
}

.page-header {
  margin-bottom: 32px;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
    background: rgba(255, 255, 255, 0.95);
    padding: 24px 32px;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
  }
  
  .header-text {
    flex: 1;
    
    .title-section {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .title-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: linear-gradient(135deg, #4facfe, #00f2fe);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 4px 16px rgba(79, 172, 254, 0.3);
      }
      
      .page-title {
        margin: 0;
        background: linear-gradient(135deg, #4facfe, #43e97b);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-weight: 700;
        font-size: 1.8rem;
      }
    }
  }
}

.facturar-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  overflow: hidden;
  
  .facturar-header {
    padding: 20px 32px;
    background: linear-gradient(135deg, rgba(79, 172, 254, 0.1), rgba(67, 233, 123, 0.1));
    border-bottom: 1px solid rgba(79, 172, 254, 0.2);
    
    .facturar-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 600;
      color: #333;
      font-size: 1.1rem;
      
      .facturar-icon {
        color: #4facfe;
        font-size: 20px;
      }
    }
  }
  
  .facturar-content {
    padding: 48px 32px;
    display: flex;
    justify-content: center;
    
    .form-container {
      width: 100%;
      max-width: 500px;
      
      .facturar-form {
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 32px;
          
          .form-item {
            .modern-input {
              :deep(.q-field__control) {
                border-radius: 12px;
                border: 2px solid #e0e0e0;
                transition: all 0.3s ease;
                
                &:hover {
                  border-color: #4facfe;
                }
              }
              
              :deep(.q-field--focused .q-field__control) {
                border-color: #4facfe;
                box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.2);
              }
              
              :deep(.q-field__label) {
                color: #666;
                font-weight: 500;
              }
            }
          }
        }
        
        .form-actions {
          display: flex;
          justify-content: center;
          
          .primary-btn {
            background: linear-gradient(135deg, #4facfe, #00f2fe);
            color: white;
            border: none;
            border-radius: 12px;
            padding: 16px 32px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 16px rgba(79, 172, 254, 0.3);
            transition: all 0.3s ease;
            min-width: 200px;
            
            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
            }
            
            &:disabled {
              opacity: 0.6;
              transform: none;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 12px;
    border-radius: 12px;
  }
  
  .page-header {
    .header-content {
      padding: 20px;
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
      
      .title-section {
        .page-title {
          font-size: 1.5rem;
        }
      }
    }
  }
  
  .facturar-section {
    .facturar-header {
      padding: 16px 20px;
    }
    
    .facturar-content {
      padding: 32px 20px;
      
      .form-container {
        .facturar-form {
          .form-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .form-actions {
            .primary-btn {
              width: 100%;
              min-width: auto;
            }
          }
        }
      }
    }
  }
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