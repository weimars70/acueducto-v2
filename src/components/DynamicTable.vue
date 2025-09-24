<template>
  <div class="dynamic-table-container">
    <!-- Controls Section -->
    <div class="table-controls">
      <div class="controls-left">
        <div class="view-toggle">
          <button 
            :class="['toggle-btn', { active: viewMode === 'table' }]"
            @click="viewMode = 'table'"
          >
            <q-icon name="table_view" size="16px" />
            <span>Tabla</span>
          </button>
          <button 
            :class="['toggle-btn', { active: viewMode === 'cards' }]"
            @click="viewMode = 'cards'"
          >
            <q-icon name="view_module" size="16px" />
            <span>Tarjetas</span>
          </button>
        </div>
      </div>
      <div class="controls-right">
        <div class="search-container">
          <q-input
            v-model="searchQuery"
            placeholder="Buscar registros..."
            outlined
            dense
            class="search-input"
            @update:model-value="handleSearch"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="green-6" />
            </template>
            <template v-slot:append v-if="searchQuery">
              <q-icon 
                name="clear" 
                class="cursor-pointer" 
                color="grey-5"
                @click="searchQuery = ''; handleSearch()"
              />
            </template>
          </q-input>
        </div>
        <q-btn
          class="refresh-btn"
          round
          dense
          @click="refreshData"
          :loading="loading"
        >
          <q-icon name="refresh" size="16px" />
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Table View -->
    <div v-if="viewMode === 'table'" class="table-view">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr class="table-header-row">
              <th
                v-for="field in displayFields"
                :key="field.name"
                class="table-header"
                :class="{ sortable: field.name !== schema.primaryKey }"
                @click="handleSort(field.name)"
              >
                <div class="header-content">
                  <span class="header-label">{{ field.label }}</span>
                  <q-icon
                    v-if="sortField === field.name"
                    :name="sortDirection === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
                    class="sort-icon"
                    size="16px"
                  />
                </div>
              </th>
              <th class="table-header actions-header">
                <div class="header-content">
                  <span class="header-label">Acciones</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" class="loading-row">
              <td :colspan="displayFields.length + 1" class="loading-cell">
                <div class="loading-content">
                  <q-spinner-dots color="green-6" size="24px" />
                  <span>Cargando datos...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="data.length === 0" class="empty-row">
              <td :colspan="displayFields.length + 1" class="empty-cell">
                <div class="empty-content">
                  <q-icon name="inbox" size="48px" color="grey-4" />
                  <div class="empty-text">No se encontraron registros</div>
                  <div class="empty-subtext">No hay datos disponibles para mostrar</div>
                </div>
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
                <div class="cell-content">
                  <span v-if="field.type === 'date' && item[field.name]" class="cell-value">
                    {{ formatDate(item[field.name]) }}
                  </span>
                  <span v-else-if="field.type === 'number' && item[field.name] !== null" class="cell-value number">
                    {{ formatNumber(item[field.name]) }}
                  </span>
                  <span v-else-if="field.type === 'select' && field.options" class="cell-value">
                    {{ getSelectLabel(field, item[field.name]) }}
                  </span>
                  <span v-else class="cell-value">
                    {{ item[field.name] || '-' }}
                  </span>
                </div>
              </td>
              <td class="table-cell actions-cell">
                <div class="action-buttons">
                  <q-btn
                    class="action-btn edit-btn"
                    round
                    dense
                    size="sm"
                    @click="$emit('edit', item)"
                  >
                    <q-icon name="edit" size="14px" />
                    <q-tooltip>Editar</q-tooltip>
                  </q-btn>
                  <q-btn
                    class="action-btn delete-btn"
                    round
                    dense
                    size="sm"
                    @click="handleDelete(item)"
                  >
                    <q-icon name="delete" size="14px" />
                    <q-tooltip>Eliminar</q-tooltip>
                  </q-btn>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Cards View -->
    <div v-else class="cards-view">
      <div v-if="loading" class="cards-loading">
        <div class="loading-content">
          <q-spinner-dots color="green-6" size="32px" />
          <span>Cargando datos...</span>
        </div>
      </div>
      <div v-else-if="data.length === 0" class="cards-empty">
        <div class="empty-content">
          <q-icon name="view_module" size="64px" color="grey-4" />
          <div class="empty-text">No hay registros</div>
          <div class="empty-subtext">No se encontraron datos para mostrar</div>
        </div>
      </div>
      <div v-else class="cards-grid">
        <div 
          v-for="item in paginatedData" 
          :key="item[schema.primaryKey]"
          class="data-card"
        >
          <div class="card-header">
            <div class="card-icon">
              <q-icon name="description" size="20px" />
            </div>
            <div class="card-actions">
              <q-btn
                class="card-action-btn edit-btn"
                round
                dense
                size="sm"
                @click="$emit('edit', item)"
              >
                <q-icon name="edit" size="12px" />
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                class="card-action-btn delete-btn"
                round
                dense
                size="sm"
                @click="handleDelete(item)"
              >
                <q-icon name="delete" size="12px" />
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </div>
          </div>
          
          <div class="card-content">
            <div 
              v-for="field in displayFields" 
              :key="field.name"
              class="field-item"
            >
              <div class="field-label">{{ field.label }}</div>
              <div class="field-value">
                <span v-if="field.type === 'date' && item[field.name]">
                  {{ formatDate(item[field.name]) }}
                </span>
                <span v-else-if="field.type === 'number' && item[field.name] !== null" class="number-value">
                  {{ formatNumber(item[field.name]) }}
                </span>
                <span v-else-if="field.type === 'select' && field.options">
                  {{ getSelectLabel(field, item[field.name]) }}
                </span>
                <span v-else>
                  {{ item[field.name] || '-' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
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
const viewMode = ref('table'); // 'table' or 'cards'

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
  currentPage.value = 1;
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

.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f0fdf4;
}

.controls-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.controls-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.view-toggle {
  display: flex;
  background: white;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  overflow: hidden;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.toggle-btn:hover {
  background-color: #f3f4f6;
}

.toggle-btn.active {
  background-color: #16a34a;
  color: white;
}

.search-container {
  position: relative;
}

.search-input {
  width: 300px;
}

.refresh-btn {
  background-color: #16a34a;
  color: white;
}

.refresh-btn:hover {
  background-color: #15803d;
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
  background-color: #16a34a;
  color: white;
}

.btn-primary:hover {
  background-color: #15803d;
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
  background-color: #f0fdf4;
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
  background-color: #dcfce7;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sort-icon {
  color: #16a34a;
}

.table-view {
  overflow-x: auto;
}

.table-wrapper {
  min-width: 100%;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.table-row:hover {
  background-color: #f0fdf4;
}

.table-cell {
  padding: 0.75rem;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
}

.cell-content {
  display: flex;
  align-items: center;
}

.cell-value.number {
  font-family: monospace;
  text-align: right;
}

.actions-cell {
  text-align: center;
  width: 120px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
}

.action-btn {
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.action-btn.edit-btn {
  color: #16a34a;
  border-color: #16a34a;
}

.action-btn.edit-btn:hover {
  background-color: #16a34a;
  color: white;
}

.action-btn.delete-btn {
  color: #ef4444;
  border-color: #ef4444;
}

.action-btn.delete-btn:hover {
  background-color: #ef4444;
  color: white;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: #6b7280;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
}

.empty-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
}

.empty-subtext {
  color: #6b7280;
}

.cards-view {
  padding: 1rem;
}

.cards-loading,
.cards-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.data-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: all 0.15s ease-in-out;
}

.data-card:hover {
  border-color: #16a34a;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f0fdf4;
  border-bottom: 1px solid #e5e7eb;
}

.card-icon {
  color: #16a34a;
}

.card-actions {
  display: flex;
  gap: 0.25rem;
}

.card-action-btn {
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.card-action-btn.edit-btn {
  color: #16a34a;
  border-color: #16a34a;
}

.card-action-btn.edit-btn:hover {
  background-color: #16a34a;
  color: white;
}

.card-action-btn.delete-btn {
  color: #ef4444;
  border-color: #ef4444;
}

.card-action-btn.delete-btn:hover {
  background-color: #ef4444;
  color: white;
}

.card-content {
  padding: 1rem;
}

.field-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.field-item:last-child {
  border-bottom: none;
}

.field-label {
  font-weight: 500;
  color: #6b7280;
  font-size: 0.875rem;
}

.field-value {
  color: #374151;
  font-weight: 500;
}

.number-value {
  font-family: monospace;
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
  background-color: #f0fdf4;
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
  background-color: #dcfce7;
  border-color: #16a34a;
  color: #16a34a;
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