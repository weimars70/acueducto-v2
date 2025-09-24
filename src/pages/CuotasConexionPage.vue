<template>
  <q-page class="modern-page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <div class="title-icon">
              <q-icon name="account_balance" class="header-icon" />
            </div>
            <div class="title-text">
              <h4 class="page-title">Cuotas de Conexión</h4>
              <p class="page-subtitle">Gestión y seguimiento de cuotas de conexión</p>
            </div>
          </div>
          
          <div class="header-actions">
            <div class="view-controls">
              <ViewToggle v-model="viewMode" :options="['list', 'grid']" />
            </div>
            
            <div class="action-buttons">
              <q-btn
                class="modern-btn export-btn excel-btn"
                icon="file_download"
                label="Excel"
                @click="exportToExcel"
                :loading="loading"
                no-caps
                unelevated
              />
              <q-btn
                class="modern-btn export-btn pdf-btn"
                icon="picture_as_pdf"
                label="PDF"
                @click="exportToPDF"
                :loading="loading"
                no-caps
                unelevated
              />
              <q-btn
                class="modern-btn primary-btn"
                icon="add_circle"
                label="Nueva Cuota"
                @click="goToNewForm"
                no-caps
                unelevated
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Card -->
      <div class="filters-section">
        <q-card class="modern-filters-card">
          <q-card-section class="filters-header">
            <div class="filters-title">
              <q-icon name="filter_list" class="filters-icon" />
              <span class="filters-label">Filtros de Búsqueda</span>
            </div>
            <q-btn
              class="toggle-filters-btn"
              :icon="filtersExpanded ? 'expand_less' : 'expand_more'"
              flat
              round
              @click="filtersExpanded = !filtersExpanded"
            />
          </q-card-section>
          
          <q-slide-transition>
            <q-card-section v-show="filtersExpanded" class="filters-content">
              <div class="filters-grid">
                <div class="filter-item">
                  <q-input
                    v-model="filters.instalacion_codigo"
                    label="Código de Instalación"
                    class="modern-input"
                    outlined
                    clearable
                    @update:model-value="applyFilters"
                    debounce="300"
                  >
                    <template v-slot:prepend>
                      <q-icon name="home" class="input-icon" />
                    </template>
                  </q-input>
                </div>
                
                <div class="filter-item">
                  <q-input
                    v-model="filters.nombre"
                    label="Nombre del Cliente"
                    class="modern-input"
                    outlined
                    clearable
                    @update:model-value="applyFilters"
                    debounce="300"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person" class="input-icon" />
                    </template>
                  </q-input>
                </div>
                
                <div class="filter-item">
                  <q-input
                    v-model="filters.fecha_desde"
                    label="Fecha Desde"
                    class="modern-input"
                    outlined
                    clearable
                    type="date"
                    @update:model-value="applyFilters"
                  >
                    <template v-slot:prepend>
                      <q-icon name="event" class="input-icon" />
                    </template>
                  </q-input>
                </div>
                
                <div class="filter-item">
                  <q-input
                    v-model="filters.fecha_hasta"
                    label="Fecha Hasta"
                    class="modern-input"
                    outlined
                    clearable
                    type="date"
                    @update:model-value="applyFilters"
                  >
                    <template v-slot:prepend>
                      <q-icon name="event" class="input-icon" />
                    </template>
                  </q-input>
                </div>
                
                <div class="filter-actions">
                  <q-btn
                    class="modern-btn clear-btn"
                    icon="refresh"
                    label="Limpiar Filtros"
                    @click="clearFilters"
                    no-caps
                    unelevated
                  />
                </div>
              </div>
            </q-card-section>
          </q-slide-transition>
        </q-card>
      </div>

      <!-- Data Content -->
      <div class="data-section">
        <!-- Vista de Tabla -->
        <q-card v-if="viewMode === 'list'" class="modern-data-card table-view">
          <q-card-section class="table-header">
            <div class="table-title">
              <q-icon name="table_view" class="table-icon" />
              <span class="table-label">Lista de Cuotas de Conexión</span>
            </div>
            <div class="table-info">
              <q-chip class="info-chip" icon="info" color="teal-1" text-color="teal-8">
                {{ pagination.rowsNumber }} registros
              </q-chip>
            </div>
          </q-card-section>
          
          <q-card-section class="q-pa-none">
            <q-table
              :rows="data"
              :columns="columns"
              :loading="loading"
              row-key="codigo"
              flat
              class="modern-table"
              @request="onRequest"
              binary-state-sort
              :rows-per-page-options="[5, 10, 25, 50, 100]"
              v-model:pagination="pagination"
            >
              <template v-slot:loading>
                <q-inner-loading showing>
                  <div class="loading-content">
                    <q-spinner-dots size="50px" color="teal" />
                    <p class="loading-text">Cargando cuotas...</p>
                  </div>
                </q-inner-loading>
              </template>

              <template v-slot:body-cell-codigo="props">
                <q-td :props="props">
                  <div class="code-cell">
                    <q-chip class="code-chip" color="blue-1" text-color="blue-8">
                      #{{ props.value }}
                    </q-chip>
                  </div>
                </q-td>
              </template>

              <template v-slot:body-cell-instalacion_codigo="props">
                <q-td :props="props">
                  <div class="installation-cell">
                    <q-icon name="home" class="cell-icon" />
                    <span class="cell-text">{{ props.value }}</span>
                  </div>
                </q-td>
              </template>

              <template v-slot:body-cell-nombre="props">
                <q-td :props="props">
                  <div class="name-cell">
                    <q-icon name="person" class="cell-icon" />
                    <span class="cell-text">{{ props.value }}</span>
                  </div>
                </q-td>
              </template>

              <template v-slot:body-cell-saldo="props">
                <q-td :props="props">
                  <div class="amount-cell saldo">
                    <q-chip class="amount-chip saldo-chip" icon="account_balance_wallet">
                      ${{ formatCurrency(props.value) }}
                    </q-chip>
                  </div>
                </q-td>
              </template>

              <template v-slot:body-cell-cuota="props">
                <q-td :props="props">
                  <div class="amount-cell cuota">
                    <q-chip class="amount-chip cuota-chip" icon="payments">
                      ${{ formatCurrency(props.value) }}
                    </q-chip>
                  </div>
                </q-td>
              </template>

              <template v-slot:body-cell-por_interes="props">
                <q-td :props="props">
                  <div class="percentage-cell">
                    <q-chip class="percentage-chip" icon="percent" color="orange-1" text-color="orange-8">
                      {{ props.value }}%
                    </q-chip>
                  </div>
                </q-td>
              </template>

              <template v-slot:body-cell-fecha="props">
                <q-td :props="props">
                  <div class="date-cell">
                    <q-icon name="event" class="cell-icon" />
                    <span class="cell-text">{{ formatDate(props.value) }}</span>
                  </div>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>

        <!-- Vista de Tarjetas -->
        <div v-else class="cards-view">
          <div class="cards-header">
            <div class="cards-title">
              <q-icon name="grid_view" class="cards-icon" />
              <span class="cards-label">Tarjetas de Cuotas de Conexión</span>
            </div>
            <div class="cards-info">
              <q-chip class="info-chip" icon="info" color="teal-1" text-color="teal-8">
                {{ data.length }} de {{ pagination.rowsNumber }} registros
              </q-chip>
            </div>
          </div>
          
          <div v-if="loading" class="cards-loading">
            <div class="loading-content">
              <q-spinner-dots size="50px" color="teal" />
              <p class="loading-text">Cargando cuotas...</p>
            </div>
          </div>
          
          <div v-else class="cards-grid">
            <div v-for="item in data" :key="item.codigo" class="cuota-card">
              <q-card class="modern-cuota-card">
                <q-card-section class="card-header">
                  <div class="card-title">
                    <q-chip class="code-chip" color="blue-1" text-color="blue-8" icon="tag">
                      #{{ item.codigo }}
                    </q-chip>
                    <q-chip class="status-chip" color="green-1" text-color="green-8" icon="check_circle">
                      Activa
                    </q-chip>
                  </div>
                </q-card-section>
                
                <q-card-section class="card-content">
                  <div class="info-row">
                    <div class="info-item">
                      <q-icon name="home" class="info-icon" />
                      <div class="info-text">
                        <span class="info-label">Instalación</span>
                        <span class="info-value">{{ item.instalacion_codigo }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="info-row">
                    <div class="info-item">
                      <q-icon name="person" class="info-icon" />
                      <div class="info-text">
                        <span class="info-label">Cliente</span>
                        <span class="info-value">{{ item.nombre }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="info-row">
                    <div class="info-item">
                      <q-icon name="event" class="info-icon" />
                      <div class="info-text">
                        <span class="info-label">Fecha</span>
                        <span class="info-value">{{ formatDate(item.fecha) }}</span>
                      </div>
                    </div>
                  </div>
                </q-card-section>
                
                <q-card-section class="card-amounts">
                  <div class="amount-grid">
                    <div class="amount-item saldo">
                      <div class="amount-icon">
                        <q-icon name="account_balance_wallet" />
                      </div>
                      <div class="amount-info">
                        <span class="amount-label">Saldo</span>
                        <span class="amount-value">${{ formatCurrency(item.saldo) }}</span>
                      </div>
                    </div>
                    
                    <div class="amount-item cuota">
                      <div class="amount-icon">
                        <q-icon name="payments" />
                      </div>
                      <div class="amount-info">
                        <span class="amount-label">Cuota</span>
                        <span class="amount-value">${{ formatCurrency(item.cuota) }}</span>
                      </div>
                    </div>
                    
                    <div class="amount-item interes">
                      <div class="amount-icon">
                        <q-icon name="percent" />
                      </div>
                      <div class="amount-info">
                        <span class="amount-label">Interés</span>
                        <span class="amount-value">{{ item.por_interes }}%</span>
                      </div>
                    </div>
                  </div>
                </q-card-section>
                
                <q-card-actions class="card-actions">
                  <q-btn
                    class="action-btn view-btn"
                    icon="visibility"
                    label="Ver Detalle"
                    flat
                    no-caps
                  />
                  <q-btn
                    class="action-btn edit-btn"
                    icon="edit"
                    label="Editar"
                    flat
                    no-caps
                  />
                </q-card-actions>
              </q-card>
            </div>
          </div>
          
          <!-- Paginación para vista de tarjetas -->
          <div v-if="!loading && data.length > 0" class="cards-pagination">
            <q-pagination
              v-model="pagination.page"
              :max="Math.ceil(pagination.rowsNumber / pagination.rowsPerPage)"
              :max-pages="6"
              direction-links
              boundary-links
              color="teal"
              @update:model-value="loadData"
            />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { cuotasConexionService } from '../services/cuotas-conexion.service';
import { exportService } from '../services/export.service';
import ViewToggle from '../components/ViewToggle.vue';

interface CuotaConexion {
  codigo: number;
  instalacion_codigo: number;
  nombre: string;
  fecha: string;
  saldo: number;
  cuota: number;
  por_interes: number;
}

const $q = useQuasar();
const router = useRouter();
const loading = ref(false);
const data = ref<CuotaConexion[]>([]);
const viewMode = ref<'grid' | 'list'>('list');
const filtersExpanded = ref(true);

const filters = ref({
  instalacion_codigo: '',
  nombre: '',
  fecha_desde: '',
  fecha_hasta: ''
});

const pagination = ref({
  sortBy: 'codigo',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
});

const columns = [
  {
    name: 'codigo',
    required: true,
    label: 'Código',
    align: 'left' as const,
    field: 'codigo',
    sortable: true
  },
  {
    name: 'instalacion_codigo',
    label: 'Instalación',
    align: 'left' as const,
    field: 'instalacion_codigo',
    sortable: true
  },
  {
    name: 'nombre',
    label: 'Nombre',
    align: 'left' as const,
    field: 'nombre',
    sortable: true
  },
  {
    name: 'fecha',
    label: 'Fecha',
    align: 'center' as const,
    field: 'fecha',
    sortable: true
  },
  {
    name: 'saldo',
    label: 'Saldo',
    align: 'right' as const,
    field: 'saldo',
    sortable: true
  },
  {
    name: 'cuota',
    label: 'Cuota',
    align: 'right' as const,
    field: 'cuota',
    sortable: true
  },
  {
    name: 'por_interes',
    label: '% Interés',
    align: 'center' as const,
    field: 'por_interes',
    sortable: true
  }
];



const loadData = async () => {
  try {
    loading.value = true;
    const sortOrder = pagination.value.descending ? 'DESC' : 'ASC';
    const response = await cuotasConexionService.getCuotasConexion(
      pagination.value.page, 
      pagination.value.rowsPerPage, 
      filters.value,
      pagination.value.sortBy || 'fecha',
      sortOrder
    );
    data.value = response.data;
    pagination.value.rowsNumber = response.total;
  } catch (error) {
    console.error('Error loading cuotas conexion:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las cuotas de conexión'
    });
  } finally {
    loading.value = false;
  }
};

const onRequest = async (props: any) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  
  try {
    loading.value = true;
    const sortOrder = descending ? 'DESC' : 'ASC';
    const response = await cuotasConexionService.getCuotasConexion(
      page, 
      rowsPerPage, 
      filters.value,
      sortBy || 'fecha',
      sortOrder
    );
    data.value = response.data;
    pagination.value.rowsNumber = response.total;
  } catch (error) {
    console.error('Error loading cuotas conexion:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las cuotas de conexión'
    });
  } finally {
    loading.value = false;
  }
};

