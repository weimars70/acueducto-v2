```vue
<template>
  <div class="consumption-form-container">
    <q-card class="consumption-form-card">
      <q-card-section class="form-header">
        <div class="text-subtitle2 header-subtitle">
          {{ mode === 'edit' ? 'Modifica los datos del consumo' : 'Registra una nueva lectura de consumo' }}
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="form-content">
        <div class="row q-col-gutter-md">
      <!-- Fecha, Mes y Año -->
      <div class="col-12 q-mb-xs">
        <DateFields v-model="formData" />
      </div>

      <!-- Código de Instalación -->
      <div class="col-12 col-sm-6 col-md-3 q-mb-xs">
        <InstallationCodeField 
          ref="codigoRef"
          @installation-found="onInstallationFound" 
          v-if="mode !== 'edit'"
        />
        <ReadonlyField
          v-else
          v-model="formData.codigo"
          label="Instalación"
        />
      </div>

      <!-- Cliente -->
      <div class="col-12 col-sm-6 col-md-4 q-mb-xs">
        <ReadonlyField
          v-model="formData.cliente"
          label="Cliente"
        />
      </div>

      <!-- Sector -->
      <div class="col-12 col-sm-6 col-md-3 q-mb-xs">
        <ReadonlyField
          v-model="formData.sector"
          label="Sector"
        />
      </div>

      <!-- Medidor -->
      <div class="col-12 col-sm-6 col-md-2 q-mb-xs">
        <ReadonlyField
          v-model="formData.medidor"
          label="Medidor"
        />
      </div>

      <!-- Dirección -->
      <div class="col-12 q-mb-xs">
        <ReadonlyField
          v-model="formData.direccion"
          label="Dirección"
        />
      </div>

      <!-- Lecturas y Consumo -->
      <div class="col-12 col-sm-6 col-md-3 q-mb-xs">
        <ReadonlyField
          v-model="formData.lectura_anterior"
          label="Lectura Anterior"
          type="number"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3 q-mb-xs">
        <q-input
          ref="lecturaActualRef"
          v-model="formData.lectura_actual"
          label="Lectura Actual"
          type="number"
          outlined
          dense
          @keyup="handleLecturaActualKeyup"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3 q-mb-xs">
        <ReadonlyField
          v-model="formData.consumo"
          label="Consumo"
          type="number"
          class="text-center"
          :class="{
            'bg-negative': isConsumptionOutOfRange,
            'bg-positive': !isConsumptionOutOfRange && formData.consumo !== '0'
          }"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3 q-mb-xs">
        <q-input
          v-model="formData.facturar"
          label="Facturar"
          type="number"
          outlined
          dense
          class="text-center"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3 q-mb-xs">
        <ReadonlyField
          v-model="formData.promedio"
          label="Promedio"
          type="number"
          class="text-center"
        />
      </div>

      <!-- Cobros Adicionales - Hidden on mobile/tablet -->
      <div class="col-12 col-md-6 q-mb-xs hide-on-mobile">
        <q-input
          ref="otrosCobrosRef"
          v-model="formData.otros_cobros"
          label="Otros Cobros"
          type="number"
          outlined
          dense
          @keyup="handleOtrosCobrosKeyup"
        />
      </div>

      <div class="col-12 col-md-6 q-mb-xs hide-on-mobile">
        <q-input
          ref="reconexionRef"
          v-model="formData.reconexion"
          label="Reconexión"
          type="number"
          outlined
          dense
        />
      </div>

      <!-- Cobros Adicionales - Shown only on mobile/tablet -->
      <div class="col-12 show-on-mobile q-mb-xs">
        <q-btn
          label="Mostrar cobros adicionales"
          color="primary"
          flat
          @click="showAdditionalCharges = !showAdditionalCharges"
          class="full-width"
          :icon-right="showAdditionalCharges ? 'expand_less' : 'expand_more'"
        />
        
        <q-slide-transition>
          <div v-show="showAdditionalCharges">
            <div class="row q-col-gutter-xs q-mt-xs">
              <div class="col-12 col-sm-6 q-mb-xs">
                <q-input
                  ref="otrosCobrosRef"
                  v-model="formData.otros_cobros"
                  label="Otros Cobros"
                  type="number"
                  outlined
                  dense
                  @keyup="handleOtrosCobrosKeyup"
                />
              </div>

              <div class="col-12 col-sm-6 q-mb-xs">
                <q-input
                  ref="reconexionRef"
                  v-model="formData.reconexion"
                  label="Reconexión"
                  type="number"
                  outlined
                  dense
                />
              </div>
            </div>
          </div>
        </q-slide-transition>
      </div>

        </div>
      </q-card-section>

      <q-separator />

      <!-- Botones -->
      <q-card-actions class="form-actions">
        <q-space />
        <q-btn
          label="Cancelar"
          color="red"
          unelevated
          size="md"
          class="q-px-lg q-ml-sm"
          @click="onCancel"
        />
        <q-btn
          :label="mode === 'edit' ? 'Actualizar' : 'Guardar'"
          color="green"
          unelevated
          size="md"
          class="q-px-lg q-ml-sm"
          @click="handleSave"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import InstallationCodeField from './fields/InstallationCodeField.vue';
import ReadonlyField from './fields/ReadonlyField.vue';
import DateFields from './fields/DateFields.vue';
import { getCurrentDate, getCurrentMonth, getCurrentYear, months } from '../../utils/dates';
import { useConsumptionForm } from '../../composables/useConsumptionForm';
import { consumptionService } from '../../services/api/consumption.service';
import { getMesCodigoFromText } from '../../types/consumption';

const emit = defineEmits<{
  (e: 'mounted'): void
}>();

const props = defineProps<{
  mode?: 'create' | 'edit'
}>();

const $q = useQuasar();
const router = useRouter();
const codigoRef = ref(null);
const lecturaActualRef = ref(null);
const otrosCobrosRef = ref(null);
const reconexionRef = ref(null);
const showAdditionalCharges = ref(false);

const { formData, updateConsumo, saveConsumption } = useConsumptionForm(props.mode);

// Inicializar valores por defecto solo en modo create
if (props.mode !== 'edit') {
  formData.value.mes = months[getCurrentMonth() - 1].text;
  formData.value.year = getCurrentYear();
  formData.value.fecha = getCurrentDate();
}

const isConsumptionOutOfRange = computed(() => {
  const consumo = parseFloat(formData.value.consumo);
  const promedio = parseFloat(formData.value.promedio);
  
  if (isNaN(consumo) || isNaN(promedio) || promedio === 0) {
    return false;
  }

  const difference = Math.abs(consumo - promedio);
  return difference > 10;
});

// Watch para actualizar el consumo cuando cambia la lectura actual
watch(() => formData.value.lectura_actual, (newValue) => {
  if (newValue && formData.value.lectura_anterior) {
    updateConsumo(newValue);
  }
});

const handleLecturaActualKeyup = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    const consumo = parseFloat(formData.value.consumo);
    if (consumo > -1) {
      otrosCobrosRef.value?.focus();
    } else {
      lecturaActualRef.value?.focus();
      $q.notify({
        type: 'negative',
        message: 'El consumo debe ser mayor a -1'
      });
    }
  }
};

const handleOtrosCobrosKeyup = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && formData.value.otros_cobros !== null) {
    reconexionRef.value?.focus();
  }
};

const validarLecturaExistente = async (instalacion: number) => {
  try {
    // Obtener el mes numérico desde el texto del mes
    const mesNumerico = getMesCodigoFromText(formData.value.mes);
    const year = parseInt(formData.value.year);
    
    const resultado = await consumptionService.validarLecturaExistente(instalacion, mesNumerico, year);
    
    if (resultado.existe) {
      $q.notify({
        type: 'negative',
        message: 'La lectura para este mes ya fue ingresada',
        position: 'center'
      });
      throw new Error('Lectura duplicada');
    }
  } catch (error) {
    if (error.message === 'Lectura duplicada') {
      throw error;
    }
    
    // Si hay error de conexión u otro error, mostrar mensaje pero permitir continuar
    console.error('Error al validar lectura:', error);
    $q.notify({
      type: 'warning',
      message: 'No se pudo validar la lectura. Verifique la conexión.',
      position: 'top'
    });
  }
};

const onInstallationFound = async (installation: any) => {
  console.log('installation:::', installation);
  
  // Validar si ya existe una lectura para esta instalación en el mes y año actual
  try {
    await validarLecturaExistente(installation.codigo);
    
    // Si no hay lectura duplicada, proceder con la carga de datos
    formData.value = {
      ...formData.value,
      codigo: installation.codigo.toString(),
      medidor: installation.codigo_medidor,
      cliente: installation.nombre,
      sector: installation.sector_nombre,
      direccion: installation.direccion,
      lectura_anterior: installation.lectura_anterior.toString(),
      promedio: installation.promedio.toString()
    };
    
    await nextTick();
    if (props.mode !== 'edit') {
      lecturaActualRef.value?.focus();
    }
  } catch (error) {
    // Si hay error en la validación, no cargar los datos
    console.error('Error en validación de lectura:', error);
  }
};

const onCancel = () => {
  router.push('/consumptions');
};

const handleSave = async () => {
  const success = await saveConsumption();
  if (success) {
    if (props.mode !== 'edit') {
      codigoRef.value?.clear();
      await nextTick();
      codigoRef.value?.focus();
    } else {
      router.push('/consumptions');
    }
  }
};

onMounted(() => {
  emit('mounted');
});

// Métodos expuestos para el componente padre
defineExpose({
  setFormData: (data: any) => {
    formData.value = { ...formData.value, ...data };
  },
  onInstallationFound,
  focusLecturaActual: () => {
    nextTick(() => {
      if (lecturaActualRef.value) {
        lecturaActualRef.value.focus();
      }
    });
  }
});
</script>

<style lang="scss" scoped>
// Contenedor principal del formulario
.consumption-form-container {
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 100px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

// Card principal del formulario
.consumption-form-card {
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
}

// Header del formulario
.form-header {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
  border-radius: 16px 16px 0 0;
  padding: 12px 24px;

  .text-h6 {
    font-weight: 600;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
  }

  .text-subtitle2 {
    opacity: 0.9;
    font-weight: 400;
  }

  .header-subtitle {
    color: rgba(255, 255, 255, 0.85) !important;
    font-weight: 500;
    opacity: 1;
  }
}

// Contenido del formulario
.form-content {
  padding: 32px 24px;
  background: rgba(255, 255, 255, 0.95);
}

// Acciones del formulario
.form-actions {
  padding: 8px 20px;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  border-radius: 0 0 16px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

// Estilos para campos de entrada
:deep(.q-field) {
  .q-field__control {
    border-radius: 12px;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.9);
    border: 2px solid transparent;

    &:hover {
      background: rgba(255, 255, 255, 1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &.q-field__control--focused {
      border-color: #1976d2;
      box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
    }
  }

  .q-field__native {
    font-weight: 500;
    color: #2c3e50;
  }

  .q-field__label {
    font-weight: 600;
    color: #546e7a;
  }
}

// Campos de solo lectura mejorados
:deep(.readonly-field) {
  .q-field__control {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border: 2px solid #e9ecef;

    .q-field__native {
      color: #495057;
      font-weight: 600;
    }
  }
}

// Estilos para campos centrados
.text-center {
  :deep(.q-field__native) {
    text-align: center !important;
    font-weight: 700;
    font-size: 1.1em;
  }
}

// Campos con estado negativo (consumo fuera de rango)
.bg-negative {
  :deep(.q-field__control) {
    background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%) !important;
    border-color: #f44336 !important;
    animation: pulse-red 2s infinite;

    .q-field__native {
      color: #c62828 !important;
      font-weight: 700 !important;
    }
  }
}

// Campos con estado positivo
.bg-positive {
  :deep(.q-field__control) {
    background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%) !important;
    border-color: #4caf50 !important;

    .q-field__native {
      color: #2e7d32 !important;
      font-weight: 700 !important;
    }
  }
}

// Animación para campos con error
@keyframes pulse-red {
  0% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(244, 67, 54, 0); }
  100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); }
}

// Botones mejorados
:deep(.q-btn) {
  border-radius: 12px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;

  &.q-btn--unelevated {
    box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);

    &:hover {
      box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4);
      transform: translateY(-2px);
    }
  }

  &.q-btn--flat {
    &:hover {
      background: rgba(0, 0, 0, 0.05);
      transform: translateY(-1px);
    }
  }
}

// Botón de cobros adicionales mejorado
:deep(.q-btn--flat.full-width) {
  border-radius: 12px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px dashed #dee2e6;
  color: #6c757d;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
    border-color: #adb5bd;
    color: #495057;
    transform: translateY(-1px);
  }
}

// Transiciones suaves para slide
:deep(.q-slide-transition) {
  .q-slide-transition-enter-active,
  .q-slide-transition-leave-active {
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  }
}

// Espaciado mejorado
.q-mb-xs {
  margin-bottom: 12px !important;
}

.row.q-col-gutter-md {
  margin: -8px;
  > div {
    padding: 8px;
  }
}

// Responsive visibility classes
@media (max-width: 1023px) {
  .hide-on-mobile {
    display: none;
  }
  .show-on-mobile {
    display: block;
  }

  .consumption-form-container {
    padding: 8px;
    min-height: auto;
  }

  .form-header {
    padding: 10px 16px;
  }

  .form-content {
    padding: 24px 16px;
  }

  .form-actions {
    padding: 8px 12px;
  }
}

@media (min-width: 1024px) {
  .hide-on-mobile {
    display: block;
  }
  .show-on-mobile {
    display: none;
  }
}

// Mejoras adicionales para tablets
@media (min-width: 768px) and (max-width: 1023px) {
  .consumption-form-card {
    margin: 16px;
  }
}
</style>
```