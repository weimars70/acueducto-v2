<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md items-center">
      <div class="col">
        <q-btn 
          flat 
          round 
          icon="arrow_back" 
          @click="$router.push('/maestros')"
          class="q-mr-md"
        />
        <span class="text-h5">Estratos</span>
      </div>
      <div class="col-auto">
          <div class="row items-center q-gutter-x-xs">
            <ViewToggle v-model="view" />
            <q-btn
              color="primary"
              icon="add"
              label="Nuevo Estrato"
              @click="openDialog()"
            />
          </div>
        </div>
    </div>

    <!-- Filtros -->
    <q-card class="q-mb-md">
      <q-card-section class="q-pa-none">
        <div class="q-pa-md q-pb-sm">
          <div class="text-subtitle2">Filtros</div>
        </div>
        
        <!-- Tabla de filtros que coincide con las columnas -->
        <div class="filter-row">
          <table class="full-width">
            <colgroup>
              <col v-for="column in columns" :key="column.name" :style="getColumnStyle(column)">
            </colgroup>
            <tbody>
              <tr>
                <td class="q-pa-xs">
                  <q-input
                    v-model="filters.codigo"
                    placeholder="Filtrar por Código"
                    outlined
                    dense
                    clearable
                    @update:model-value="applyFilters"
                  />
                </td>
                <td class="q-pa-xs">
                  <q-input
                    v-model="filters.nombre"
                    placeholder="Filtrar por Nombre"
                    outlined
                    dense
                    clearable
                    @update:model-value="applyFilters"
                  />
                </td>
                <td class="q-pa-xs text-center">
                  <q-btn
                    flat
                    icon="clear"
                    label="Limpiar"
                    size="sm"
                    @click="clearFilters"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </q-card-section>
    </q-card>

    <!-- Vista de tabla o tarjetas -->
    <div class="content-section">
      <template v-if="view === 'list'">
        <!-- Tabla de estratos -->
        <q-table
          :rows="filteredEstratos"
          :columns="columns"
          :loading="loading"
          row-key="codigo"
          flat
          bordered
          :rows-per-page-options="[10, 25, 50]"
          rows-per-page-label="Registros por página:"
          no-data-label="No hay estratos disponibles"
          loading-label="Cargando estratos..."
        >
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn 
                flat 
                round 
                icon="edit" 
                size="sm" 
                @click="openDialog(props.row)"
                class="q-mr-xs"
              />
              <q-btn 
                flat 
                round 
                icon="delete" 
                size="sm" 
                color="negative"
                @click="confirmDelete(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </template>
      <template v-else>
        <!-- Vista de tarjetas -->
        <div class="grid-container">
          <EstratoGrid :items="filteredEstratos" />
        </div>
      </template>
    </div>

    <!-- Dialog para crear/editar -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ isEditing ? 'Editar' : 'Nuevo' }} Estrato</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="onSubmit" class="q-gutter-md">
            <q-input
              v-model="form.nombre"
              label="Nombre del Estrato"
              :rules="[val => !!val || 'El nombre es requerido']"
              outlined
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="closeDialog" />
          <q-btn 
            color="primary" 
            label="Guardar" 
            @click="onSubmit"
            :loading="saving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog de confirmación para eliminar -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">¿Está seguro de eliminar este estrato?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="showDeleteDialog = false" />
          <q-btn 
            color="negative" 
            label="Eliminar" 
            @click="deleteEstrato"
            :loading="deleting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { capturaGenericaEmpService } from '../services/api/captura-generica-emp.service';
import { useAuthStore } from '../stores/auth';
import { useScreenSize } from '../composables/useScreenSize';
import ViewToggle from '../components/ViewToggle.vue';
import EstratoGrid from '../components/EstratoGrid.vue';
import type { CapturaGenericaEmp } from '../types/captura-generica-emp';

const $q = useQuasar();
const authStore = useAuthStore();
const { isMobile } = useScreenSize();
const view = ref<'grid' | 'list'>(isMobile.value ? 'grid' : 'list');
const codigoEmpresa = computed(() => authStore.codigoEmpresa);

// Variables reactivas
const estratos = ref<CapturaGenericaEmp[]>([]);
const loading = ref(false);

watch(isMobile, (newValue) => {
  view.value = newValue ? 'grid' : 'list';
});
const showDialog = ref(false);
const isEditing = ref(false);
const saving = ref(false);
const showDeleteDialog = ref(false);
const deleting = ref(false);
const estratoToDelete = ref<CapturaGenericaEmp | null>(null);

// Variables para filtros
const filters = ref({
  codigo: '',
  nombre: ''
});

const filteredEstratos = ref<CapturaGenericaEmp[]>([]);

// Formulario
const form = ref({
  codigo: null as number | null,
  nombre: '',
});