const applyFilters = async () => {
  pagination.value.page = 1;
  await loadData();
};

const clearFilters = async () => {
  filters.value = {
    instalacion_codigo: '',
    nombre: '',
    fecha_desde: '',
    fecha_hasta: ''
  };
  pagination.value.page = 1;
  await loadData();
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CO');
};

const goToNewForm = () => {
  router.push('/cuotas-conexion/nuevo');
};

const exportToExcel = async () => {
  try {
    loading.value = true;
    
    // Obtener todos los registros filtrados sin paginación
    const response = await cuotasConexionService.getCuotasConexion(
      1, // page
      999999, // limit - límite muy alto para obtener todos los registros
      filters.value, // filters
      pagination.value.sortBy || 'codigo', // sortBy
      pagination.value.descending ? 'DESC' : 'ASC' // sortOrder
    );

    const exportColumns = [
      { key: 'codigo', label: 'Código', width: 10 },
      { key: 'instalacion_codigo', label: 'Instalación', width: 15 },
      { key: 'nombre', label: 'Nombre', width: 25 },
      { key: 'fecha', label: 'Fecha', width: 12 },
      { key: 'saldo', label: 'Saldo', width: 15 },
      { key: 'cuota', label: 'Cuota', width: 15 },
      { key: 'por_interes', label: '% Interés', width: 12 }
    ];

    const filename = exportService.generateFilename('cuotas_conexion');
    
    exportService.exportToExcel({
      filename,
      title: 'Cuotas de Conexión',
      columns: exportColumns,
      data: response.data
    });

    $q.notify({
      type: 'positive',
      message: `Archivo Excel generado exitosamente con ${response.data.length} registros`,
      position: 'center'
    });
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al generar archivo Excel',
      position: 'center'
    });
  } finally {
    loading.value = false;
  }
};

