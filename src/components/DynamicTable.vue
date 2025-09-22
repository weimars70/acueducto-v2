<template>
  <div class="dynamic-table-container">


    <!-- Tabla -->
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th
              v-for="field in displayFields"
              :key="field.name"
              class="table-header"
              :class="{ sortable: field.name !== schema.primaryKey }"
              @click="handleSort(field.name)"
            >
              {{ field.label }}
              <span
                v-if="sortField === field.name"
                class="sort-indicator"
              >
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th class="table-header actions-header">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="loading-row">
            <td :colspan="displayFields.length + 1" class="loading-cell">
              <div class="loading-spinner"></div>
              Cargando datos...
            </td>
          </tr>
          <tr v-else-if="data.length === 0" class="empty-row">
            <td :colspan="displayFields.length + 1" class="empty-cell">
              No se encontraron registros
            </td>
          </tr>
          <tr
            v-else
            v-for="item in paginatedData"
            :key="item[schema.primaryKey]"
            class="table-row"
          >
            <td
              v-for="field in displayFields"
              :key="field.name"
              class="table-cell"
            >
              <span v-if="field.type === 'date' && item[field.name]">
                {{ formatDate(item[field.name]) }}
              </span>
              <span v-else-if="field.type === 'number' && item[field.name] !== null">
                {{ formatNumber(item[field.name]) }}
              </span>
              <span v-else-if="field.type === 'select' && field.options">
                {{ getSelectLabel(field, item[field.name]) }}
              </span>
              <span v-else>
                {{ item[field.name] || '-' }}
              </span>
            </td>
            <td class="table-cell actions-cell">
              <div class="action-buttons">
                <button
                  @click="$emit('edit', item)"
                  class="action-btn edit-btn"
                  title="Editar"
                >
                  ✏️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div v-if="paginationInfo.total > 0" class="pagination">
      <div class="pagination-info">
        Mostrando {{ (paginationInfo.page - 1) * paginationInfo.limit + 1 }} - 
        {{ Math.min(paginationInfo.page * paginationInfo.limit, paginationInfo.total) }} 
        de {{ paginationInfo.total }} registros
      </div>
      <div class="pagination-controls">
        <button
          @click="changePage(1)"
          :disabled="paginationInfo.page === 1"
          class="pagination-btn"
        >
          ⏮️
        </button>
        <button
          @click="changePage(paginationInfo.page - 1)"
          :disabled="paginationInfo.page === 1"
          class="pagination-btn"
        >
          ⏪
        </button>
        <span class="page-info">
          Página {{ paginationInfo.page }} de {{ paginationInfo.totalPages }}
        </span>
        <button
          @click="changePage(paginationInfo.page + 1)"
          :disabled="paginationInfo.page === paginationInfo.totalPages"
          class="pagination-btn"
        >
          ⏩
        </button>
        <button
          @click="changePage(paginationInfo.totalPages)"
          :disabled="paginationInfo.page === paginationInfo.totalPages"
          class="pagination-btn"
        >
          ⏭️
        </button>
      </div>
      <div class="page-size-selector">
        <label for="pageSize">Registros por página:</label>
        <select
          id="pageSize"
          v-model="pageSize"
          @change="handlePageSizeChange"
          class="page-size-select"
        >
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content" @click.stop>
        <h3>Confirmar eliminación</h3>
        <p>¿Está seguro de que desea eliminar este {{ schema.singular.toLowerCase() }}?</p>
        <div class="modal-actions">
          <button @click="cancelDelete" class="btn btn-secondary">
            Cancelar
          </button>
          <button @click="confirmDelete" class="btn btn-danger">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { TableSchema, FieldConfig, DynamicRecord } from '../types/dynamic-maestros';

interface Props {
  schema: TableSchema;
  data: DynamicRecord[];
  loading?: boolean;
  totalRecords?: number;
}

