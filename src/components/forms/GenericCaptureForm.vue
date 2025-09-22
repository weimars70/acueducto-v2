<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { apiClient } from '../../services/api/client';

const props = defineProps<{
  tableName: string;
  title: string;
  editMode?: boolean;
  initialData?: {
    codigo: string;
    nombre: string;
    abreviado: string;
  };
}>();

const emit = defineEmits<{
  (e: 'saved'): void;
  (e: 'cancelled'): void;
}>();

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);

const formData = ref({
  codigo: '',
  nombre: '',
  abreviado: '',
  tabla: props.tableName
});

onMounted(() => {
  if (props.initialData) {
    formData.value = {
      ...formData.value,
      codigo: props.initialData.codigo,
      nombre: props.initialData.nombre,
      abreviado: props.initialData.abreviado
    };
  }
});

const saveRecord = async () => {
  try {
    loading.value = true;
    
    if (!authStore.isAuthenticated) {
      $q.notify({
        type: 'negative',
        message: 'Su sesión ha expirado. Por favor inicie sesión nuevamente.'
      });
      router.push('/login');
      return;
    }
    
    // Use the apiClient instead of fetch for consistent error handling
    if (props.editMode) {
      await apiClient.put('/generic-capture', formData.value);
    } else {
      await apiClient.post('/generic-capture', formData.value);
    }
    
    $q.notify({
      type: 'positive',
      message: `Registro ${props.editMode ? 'actualizado' : 'creado'} exitosamente`
    });
    
    emit('saved');
    
    if (!props.editMode) {
      // Reset form if not in edit mode
      formData.value = {
        codigo: '',
        nombre: '',
        abreviado: '',
        tabla: props.tableName
      };
    }
  } catch (error) {
    console.error('Error saving record:', error);
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 
               error.message || 
               `Error al ${props.editMode ? 'actualizar' : 'crear'} el registro`
    });
  } finally {
    loading.value = false;
  }
};

const cancel = () => {
  emit('cancelled');
};
</script>

<template>
  <div class="generic-form-container">
    <q-card class="generic-form-card">
      <q-card-section class="form-header">
        <div class="text-h6">
          <q-icon name="edit" class="q-mr-sm" />
          {{ title }}
        </div>
        <div class="text-subtitle2 header-subtitle">
          {{ props.editMode ? 'Modifica los datos del registro' : 'Registra un nuevo elemento' }}
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="form-content">
        <q-form @submit.prevent="saveRecord" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input
                v-model="formData.codigo"
                label="Código"
                outlined
                dense
                :disable="props.editMode"
                :rules="[val => !!val || 'Campo requerido']"
              />
            </div>
            
            <div class="col-12 col-md-4">
              <q-input
                v-model="formData.nombre"
                label="Nombre"
                outlined
                dense
                :rules="[val => !!val || 'Campo requerido']"
              />
            </div>
            
            <div class="col-12 col-md-4">
              <q-input
                v-model="formData.abreviado"
                label="Abreviado"
                outlined
                dense
                :rules="[val => !!val || 'Campo requerido']"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>

      <q-separator />

      <q-card-actions class="form-actions">
        <q-space />
        <q-btn
          label="Cancelar"
          color="red"
          flat
          size="md"
          class="cancel-btn"
          @click="cancel"
        />
        <q-btn
          :label="props.editMode ? 'Actualizar' : 'Guardar'"
          type="submit"
          color="green"
          unelevated
          size="md"
          class="save-btn"
          :loading="loading"
          @click="saveRecord"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<style lang="scss" scoped>
// Contenedor principal del formulario
.generic-form-container {
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
  min-height: calc(100vh - 100px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

// Card principal del formulario
.generic-form-card {
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

// Header del formulario (azul como NewConsumptionForm)
.form-header {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
  border-radius: 16px 16px 0 0;
  padding: 16px 24px;

  .text-h6 {
    font-weight: 600;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    font-size: 1.25rem;
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
  padding: 24px;
  background: rgba(255, 255, 255, 0.95);
}

// Acciones del formulario
.form-actions {
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 0 0 16px 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// Estilos para campos de entrada
:deep(.q-field) {
  margin-bottom: 12px;

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
    padding: 12px 16px;
  }

  .q-field__label {
    font-weight: 600;
    color: #546e7a;
    font-size: 0.875rem;
  }

  &.q-field--outlined .q-field__control {
    border: 2px solid #e5e7eb;
    
    &:hover {
      border-color: #d1d5db;
    }
    
    &.q-field__control--focused {
      border-color: #1976d2;
    }
  }
}

// Botones mejorados con colores específicos
:deep(.q-btn) {
  border-radius: 12px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  padding: 12px 24px;
  min-width: 100px;

  // Botón verde (Guardar/Actualizar)
  &.bg-green {
    background: #4caf50 !important;
    color: white;
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);

    &:hover {
      background: #45a049 !important;
      box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
      transform: translateY(-2px);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
    }
  }

  // Botón rojo (Cancelar)
  &.text-red {
    color: #f44336 !important;
    background: transparent;
    border: 2px solid #f44336;

    &:hover {
      background: #f44336 !important;
      color: white !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
    }
  }

  &.q-btn--unelevated {
    &:hover {
      transform: translateY(-2px);
    }
  }

  &.q-btn--flat {
    &:hover {
      transform: translateY(-1px);
    }
  }

  // Estados de loading
  &.q-btn--loading {
    .q-btn__content {
      opacity: 0.7;
    }
  }
}

// Espaciado mejorado para formularios
:deep(.q-gutter-md) {
  > * {
    margin-bottom: 16px;
  }
}

:deep(.row.q-col-gutter-md) {
  margin-left: -8px;
  margin-right: -8px;
  
  > .col, > [class*="col-"] {
    padding-left: 8px;
    padding-right: 8px;
  }
}

// Responsive design
@media (max-width: 600px) {
  .generic-form-container {
    padding: 8px;
  }
  
  .form-header {
    padding: 12px 16px;
  }
  
  .form-content {
    padding: 16px;
  }
  
  .form-actions {
    padding: 12px 16px;
    flex-direction: column-reverse;
    
    :deep(.q-btn) {
      width: 100%;
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  :deep(.q-field) {
    .q-field__native {
      font-size: 16px; // Evita zoom en iOS
    }
  }
}
</style>