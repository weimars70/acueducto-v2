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
        <span class="text-h5">{{ config.title }}</span>
      </div>
      <div class="col-auto">
          <div class="row items-center q-gutter-x-xs">
            <ViewToggle v-model="view" />
            <q-btn
              color="primary"
              icon="add"
              :label="`Nuevo ${config.singular}`"
              @click="openDialog()"
            />
          </div>
        </div>
    </div>

    <!-- Filtros -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-sm-4">
            <q-input
              v-model="filters.codigo"
              label="Filtrar por Código"
              placeholder="Ingrese código..."
              outlined
              dense
              clearable
              @update:model-value="applyFilters"
            >
              <template v-slot:prepend>
                <q-icon name="tag" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-4">
            <q-input
              v-model="filters.nombre"
              label="Filtrar por Nombre"
              placeholder="Ingrese nombre..."
              outlined
              dense
              clearable
              @update:model-value="applyFilters"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-4">
            <q-btn
              flat
              icon="clear"
              label="Limpiar Filtros"
              color="grey-7"
              @click="clearFilters"
              class="full-width"
            />
          </div>
        </div>
        <div v-if="filters.codigo || filters.nombre" class="q-mt-sm">
          <q-chip
            v-if="filters.codigo"
            removable
            @remove="filters.codigo = ''"
            color="primary"
            text-color="white"
            icon="tag"
          >
            Código: {{ filters.codigo }}
          </q-chip>
          <q-chip
            v-if="filters.nombre"
            removable
            @remove="filters.nombre = ''"
            color="secondary"
            text-color="white"
            icon="search"
          >
            Nombre: {{ filters.nombre }}
          </q-chip>
        </div>
      </q-card-section>
    </q-card>

    <!-- Vista de tabla o tarjetas -->
    <div class="content-section">
      <template v-if="view === 'list'">
        <!-- Tabla genérica -->
        <q-table
          :rows="filteredItems"
          :columns="columns"
          :loading="loading"
          row-key="codigo"
          flat
          bordered
          :rows-per-page-options="[10, 25, 50]"
          rows-per-page-label="Registros por página:"
          :no-data-label="`No hay ${config.plural} disponibles`"
          :loading-label="`Cargando ${config.plural}...`"
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
          <GenericGrid :items="filteredItems" :config="config" />
        </div>
      </template>
    </div>

    <!-- Dialog para crear/editar -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ isEditing ? 'Editar' : 'Nuevo' }} {{ config.singular }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="onSubmit" class="q-gutter-md">
            <q-input
              v-model="form.nombre"
              :label="`Nombre del ${config.singular}`"
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
          <span class="q-ml-sm">¿Estás seguro de que deseas eliminar este {{ config.singular.toLowerCase() }}?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="showDeleteDialog = false" />
          <q-btn 
            color="negative" 
            label="Eliminar" 
            @click="deleteItem"
            :loading="deleting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { useScreenSize } from '../composables/useScreenSize';
import ViewToggle from '../components/ViewToggle.vue';
import GenericGrid from '../components/GenericGrid.vue';
import type { CapturaGenericaEmp } from '../types/captura-generica-emp';
import { capturaGenericaEmpService } from '../services/api/captura-generica-emp.service';
import { getMaestroConfig } from '../config/maestros.config';

// Configuraciones para diferentes maestros
const maestroConfigs = {
  estratos: {
    title: 'Estratos',
    singular: 'Estrato',
    plural: 'estratos',
    table: 'estratos',
    icon: 'layers'
  },
  marcas_medidor: {
    title: 'Marcas Medidor',
    singular: 'Marca de Medidor',
    plural: 'marcas de medidor',
    table: 'marcas_medidor',
    icon: 'speed'
  }
};

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const { isMobile } = useScreenSize();

// Obtener configuración basada en la ruta
const maestroType = computed(() => {
  const path = route.path;
  if (path.includes('estratos')) return 'estratos';
  if (path.includes('marcas-medidor')) return 'marcas_medidor';
  if (path.includes('profesiones')) return 'profesiones';
  if (path.includes('sectores')) return 'sectores';
  if (path.includes('tipo-persona')) return 'tipo_persona';
  return 'estratos'; // default
});

const config = computed(() => getMaestroConfig(maestroType.value) || maestroConfigs[maestroType.value]);

// Estado reactivo
const items = ref<CapturaGenericaEmp[]>([]);
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const isEditing = ref(false);
const itemToDelete = ref<CapturaGenericaEmp | null>(null);
const view = ref<'list' | 'grid'>('list');

// Formulario
const form = ref({
  codigo: '',
  nombre: '',
  empresa: '',
  tabla: ''
});

// Filtros
const filters = ref({
  codigo: '',
  nombre: ''
});

// Columnas de la tabla
const columns = [
  {
    name: 'codigo',
    required: true,
    label: 'Código',
    align: 'left' as const,
    field: 'codigo',
    sortable: true,
    style: 'width: 150px'
  },
  {
    name: 'nombre',
    required: true,
    label: 'Nombre',
    align: 'left' as const,
    field: 'nombre',
    sortable: true
  },
  {
    name: 'actions',
    label: 'Acciones',
    align: 'center' as const,
    field: 'actions',
    sortable: false,
    style: 'width: 120px'
  }
];

// Computed
const filteredItems = computed(() => {
  let result = items.value;

  if (filters.value.codigo) {
    result = result.filter(item => 
      item.codigo.toLowerCase().includes(filters.value.codigo.toLowerCase())
    );
  }

  if (filters.value.nombre) {
    result = result.filter(item => 
      item.nombre.toLowerCase().includes(filters.value.nombre.toLowerCase())
    );
  }

  return result;
});

// Watchers
watch(isMobile, (newValue) => {
  view.value = newValue ? 'grid' : 'list';
}, { immediate: true });

// Métodos
const getColumnStyle = (column: any) => {
  return column.style || '';
};

const loadItems = async () => {
  try {
    loading.value = true;
    // Obtener código de empresa del localStorage o contexto
    const codigoEmpresa = 1; // Por ahora hardcodeado, debería venir del contexto de usuario
    
    const response = await capturaGenericaEmpService.getAll(config.value.table, codigoEmpresa);
    items.value = response;
  } catch (error) {
    console.error('Error loading items:', error);
    $q.notify({
      type: 'negative',
      message: `Error al cargar ${config.value.plural}`
    });
  } finally {
    loading.value = false;
  }
};

const openDialog = (item?: CapturaGenericaEmp) => {
  if (item) {
    isEditing.value = true;
    form.value = { ...item };
  } else {
    isEditing.value = false;
    form.value = {
      codigo: '',
      nombre: '',
      empresa: '',
      tabla: config.value.table
    };
  }
  showDialog.value = true;
};

const closeDialog = () => {
  showDialog.value = false;
  form.value = {
    codigo: '',
    nombre: '',
    empresa: '',
    tabla: ''
  };
};

const onSubmit = async () => {
  try {
    saving.value = true;
    
    // Obtener código de empresa del localStorage o contexto
    const codigoEmpresa = 1; // Por ahora hardcodeado, debería venir del contexto de usuario
    
    const data = {
      codigo: form.value.codigo,
      nombre: form.value.nombre,
      codigo_empresa: codigoEmpresa,
      tabla: config.value.table
    };
    
    await capturaGenericaEmpService.createOrUpdate(data);
    
    $q.notify({
      type: 'positive',
      message: `${config.value.singular} ${isEditing.value ? 'actualizado' : 'creado'} correctamente`
    });
    
    closeDialog();
    await loadItems();
  } catch (error) {
    console.error('Error saving item:', error);
    $q.notify({
      type: 'negative',
      message: `Error al guardar ${config.value.singular.toLowerCase()}`
    });
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (item: CapturaGenericaEmp) => {
  itemToDelete.value = item;
  showDeleteDialog.value = true;
};

const deleteItem = async () => {
  if (!itemToDelete.value) return;
  
  try {
    deleting.value = true;
    // Obtener código de empresa del localStorage o contexto
    const codigoEmpresa = 1; // Por ahora hardcodeado, debería venir del contexto de usuario
    
    await capturaGenericaEmpService.delete(itemToDelete.value.codigo, codigoEmpresa);
    $q.notify({
      type: 'positive',
      message: `${config.value.singular} eliminado correctamente`
    });
    showDeleteDialog.value = false;
    await loadItems();
  } catch (error) {
    console.error('Error deleting item:', error);
    $q.notify({
      type: 'negative',
      message: `Error al eliminar ${config.value.singular.toLowerCase()}`
    });
  } finally {
    deleting.value = false;
  }
};

const applyFilters = () => {
  // Los filtros se aplican automáticamente a través del computed
};

const clearFilters = () => {
  filters.value = {
    codigo: '',
    nombre: ''
  };
};

// Lifecycle
onMounted(() => {
  loadItems();
});
</script>

<style scoped>
.filter-row table {
  border-collapse: collapse;
}

.filter-row td {
  border: none;
}

.content-section .grid-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

@media (max-width: 600px) {
  .content-section .grid-container {
    flex-direction: column;
  }
}
</style>