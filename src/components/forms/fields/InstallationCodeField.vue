<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { installationService } from '../../../services/api/installation.service';
import { syncService } from '../../../services/sync/sync.service';

const emit = defineEmits<{
  (e: 'installation-found', data: any): void;
}>();

const $q = useQuasar();
const codigo = ref('');
const loading = ref(false);

const handleSearch = async () => {
  if (!codigo.value) {
    $q.notify({
      type: 'warning',
      message: 'Ingrese un código de instalación'
    });
    return;
  }
  
  loading.value = true;
  try {
    const installation = await installationService.getByCode(Number(codigo.value));
    console.log('____installation____', installation);
    if (!installation) {
      throw new Error('Instalación no encontrada');
    }

    // Asegurarse de que los valores numéricos estén presentes
    const normalizedInstallation = {
      ...installation,
      lectura_anterior: installation.lectura_anterior || 0,
      promedio: installation.promedio || 0
    };

    emit('installation-found', normalizedInstallation);
    
    if (!syncService.isOnline()) {
      $q.notify({
        type: 'warning',
        message: 'Trabajando en modo sin conexión',
        timeout: 2000
      });
    }
  } catch (error) {
    console.error('Error buscando instalación:', error);
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Error al buscar la instalación',
      timeout: 2000
    });
    emit('installation-found', null);
  } finally {
    loading.value = false;
  }
};

const handleInput = (value: string) => {
  // Solo permitir números y limitar a 5 dígitos
  codigo.value = value.replace(/[^\d]/g, '').slice(0, 5);
};

const handleKeyPress = async (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    await handleSearch();
  }
};

const clear = () => {
  codigo.value = '';
};

defineExpose({
  clear,
  focus: () => {
    const input = document.querySelector('input[aria-label="Código"]');
    if (input) {
      input.focus();
    }
  }
});
</script>

<template>
  <q-input
    v-model="codigo"
    label="Código"
    outlined
    dense
    :rules="[val => !!val || 'Campo requerido']"
    @keypress="handleKeyPress"
    @input="handleInput"
    :loading="loading"
  >
    <template v-slot:append>
      <q-icon 
        name="search" 
        class="cursor-pointer"
        @click="handleSearch"
      />
    </template>
  </q-input>
</template>

<style lang="scss" scoped>
// Estilos para el campo de código de instalación
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

    // Estado de carga
    &.q-field__control--loading {
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      border-color: #2196f3;
      
      .q-field__native {
        color: #1976d2;
      }
    }
  }

  .q-field__native {
    font-weight: 500;
    color: #2c3e50;
    font-family: 'Courier New', monospace;
    font-size: 1.1em;
    letter-spacing: 1px;
  }

  .q-field__label {
    font-weight: 600;
    color: #546e7a;
  }

  // Icono de búsqueda mejorado
  .q-field__append {
    .q-icon {
      color: #1976d2;
      transition: all 0.3s ease;
      cursor: pointer;
      padding: 4px;
      border-radius: 50%;

      &:hover {
        color: #1565c0;
        background: rgba(25, 118, 210, 0.1);
        transform: scale(1.1);
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }

  // Spinner de carga personalizado
  .q-field__loading {
    .q-spinner {
      color: #1976d2;
    }
  }

  // Validación de errores
  &.q-field--error {
    .q-field__control {
      border-color: #f44336;
      background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
      animation: shake 0.5s ease-in-out;

      .q-field__native {
        color: #c62828;
      }
    }
  }

  // Validación exitosa
  &.q-field--success {
    .q-field__control {
      border-color: #4caf50;
      background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);

      .q-field__native {
        color: #2e7d32;
      }
    }

    .q-field__append .q-icon {
      color: #4caf50;
    }
  }
}

// Animación de error
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
}

// Efectos de pulsación para el icono de búsqueda
.cursor-pointer {
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(25, 118, 210, 0.3);
    transition: width 0.3s ease, height 0.3s ease;
    transform: translate(-50%, -50%);
    z-index: 0;
  }

  &:active::before {
    width: 40px;
    height: 40px;
  }
}
</style>