// Columnas de la tabla
const columns = [
  {
    name: 'codigo',
    required: true,
    label: 'Código',
    align: 'left',
    field: 'codigo',
    sortable: true
  },
  {
    name: 'nombre',
    required: true,
    label: 'Nombre',
    align: 'left',
    field: 'nombre',
    sortable: true
  },
  {
    name: 'actions',
    label: 'Acciones',
    align: 'center',
    field: 'actions'
  }
];

// Métodos
const applyFilters = () => {
  let filtered = [...estratos.value];

  // Filtrar por código
  if (filters.value.codigo.trim()) {
    filtered = filtered.filter(estrato => 
      estrato.codigo.toString().toLowerCase().includes(filters.value.codigo.toLowerCase())
    );
  }

  // Filtrar por nombre
  if (filters.value.nombre.trim()) {
    filtered = filtered.filter(estrato => 
      estrato.nombre.toLowerCase().includes(filters.value.nombre.toLowerCase())
    );
  }

  filteredEstratos.value = filtered;
};

const clearFilters = () => {
  filters.value.codigo = '';
  filters.value.nombre = '';
  applyFilters();
};

const getColumnStyle = (column: any) => {
  // Definir anchos específicos para cada columna
  switch (column.name) {
    case 'codigo':
      return 'width: 150px;';
    case 'nombre':
      return 'width: auto;';
    case 'actions':
      return 'width: 120px;';
    default:
      return 'width: auto;';
  }
};

const loadEstratos = async () => {
  if (!codigoEmpresa.value) {
    $q.notify({
      type: 'negative',
      message: 'No se pudo obtener el código de empresa'
    });
    return;
  }

  loading.value = true;
  try {
    const response = await capturaGenericaEmpService.getAll('estratos', codigoEmpresa.value);
    if (response.success) {
      estratos.value = response.data;
      applyFilters(); // Aplicar filtros después de cargar los datos
    } else {
      throw new Error(response.message);
    }
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Error al cargar los estratos'
    });
  } finally {
    loading.value = false;
  }
};

const openDialog = (estrato?: CapturaGenericaEmp) => {
  if (estrato) {
    isEditing.value = true;
    form.value = {
      codigo: estrato.codigo,
      nombre: estrato.nombre,
    };
  } else {
    isEditing.value = false;
    form.value = {
      codigo: null,
      nombre: '',
    };
  }
  showDialog.value = true;
};

const closeDialog = () => {
  showDialog.value = false;
  form.value = {
    codigo: null,
    nombre: '',
  };
};

const onSubmit = async () => {
  if (!form.value.nombre.trim()) {
    $q.notify({
      type: 'negative',
      message: 'El nombre es requerido'
    });
    return;
  }

  if (!codigoEmpresa.value) {
    $q.notify({
      type: 'negative',
      message: 'No se pudo obtener el código de empresa'
    });
    return;
  }

  saving.value = true;
  try {
    const data = {
      codigo: form.value.codigo,
      nombre: form.value.nombre.trim(),
      codigo_empresa: codigoEmpresa.value,
      tabla: 'estratos'
    };

    const response = await capturaGenericaEmpService.createOrUpdate(data);
    
    if (response.success) {
      $q.notify({
        type: 'positive',
        message: response.message
      });
      closeDialog();
      await loadEstratos();
      applyFilters();
    } else {
      throw new Error(response.message);
    }
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Error al guardar el estrato'
    });
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (estrato: CapturaGenericaEmp) => {
  estratoToDelete.value = estrato;
  showDeleteDialog.value = true;
};

const deleteEstrato = async () => {
  if (!estratoToDelete.value || !codigoEmpresa.value) return;

  deleting.value = true;
  try {
    const response = await capturaGenericaEmpService.delete(estratoToDelete.value.codigo, codigoEmpresa.value);
    
    if (response.success) {
      $q.notify({
        type: 'positive',
        message: response.message
      });
      showDeleteDialog.value = false;
      estratoToDelete.value = null;
      await loadEstratos();
    } else {
      throw new Error(response.message);
    }
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Error al eliminar el estrato'
    });
  } finally {
    deleting.value = false;
  }
};

// Cargar datos al montar el componente
onMounted(() => {
  loadEstratos();
});
</script>

<style scoped>
.filter-row table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.filter-row td {
  border: none;
  padding: 4px 8px 8px 8px;
  vertical-align: top;
}

.filter-row .q-input {
  width: 100%;
}

.content-section {
  .grid-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}

@media (max-width: 599px) {
  .page-header .row {
    flex-wrap: wrap;
    row-gap: 8px;
    
    .col {
      width: 100%;
    }
    
    .col-auto {
      width: 100%;
      justify-content: flex-end;
      display: flex;
    }
  }
}
</style>