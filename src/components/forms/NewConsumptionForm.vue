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
const codigoRef = ref<{ focus: () => void; clear: () => void } | null>(null);
const lecturaActualRef = ref<{ focus: () => void } | null>(null);
const otrosCobrosRef = ref<{ focus: () => void; clear: () => void } | null>(null);
const reconexionRef = ref<{ focus: () => void } | null>(null);
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
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Lectura duplicada') {
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --color-dark-teal: #004D40;
  --color-jade-green: #00796B;
  --color-light-green: #4DB6AC;
  --color-petroleum-blue: #01579B;
  --color-sky-blue: #4FC3F7;
  --color-pure-white: #FFFFFF;
  --color-light-gray: #F5F5F5;
  --color-charcoal-gray: #212121;
  --color-medium-gray: #757575;
  --color-golden: #FFD54F;
}

// Contenedor principal del formulario
.consumption-form-container {
  padding: 0;
  max-width: 900px;
  margin: 0 auto;
  font-family: 'Inter', sans-serif;
}

// Card principal del formulario
.consumption-form-card {
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  background: var(--color-pure-white);
  border: 1px solid rgba(0, 77, 64, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
}

// Header del formulario
.form-header {
  background: linear-gradient(135deg, var(--color-dark-teal), var(--color-jade-green));
  color: var(--color-pure-white);
  padding: 24px;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="%23ffffff" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="%23ffffff" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="%23ffffff" opacity="0.15"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
    opacity: 0.3;
  }

  .text-h6 {
    font-weight: 700;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    position: relative;
    z-index: 1;
    font-size: 24px;
    letter-spacing: 0.5px;
  }

  .text-subtitle2 {
    opacity: 0.9;
    font-weight: 400;
  }

  .header-subtitle {
    color: rgba(255, 255, 255, 0.85) !important;
    font-weight: 500;
    opacity: 1;
    position: relative;
    z-index: 1;
  }
}

// Contenido del formulario
.form-content {
  padding: 32px;
  background: var(--color-pure-white);
  
  .row {
    margin-bottom: 20px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

// Acciones del formulario
.form-actions {
  background: linear-gradient(135deg, var(--color-dark-teal), var(--color-jade-green));
  padding: 24px 32px;
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  }
}

// Estilos para campos de entrada
:deep(.q-field) {
  margin-bottom: 20px;
  
  .q-field__label {
    color: var(--color-charcoal-gray);
    font-weight: 600;
    font-size: 14px;
    letter-spacing: 0.25px;
  }
  
  .q-field__control {
    border-radius: 12px;
    background: var(--color-pure-white);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 2px solid var(--color-light-gray);
    transition: all 0.2s ease;
    min-height: 48px;

    &:hover {
      border-color: var(--color-light-green);
      box-shadow: 0 4px 12px rgba(77, 182, 172, 0.15);
    }

    &.q-field__control--focused {
      border-color: var(--color-jade-green);
      box-shadow: 0 0 0 3px rgba(0, 121, 107, 0.15);
    }
    
    .q-field__native {
      color: var(--color-charcoal-gray);
      font-weight: 500;
      font-size: 15px;
      padding: 12px 16px;
    }
  }
  
  &.q-field--focused {
    .q-field__label {
      color: var(--color-jade-green);
    }
  }
  
  &.q-field--error {
    .q-field__control {
      border-color: #f44336;
      box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.15);
    }
  }
}

// Campos de solo lectura mejorados
:deep(.readonly-field) {
  .q-field__control {
    background: var(--color-light-gray) !important;
    border-color: #e0e0e0 !important;

    .q-field__native {
      color: var(--color-medium-gray) !important;
      font-weight: 600 !important;
    }
  }
  
  .q-field__label {
    color: var(--color-medium-gray) !important;
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
    background: rgba(255, 213, 79, 0.05) !important;
    border-color: var(--color-golden) !important;
    animation: pulse-golden 2s infinite;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 4px;
      background: var(--color-golden);
      border-radius: 0 12px 12px 0;
    }

    .q-field__native {
      color: #f57c00 !important;
      font-weight: 700 !important;
    }
  }
}

