<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { apiClient } from '../../services/api/client';

const TABLE_NAME = 'tarifas';
const TITLE = 'Tarifas';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const records = ref([]);
const editMode = ref(false);
const selectedRecord = ref(null);

// Form data for inline editing/adding
const formData = ref({
  codigo: '',
  nombre: '',
  abreviado: '',
  tabla: TABLE_NAME
});

const fetchRecords = async () => {
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
    
    const { data } = await apiClient.get(`/generic-capture/${TABLE_NAME}`);
    records.value = data;
  } catch (error) {
    console.error('Error fetching records:', error);
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 
               error.message || 
               'Error al cargar los datos'
    });
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  formData.value = {
    codigo: '',
    nombre: '',
    abreviado: '',
    tabla: TABLE_NAME
  };
  editMode.value = false;
  selectedRecord.value = null;
};

const editRecord = (record) => {
  formData.value = {
    codigo: record.codigo,
    nombre: record.nombre,
    abreviado: record.abreviado,
    tabla: TABLE_NAME
  };
  editMode.value = true;
  selectedRecord.value = record;
};

const deleteRecord = async (codigo) => {
  try {
    $q.dialog({
      title: 'Confirmar',
      message: '¿Está seguro que desea eliminar este registro?',
      cancel: true,
      persistent: true
    }).onOk(async () => {
      if (!authStore.isAuthenticated) {
        $q.notify({
          type: 'negative',
          message: 'Su sesión ha expirado. Por favor inicie sesión nuevamente.'
        });
        router.push('/login');
        return;
      }
      
      await apiClient.delete(`/generic-capture/${TABLE_NAME}/${codigo}`);
      
      $q.notify({
        type: 'positive',
        message: 'Registro eliminado exitosamente'
      });
      
      fetchRecords();
    });
  } catch (error) {
    console.error('Error deleting record:', error);
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 
               error.message || 
               'Error al eliminar el registro'
    });
  }
};

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
    
    if (editMode.value) {
      await apiClient.put('/generic-capture', formData.value);
      $q.notify({
        type: 'positive',
        message: 'Registro actualizado exitosamente'
      });
    } else {
      await apiClient.post('/generic-capture', formData.value);
      $q.notify({
        type: 'positive',
        message: 'Registro creado exitosamente'
      });
    }
    
    resetForm();
    fetchRecords();
  } catch (error) {
    console.error('Error saving record:', error);
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 
               error.message || 
               `Error al ${editMode.value ? 'actualizar' : 'crear'} el registro`
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchRecords();
});
</script>

<template>
  <q-page class="tarifas-page-container">
    <div class="tarifas-content">
      <!-- Form Section -->
      <q-card class="tarifas-form-card q-mb-md">
        <!-- Header del formulario -->
        <div class="form-header">
          <div class="header-content">
            <q-icon name="attach_money" size="md" class="q-mr-sm" />
            <div class="header-text">
              <div class="text-h6">{{ editMode ? 'Editar Tarifa' : 'Nueva Tarifa' }}</div>
              <div class="header-subtitle">Gestión de tarifas del acueducto</div>
            </div>
          </div>
        </div>
        
        <!-- Contenido del formulario -->
        <div class="form-content">
          <q-form @submit.prevent="saveRecord" class="row q-col-gutter-md">
            <div class="col-12 col-md-3">
              <q-input
                v-model="formData.codigo"
                label="Código"
                outlined
                :disable="editMode"
                :rules="[val => !!val || 'Campo requerido']"
              />
            </div>
            
            <div class="col-12 col-md-4">
              <q-input
                v-model="formData.nombre"
                label="Nombre"
                outlined
                :rules="[val => !!val || 'Campo requerido']"
              />
            </div>
            
            <div class="col-12 col-md-3">
              <q-input
                v-model="formData.abreviado"
                label="Abreviado"
                outlined
                :rules="[val => !!val || 'Campo requerido']"
              />
            </div>
            
            <div class="col-12 col-md-2 flex items-center justify-end">
              <q-btn
                v-if="editMode"
                label="Cancelar"
                flat
                class="cancel-btn q-mr-sm"
                @click="resetForm"
              />
              <q-btn
                :label="editMode ? 'Actualizar' : 'Guardar'"
                type="submit"
                color="success"
                unelevated
                :loading="loading"
                class="save-btn"
              />
            </div>
          </q-form>
        </div>
      </q-card>
      
      <!-- Table Section -->
      <q-table
        :rows="records"
        :columns="[
          { name: 'codigo', label: 'Código', field: 'codigo', sortable: true, align: 'left' },
          { name: 'nombre', label: 'Nombre', field: 'nombre', sortable: true, align: 'left' },
          { name: 'abreviado', label: 'Abreviado', field: 'abreviado', sortable: true, align: 'left' },
          { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
        ]"
        row-key="codigo"
        :loading="loading"
        flat
        bordered
      >
        <template v-slot:loading>
          <q-inner-loading showing color="primary">
            <q-spinner size="50px" color="primary" />
          </q-inner-loading>
        </template>
        
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              dense
              color="primary"
              icon="edit"
              @click="editRecord(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              color="negative"
              icon="delete"
              @click="deleteRecord(props.row.codigo)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
        
        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-md text-grey-8">
            No hay registros disponibles
          </div>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
// Contenedor principal de la página
.tarifas-page-container {
  padding: 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

// Contenido de tarifas
.tarifas-content {
  max-width: 1200px;
  margin: 0 auto;
}

// Card del formulario de tarifas
.tarifas-form-card {
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
    color: #f44336;
    
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

// Tabla mejorada
:deep(.q-table) {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);

  .q-table__top {
    background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
    color: white;
    border-radius: 16px 16px 0 0;
  }

  .q-table__middle {
    background: rgba(255, 255, 255, 0.95);
  }

  thead tr th {
    background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
    color: white;
    font-weight: 600;
    border: none;
  }

  tbody tr {
    transition: all 0.3s ease;

    &:hover {
      background: rgba(25, 118, 210, 0.05);
      transform: translateY(-1px);
    }
  }

  tbody tr td {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
}

// Responsive design
@media (max-width: 600px) {
  .tarifas-page-container {
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

  :deep(.q-btn) {
    min-width: 80px;
    font-size: 0.875rem;
  }
}
</style>