const exportToPDF = async () => {
  try {
    loading.value = true;
    
    // Obtener todos los registros filtrados sin paginación
    const response = await cuotasConexionService.getCuotasConexion(
      1, // page
      999999, // limit - límite muy alto para obtener todos los registros
      filters.value, // filters
      pagination.value.sortBy || 'codigo', // sortBy
      pagination.value.descending ? 'DESC' : 'ASC' // sortOrder
    );

    const exportColumns = [
      { key: 'codigo', label: 'Código' },
      { key: 'instalacion_codigo', label: 'Instalación' },
      { key: 'nombre', label: 'Nombre' },
      { key: 'fecha', label: 'Fecha' },
      { key: 'saldo', label: 'Saldo' },
      { key: 'cuota', label: 'Cuota' },
      { key: 'por_interes', label: '% Interés' }
    ];

    const filename = exportService.generateFilename('cuotas_conexion');
    
    exportService.exportToPDF({
      filename,
      title: 'Cuotas de Conexión',
      columns: exportColumns,
      data: response.data
    });

    $q.notify({
      type: 'positive',
      message: `Archivo PDF generado exitosamente con ${response.data.length} registros`,
      position: 'center'
    });
  } catch (error) {
    console.error('Error al exportar a PDF:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al generar archivo PDF',
      position: 'center'
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
  
  .page-title {
    margin: 0 0 8px 0;
    color: #1976d2;
    font-weight: 600;
  }
  
  .page-subtitle {
    margin: 0;
    color: #666;
    font-size: 14px;
  }
}

.filters-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .q-card-section {
    padding: 20px;
  }
}

.data-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .cuotas-table {
    :deep(.q-table__top) {
      padding: 16px;
      background: #f8f9fa;
      border-radius: 12px 12px 0 0;
    }
    
    :deep(.q-table thead th) {
      background: #f8f9fa;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #e0e0e0;
    }
    
    :deep(.q-table tbody tr:hover) {
      background: rgba(25, 118, 210, 0.05);
    }
    
    :deep(.q-table tbody td) {
      border-bottom: 1px solid #f0f0f0;
    }
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 0 8px;
  }
  
  .filters-card .q-card-section {
    padding: 16px;
  }
  
  .page-header .page-title {
    font-size: 1.5rem;
  }
}
</style>