// Campos con estado positivo
.bg-positive {
  :deep(.q-field__control) {
    background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%) !important;
    border-color: var(--color-jade-green) !important;

    .q-field__native {
      color: var(--color-dark-teal) !important;
      font-weight: 700 !important;
    }
  }
}

// Animación para campos con advertencia
@keyframes pulse-golden {
  0% { box-shadow: 0 0 0 0 rgba(255, 213, 79, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(255, 213, 79, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 213, 79, 0); }
}

// Botones mejorados
:deep(.q-btn) {
  border-radius: 12px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.25px;
  transition: all 0.2s ease;

  &.q-btn--unelevated {
    min-width: 140px;
    height: 48px;
    font-size: 15px;
    
    &[color="green"] {
      background: linear-gradient(135deg, var(--color-pure-white), #f8f9fa);
      color: var(--color-jade-green);
      border: 2px solid transparent;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      
      &:hover {
        background: linear-gradient(135deg, #f8f9fa, var(--color-pure-white));
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        color: var(--color-dark-teal);
      }
    }
    
    &[color="red"] {
      border: 2px solid var(--color-pure-white);
      color: var(--color-pure-white);
      background: transparent;
      
      &:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }
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
  background: linear-gradient(135deg, var(--color-sky-blue), var(--color-petroleum-blue));
  color: var(--color-pure-white);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(79, 195, 247, 0.3);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(79, 195, 247, 0.4);
  }
}

// Transiciones suaves para slide
:deep(.q-slide-transition) {
  .q-slide-transition-enter-active,
  .q-slide-transition-leave-active {
    transition: all 0.3s ease;
  }
  
  .q-slide-transition-enter-from {
    opacity: 0;
    transform: translateY(-10px);
  }
  
  .q-slide-transition-leave-to {
    opacity: 0;
    transform: translateY(-10px);
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
    padding: 0;
  }

  .form-header {
    padding: 20px;
  }

  .form-content {
    padding: 24px 20px;
    
    .row {
      margin-bottom: 16px;
    }
    
    :deep(.q-field) {
      margin-bottom: 16px;
      
      .q-field__control {
        min-height: 44px;
        
        .q-field__native {
          padding: 10px 14px;
          font-size: 14px;
        }
      }
    }
  }

  .form-actions {
    padding: 20px;
    flex-direction: column;
    gap: 12px;
    
    :deep(.q-btn) {
      width: 100%;
      min-width: auto;
      height: 44px;
    }
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

@media (max-width: 480px) {
  .form-header {
    padding: 16px;
    
    .text-h6 {
      font-size: 18px;
    }
  }
  
  .form-content {
    padding: 16px;
    
    :deep(.q-field) {
      margin-bottom: 14px;
      
      .q-field__control {
        min-height: 40px;
        
        .q-field__native {
          padding: 8px 12px;
          font-size: 13px;
        }
      }
      
      .q-field__label {
        font-size: 13px;
      }
    }
  }
  
  .form-actions {
    padding: 16px;
    
    :deep(.q-btn) {
      height: 40px;
      font-size: 14px;
    }
  }
}

// Estados especiales para campos con validación
.consumption-out-of-range {
  :deep(.q-field__control) {
    border-color: var(--color-golden) !important;
    background: rgba(255, 213, 79, 0.05) !important;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 4px;
      background: var(--color-golden);
      border-radius: 0 12px 12px 0;
    }
  }
  
  :deep(.q-field__label) {
    color: #f57c00 !important;
  }
}

// Mejoras visuales adicionales
:deep(.q-field) {
  .q-field__prepend {
    color: var(--color-jade-green);
  }
  
  .q-field__append {
    color: var(--color-medium-gray);
  }
}

// Estilos para notificaciones y tooltips
.q-tooltip {
  background: var(--color-charcoal-gray);
  color: var(--color-pure-white);
  font-size: 13px;
  border-radius: 8px;
  padding: 8px 12px;
}
</style>
```