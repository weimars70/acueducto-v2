<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md">
      <div class="col">
        <h4 class="q-my-none">{{ tableConfig?.title || 'Tabla Dinámica' }}</h4>
        <p class="text-grey-6 q-mb-none" v-if="tableConfig?.description">
          {{ tableConfig.description }}
        </p>
      </div>
      <div class="col-auto row items-center q-gutter-sm">
        <q-btn
          color="grey-7"
          icon="arrow_back"
          label="Volver"
          outline
          @click="router.back()"
        />
        <q-input
          v-model="searchQuery"
          placeholder="Buscar..."
          dense
          outlined
          clearable
          @update:model-value="handleSearch"
          style="min-width: 200px"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn
          color="secondary"
          icon="refresh"
          label="Actualizar"
          :loading="loading"
          @click="loadData"
        />
        <q-btn
          v-if="tableConfig?.permissions?.create !== false"
          color="primary"
          icon="add"
          label="Nuevo"
          @click="showCreateForm = true"
        />
      </div>
    </div>

    <!-- Tabla dinámica -->
    <DynamicTable
      v-if="tableConfig"
      :schema="tableConfig.schema"
      :data="tableData"
      :loading="loading"
      :total-records="pagination.rowsNumber"
      @search="handleSearch"
      @sort="handleSort"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
      @edit="handleEdit"
      @delete="handleDelete"
      @refresh="loadData"
    />

    <!-- Diálogo de formulario para crear/editar -->
    <q-dialog v-model="showCreateForm" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">
            {{ editingItem ? 'Editar' : 'Crear' }} {{ tableConfig?.title }}
          </div>
        </q-card-section>

        <q-card-section>
          <DynamicForm
            v-if="tableConfig"
            :fields="tableConfig.schema.fields"
            :initial-data="editingItem"
            @submit="handleSubmit"
            @cancel="closeForm"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Diálogo de confirmación para eliminar -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">
            ¿Estás seguro de que deseas eliminar este registro?
          </span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" @click="showDeleteDialog = false" />
          <q-btn flat label="Eliminar" color="negative" @click="confirmDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import DynamicTable from '../components/DynamicTable.vue';
import DynamicForm from '../components/DynamicForm.vue';
import { getDynamicTableConfig, type DynamicTableConfig } from '../config/dynamic-tables.config';
import { apiClient } from '../services/api/client';
import type { PaginationInfo } from '../types/pagination';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

// Estado reactivo
const tableConfig = ref<DynamicTableConfig | null>(null);
const tableData = ref<any[]>([]);
const loading = ref(false);
const showCreateForm = ref(false);
const showDeleteDialog = ref(false);
const editingItem = ref<any>(null);
const itemToDelete = ref<any>(null);

// Paginación y filtros
const pagination = ref<PaginationInfo>({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  sortBy: '',
  descending: false
});

// Computed para la paginación del componente DynamicTable
const tablePagination = computed(() => ({
  total: pagination.value.rowsNumber,
  page: pagination.value.page,
  limit: pagination.value.rowsPerPage,
  totalPages: Math.ceil(pagination.value.rowsNumber / pagination.value.rowsPerPage)
}));

const searchQuery = ref('');

// Computed
const tableId = computed(() => route.params.tableId as string);

// Métodos
const loadTableConfig = () => {
  const config = getDynamicTableConfig(tableId.value);
  if (!config) {
    $q.notify({
      type: 'negative',
      message: `Configuración no encontrada para la tabla: ${tableId.value}`
    });
    return;
  }
  tableConfig.value = config;
  
  // Configurar paginación inicial
  if (config.schema.sortField) {
    pagination.value.sortBy = config.schema.sortField;
    pagination.value.descending = config.schema.sortOrder === 'desc';
  }
};

const loadData = async () => {
  if (!tableConfig.value) return;
  
  loading.value = true;
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy,
      sortOrder: pagination.value.descending ? 'desc' : 'asc',
      search: searchQuery.value
    };

    const response = await apiClient.get(`/dynamic-maestros/${tableConfig.value.tableName}`, { params });
    
    tableData.value = response.data.data || [];
    pagination.value.rowsNumber = response.data.total || 0;
  } catch (error) {
    console.error('Error loading data:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los datos'
    });
  } finally {
    loading.value = false;
  }
};

const handleSearch = (query: string) => {
  searchQuery.value = query;
  pagination.value.page = 1;
  loadData();
};

const handleSort = (sortBy: string, descending: boolean) => {
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  pagination.value.page = 1;
  loadData();
};

const handlePageChange = (page: number) => {
  pagination.value.page = page;
  loadData();
};

const handlePageSizeChange = (size: number) => {
  pagination.value.rowsPerPage = size;
  pagination.value.page = 1; // Reset to first page
  loadData();
};

const handleEdit = (item: any) => {
  editingItem.value = { ...item };
  showCreateForm.value = true;
};

const handleDelete = (item: any) => {
  itemToDelete.value = item;
  showDeleteDialog.value = true;
};

const handleSubmit = async (formData: any) => {
  if (!tableConfig.value) return;
  
  try {
    if (editingItem.value) {
      // Actualizar
      const id = editingItem.value[tableConfig.value.schema.primaryKey];
      await apiClient.put(`/dynamic-maestros/${tableConfig.value.tableName}/${id}`, formData);
      $q.notify({
        type: 'positive',
        message: 'Registro actualizado exitosamente'
      });
    } else {
      // Crear
      await apiClient.post(`/dynamic-maestros/${tableConfig.value.tableName}`, formData);
      $q.notify({
        type: 'positive',
        message: 'Registro creado exitosamente'
      });
    }
    
    closeForm();
    loadData();
  } catch (error) {
    console.error('Error saving data:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al guardar el registro'
    });
  }
};

const confirmDelete = async () => {
  if (!tableConfig.value || !itemToDelete.value) return;
  
  try {
    const id = itemToDelete.value[tableConfig.value.schema.primaryKey];
    await apiClient.delete(`/dynamic-maestros/${tableConfig.value.tableName}/${id}`);
    
    $q.notify({
      type: 'positive',
      message: 'Registro eliminado exitosamente'
    });
    
    showDeleteDialog.value = false;
    itemToDelete.value = null;
    loadData();
  } catch (error) {
    console.error('Error deleting data:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al eliminar el registro'
    });
  }
};

const closeForm = () => {
  showCreateForm.value = false;
  editingItem.value = null;
};

// Lifecycle
onMounted(() => {
  loadTableConfig();
  if (tableConfig.value) {
    loadData();
  }
});
</script>

<style scoped>
.q-page {
  max-width: 1200px;
  margin: 0 auto;
}
</style>