<template>
  <q-page class="empresa-form-container">
    <q-card class="empresa-form-card" v-if="!loading">
      <!-- Header del formulario -->
      <div class="form-header">
        <div class="header-content">
          <q-btn
            flat
            round
            icon="arrow_back"
            @click="goBack"
            class="back-btn"
          />
          <div class="header-text">
            <div class="text-h6">
              <q-icon name="edit" class="q-mr-sm" />
              Editar Empresa
            </div>
            <div class="header-subtitle">Modificar información de la empresa</div>
          </div>
        </div>
      </div>

      <!-- Contenido del formulario -->
      <div class="form-content">
        <q-form @submit="onSubmit" class="q-gutter-md">
          <div class="row q-gutter-md">
            <q-input
              v-model="form.codigo_alterno"
              label="Código Alterno *"
              outlined
              :rules="[val => !!val || 'El código alterno es requerido']"
              class="col-12 col-md-6"
            />
            
            <q-input
              v-model="form.nombre"
              label="Nombre *"
              outlined
              :rules="[val => !!val || 'El nombre es requerido']"
              class="col-12 col-md-6"
            />
          </div>

          <div class="row q-gutter-md">
            <q-input
              v-model="form.ident"
              label="Identificación *"
              outlined
              :rules="[val => !!val || 'La identificación es requerida']"
              class="col-12 col-md-6"
            />
            
            <q-input
              v-model="form.telefono"
              label="Teléfono *"
              outlined
              :rules="[val => !!val || 'El teléfono es requerido']"
              class="col-12 col-md-6"
            />
          </div>

          <q-input
            v-model="form.direccion"
            label="Dirección *"
            outlined
            type="textarea"
            rows="3"
            :rules="[val => !!val || 'La dirección es requerida']"
            class="col-12"
          />
        </q-form>
      </div>

      <q-separator />

      <!-- Acciones del formulario -->
      <div class="form-actions">
        <div class="row justify-end q-gutter-md">
          <q-btn
            flat
            label="Cancelar"
            @click="goBack"
            class="cancel-btn"
          />
          <q-btn
            label="Actualizar"
            color="success"
            :loading="saving"
            unelevated
            @click="onSubmit"
            class="save-btn"
          />
        </div>
      </div>
    </q-card>

    <div v-else class="flex flex-center q-pa-lg">
      <q-spinner color="primary" size="3em" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { empresaService } from '../services/api/empresa.service';
import type { UpdateEmpresaDto } from '../types/empresa';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();

const loading = ref(true);
const saving = ref(false);
const empresaCodigo = ref<number>(parseInt(route.params.id as string));

const form = ref<UpdateEmpresaDto>({
  codigo_alterno: '',
  nombre: '',
  direccion: '',
  ident: '',
  telefono: ''
});

const goBack = () => {
  router.push('/empresas');
};

const loadEmpresa = async () => {
  try {
    loading.value = true;
    const empresa = await empresaService.getByCodigo(empresaCodigo.value);
    
    form.value = {
      codigo_alterno: empresa.codigo_alterno,
      nombre: empresa.nombre,
      direccion: empresa.direccion,
      ident: empresa.ident,
      telefono: empresa.telefono
    };
  } catch (error) {
    console.error('Error al cargar empresa:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar la empresa'
    });
    goBack();
  } finally {
    loading.value = false;
  }
};

const onSubmit = async () => {
  try {
    saving.value = true;
    
    await empresaService.update(empresaCodigo.value, form.value);
    
    $q.notify({
      type: 'positive',
      message: 'Empresa actualizada exitosamente'
    });
    
    goBack();
  } catch (error) {
    console.error('Error al actualizar empresa:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al actualizar la empresa'
    });
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadEmpresa();
});
</script>

<style lang="scss" scoped>
// Contenedor principal del formulario
.empresa-form-container {
  padding: 16px;
  max-width: 900px;
  margin: 0 auto;
  min-height: calc(100vh - 100px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

// Card principal del formulario
.empresa-form-card {
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
  padding: 20px 24px;

  .header-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .back-btn {
    color: white;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.05);
    }
  }

  .header-text {
    flex: 1;

    .text-h6 {
      font-weight: 600;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
    }

    .header-subtitle {
      color: rgba(255, 255, 255, 0.85) !important;
      font-weight: 500;
      opacity: 1;
    }
  }
}

// Contenido del formulario
.form-content {
  padding: 32px 24px;
  background: rgba(255, 255, 255, 0.95);
}

// Acciones del formulario
.form-actions {
  padding: 12px 24px;
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

  // Textarea específico
  &.q-field--auto-height .q-field__control {
    min-height: 80px;
  }
}

// Botones mejorados
:deep(.q-btn) {
  border-radius: 12px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  min-width: 100px;

  &.q-btn--unelevated {
    box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);

    &:hover {
      box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4);
      transform: translateY(-2px);
    }
  }

  &.q-btn--flat {
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-1px);
    }
  }

  // Botón de cancelar específico
  &.cancel-btn {
    color: white;
    
    &:hover {
      background: rgba(244, 67, 54, 0.1);
    }
  }

  // Botón de guardar específico
  &.save-btn {
    &:hover {
      box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
    }
  }
}

// Responsive design
@media (max-width: 600px) {
  .empresa-form-container {
    padding: 8px;
  }
  
  .form-header {
    padding: 16px;
    
    .header-content {
      gap: 12px;
    }
  }
  
  .form-content {
    padding: 20px 16px;
  }
  
  .form-actions {
    padding: 10px 16px;
  }

  :deep(.q-btn) {
    min-width: 80px;
    font-size: 0.875rem;
  }
}
</style>