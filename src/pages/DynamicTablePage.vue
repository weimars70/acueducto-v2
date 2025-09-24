<template>
  <q-page class="dynamic-table-page">
    <div class="page-container">
      <!-- Header Section -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-left">
            <div class="title-section">
              <div class="title-icon">
                <q-icon name="table_view" size="24px" />
              </div>
              <div class="title-text">
                <h1 class="page-title">{{ tableConfig?.title || 'Tabla Dinámica' }}</h1>
                <p class="page-subtitle" v-if="tableConfig?.description">
                  {{ tableConfig.description }}
                </p>
              </div>
            </div>
          </div>
          <div class="header-right">
            <q-btn
              color="grey-7"
              icon="arrow_back"
              label="Volver"
              outline
              @click="router.back()"
              class="back-btn"
            />
            <q-input
              v-model="searchQuery"
              placeholder="Buscar..."
              dense
              outlined
              clearable
              @update:model-value="handleSearch"
              style="min-width: 200px"
              class="search-input"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="green-6" />
              </template>
            </q-input>
            <q-btn
              color="green-6"
              icon="refresh"
              label="Actualizar"
              :loading="loading"
              @click="loadData"
              class="refresh-btn"
            />
            <q-btn
              v-if="tableConfig?.permissions?.create !== false"
              class="add-btn"
              unelevated
              @click="showCreateForm = true"
            >
              <q-icon name="add" size="18px" />
              <span>Nuevo</span>
            </q-btn>
          </div>
        </div>
      </div>

      <!-- Dynamic Table -->
      <div class="table-container">
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
          class="custom-dynamic-table"
        />
      </div>

      <!-- Diálogo de formulario para crear/editar -->
      <q-dialog v-model="showCreateForm" persistent>
        <q-card class="form-dialog" style="min-width: 500px">
          <q-card-section class="dialog-header">
            <div class="dialog-title">
              <q-icon name="edit" size="20px" color="green-6" />
              <span>{{ editingItem ? 'Editar' : 'Crear' }} {{ tableConfig?.title }}</span>
            </div>
          </q-card-section>

          <q-card-section class="dialog-content">
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
        <q-card class="delete-dialog">
          <q-card-section class="delete-dialog-content">
            <div class="delete-icon">
              <q-avatar icon="warning" color="red-6" text-color="white" size="48px" />
            </div>
            <div class="delete-text">
              <div class="delete-title">Confirmar eliminación</div>
              <div class="delete-message">
                ¿Estás seguro de que deseas eliminar este registro?
              </div>
            </div>
          </q-card-section>

          <q-card-actions class="delete-actions" align="right">
            <q-btn 
              flat 
              label="Cancelar" 
              color="grey-7" 
              @click="showDeleteDialog = false"
              class="cancel-btn"
            />
            <q-btn 
              unelevated
              label="Eliminar" 
              color="red-6" 
              @click="confirmDelete"
              class="delete-btn"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
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
.dynamic-table-page {
  background: linear-gradient(135deg, #f8fffe 0%, #f0fdf4 100%);
  min-height: 100vh;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

/* Header Styles */
.page-header {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(34, 197, 94, 0.08);
  margin-bottom: 24px;
  border: 1px solid rgba(34, 197, 94, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  gap: 24px;
}

.header-left {
  flex: 1;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 4px 0 0 0;
  line-height: 1.4;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.add-btn {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
}

.back-btn {
  border-color: #d1d5db;
  color: #6b7280;
  border-radius: 8px;
}

.search-input {
  border-radius: 8px;
}

.refresh-btn {
  border-radius: 8px;
}

/* Table Container */
.table-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.1);
  overflow: hidden;
}

.custom-dynamic-table {
  border-radius: 16px;
}

/* Dialog Styles */
.form-dialog {
  border-radius: 16px;
  overflow: hidden;
}

.dialog-header {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-bottom: 1px solid rgba(34, 197, 94, 0.1);
}

.dialog-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.dialog-content {
  padding: 24px;
}

/* Delete Dialog */
.delete-dialog {
  border-radius: 16px;
  overflow: hidden;
  min-width: 400px;
}

.delete-dialog-content {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 32px;
}

.delete-text {
  flex: 1;
}

.delete-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.delete-message {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.5;
}

.delete-actions {
  padding: 20px 32px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  gap: 12px;
}

.cancel-btn {
  padding: 8px 20px;
  border-radius: 8px;
}

.delete-btn {
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .page-container {
    padding: 16px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
    padding: 20px;
  }
  
  .header-right {
    justify-content: center;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .delete-dialog-content {
    flex-direction: column;
    text-align: center;
    padding: 24px;
  }
}
</style>