interface Emits {
  (e: 'create'): void;
  (e: 'view', item: DynamicRecord): void;
  (e: 'edit', item: DynamicRecord): void;
  (e: 'delete', item: DynamicRecord): void;
  (e: 'search', query: string): void;
  (e: 'sort', field: string, direction: 'asc' | 'desc'): void;
  (e: 'page-change', page: number): void;
  (e: 'page-size-change', size: number): void;
  (e: 'refresh'): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<Emits>();

// Estado local
const searchQuery = ref('');
const sortField = ref<string>('');
const sortDirection = ref<'asc' | 'desc'>('asc');
const pageSize = ref(10);
const currentPage = ref(1);
const showDeleteModal = ref(false);
const itemToDelete = ref<DynamicRecord | null>(null);

// Computed para paginación
const totalRecords = computed(() => props.totalRecords || props.data.length);
const totalPages = computed(() => Math.ceil(totalRecords.value / pageSize.value));
const paginatedData = computed(() => {
  if (props.totalRecords) {
    // Si se proporciona totalRecords, asumimos que los datos ya vienen paginados del servidor
    return props.data;
  }
  // Si no, paginamos localmente
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return props.data.slice(start, end);
});

const paginationInfo = computed(() => ({
  total: totalRecords.value,
  page: currentPage.value,
  limit: pageSize.value,
  totalPages: totalPages.value
}));

// Computed para campos a mostrar
const displayFields = computed(() => {
  if (props.schema.displayFields) {
    return props.schema.fields.filter(field => 
      props.schema.displayFields!.includes(field.name)
    );
  }
  return props.schema.fields.filter(field => !field.disabled);
});

// Métodos de formateo
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  } catch {
    return dateString;
  }
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('es-ES').format(value);
};

const getSelectLabel = (field: FieldConfig, value: any): string => {
  if (!field.options) return value;
  const option = field.options.find(opt => opt.value === value);
  return option ? option.label : value;
};

// Métodos de interacción
const handleSearch = () => {
  emit('search', searchQuery.value);
};

const handleSort = (fieldName: string) => {
  if (fieldName === props.schema.primaryKey) return;
  
  if (sortField.value === fieldName) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = fieldName;
    sortDirection.value = 'asc';
  }
  
  emit('sort', sortField.value, sortDirection.value);
};

const changePage = (page: number) => {
  currentPage.value = page;
  if (props.totalRecords) {
    // Si hay totalRecords, emitir evento para paginación del servidor
    emit('page-change', page);
  }
};

const handlePageSizeChange = () => {
  currentPage.value = 1; // Reset to first page
  if (props.totalRecords) {
    emit('page-size-change', pageSize.value);
  }
};

const refreshData = () => {
  emit('refresh');
};

const handleDelete = (item: DynamicRecord) => {
  itemToDelete.value = item;
  showDeleteModal.value = true;
};

const confirmDelete = () => {
  if (itemToDelete.value) {
    emit('delete', itemToDelete.value);
    cancelDelete();
  }
};

const cancelDelete = () => {
  showDeleteModal.value = false;
  itemToDelete.value = null;
};

// Watchers
watch(() => props.pagination?.limit, (newLimit) => {
  if (newLimit) {
    pageSize.value = newLimit;
  }
});
</script>

<style scoped>
.dynamic-table-container {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-box {
  position: relative;
}

.search-input {
  padding: 0.5rem 2.5rem 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  width: 300px;
}

.search-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #4b5563;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-danger:hover {
  background-color: #dc2626;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1rem;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.table-header {
  background-color: #f9fafb;
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.table-header.sortable {
  cursor: pointer;
  user-select: none;
}

.table-header.sortable:hover {
  background-color: #f3f4f6;
}

.sort-indicator {
  margin-left: 0.5rem;
  color: #3b82f6;
}

.actions-header {
  width: 120px;
  text-align: center;
}

.table-row {
  border-bottom: 1px solid #e5e7eb;
}

.table-row:hover {
  background-color: #f9fafb;
}

.table-cell {
  padding: 0.75rem;
  color: #374151;
}

.actions-cell {
  text-align: center;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
}

.action-btn {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  background: transparent;
}

.action-btn:hover {
  background-color: #f3f4f6;
}

.loading-row,
.empty-row {
  border-bottom: 1px solid #e5e7eb;
}

.loading-cell,
.empty-cell {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
}

.loading-spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.pagination-info {
  color: #6b7280;
  font-size: 0.875rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn {
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  background: white;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  margin: 0 0.5rem;
  color: #374151;
  font-weight: 500;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.page-size-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  max-width: 400px;
  width: 90%;
}

.modal-content h3 {
  margin: 0 0 1rem 0;
  color: #374151;
}

.modal-content p {
  margin: 0 0 1.5rem 0;
  color: #6b7280;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
</style>