<template>
  <q-page class="q-pa-md">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <div class="title-section">
              <div class="title-icon">
                <q-icon name="handshake" size="32px" />
              </div>
              <h6 class="page-title">Gestión de acuerdos de pago</h6>
            </div>
          </div>
          <div class="header-actions">
            <q-btn
              icon="file_download"
              label="Excel"
              @click="exportToExcel"
              unelevated
              no-caps
              class="export-btn excel-btn q-mr-sm"
            />
            <q-btn
              icon="picture_as_pdf"
              label="PDF"
              @click="exportToPDF"
              unelevated
              no-caps
              class="export-btn pdf-btn q-mr-sm"
            />
            <q-btn
              icon="add"
              label="Cuotas Diferidos"
              @click="goToCuotasDiferidos"
              unelevated
              no-caps
              class="primary-btn"
            />
            <ViewToggle v-model="viewMode" />
          </div>
        </div>
      </div>

      <!-- Filters Card -->
      <div class="filters-section">
        <div class="filters-header" @click="filtersExpanded = !filtersExpanded">
          <div class="filters-title">
            <q-icon name="filter_list" class="filters-icon" />
            <span>Filtros de búsqueda</span>
          </div>
          <q-btn
            :icon="filtersExpanded ? 'expand_less' : 'expand_more'"
            flat
            round
            size="sm"
            class="toggle-btn"
          />
        </div>
        
        <q-slide-transition>
          <div v-show="filtersExpanded" class="filters-content">
            <div class="filters-grid">
              <div class="filter-item">
                <q-input
                  v-model="filters.instalacion_codigo"
                  label="Instalación"
                  outlined
                  dense
                  clearable
                  @update:model-value="applyFilters"
                  debounce="300"
                  class="modern-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="home" />
                  </template>
                </q-input>
              </div>
              
              <div class="filter-item">
                <q-input
                  v-model="filters.nombre"
                  label="Nombre"
                  outlined
                  dense
                  clearable
                  @update:model-value="applyFilters"
                  debounce="300"
                  class="modern-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                </q-input>
              </div>
              
              <div class="filter-item">
                <q-input
                  v-model="filters.fecha_desde"
                  label="Fecha Desde"
                  outlined
                  dense
                  clearable
                  type="date"
                  @update:model-value="applyFilters"
                  class="modern-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="event" />
                  </template>
                </q-input>
              </div>
              
              <div class="filter-item">
                <q-input
                  v-model="filters.fecha_hasta"
                  label="Fecha Hasta"
                  outlined
                  dense
                  clearable
                  type="date"
                  @update:model-value="applyFilters"
                  class="modern-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="event" />
                  </template>
                </q-input>
              </div>
              
              <div class="filter-item">
                <q-btn
                  icon="refresh"
                  label="Limpiar Filtros"
                  outline
                  @click="clearFilters"
                  class="clear-btn full-width"
                  no-caps
                />
              </div>
            </div>
          </div>
        </q-slide-transition>
      </div>

      <!-- Data Section -->
      <div class="data-section">
        <div class="data-header">
          <div class="data-title">
            <q-icon name="table_chart" class="data-icon" />
            <span>Acuerdos de Pago</span>
          </div>
        </div>
        
        <!-- Table View -->
        <div v-if="viewMode === 'list'" class="table-view">
          <q-table
            :rows="data"
            :columns="columns"
            :loading="loading"
            row-key="codigo"
            flat
            bordered
            class="modern-table"
            @request="onRequest"
            binary-state-sort
            :rows-per-page-options="[5, 10, 25, 50, 100]"
            v-model:pagination="pagination"
          >
            <template v-slot:loading>
              <q-inner-loading showing color="primary" />
            </template>

            <template v-slot:body-cell-nombre="props">
              <q-td :props="props">
                <div class="name-cell">
                  <q-icon name="person" class="name-icon" />
                  <span class="name-text">{{ props.value }}</span>
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-saldo="props">
              <q-td :props="props">
                <span class="text-weight-bold text-green-8">
                  ${{ formatCurrency(props.value) }}
                </span>
              </q-td>
            </template>

            <template v-slot:body-cell-cuota="props">
              <q-td :props="props">
                <span class="text-weight-medium">
                  ${{ formatCurrency(props.value) }}
                </span>
              </q-td>
            </template>

            <template v-slot:body-cell-por_interes="props">
              <q-td :props="props">
                <span class="text-weight-medium text-orange-8">
                  {{ props.value }}%
                </span>
              </q-td>
            </template>

            <template v-slot:body-cell-fecha="props">
              <q-td :props="props">
                {{ formatDate(props.value) }}
              </q-td>
            </template>
          </q-table>
        </div>
        
        <!-- Card View -->
        <div v-else class="card-view">
          <div v-if="loading" class="loading-container">
            <q-spinner-dots size="50px" color="primary" />
            <p>Cargando acuerdos de pago...</p>
          </div>
          
          <div v-else-if="data.length === 0" class="no-data-container">
            <q-icon name="inbox" size="64px" color="grey-5" />
            <p>No se encontraron acuerdos de pago</p>
          </div>
          
          <div v-else class="cards-grid">
            <q-card 
              v-for="item in data" 
              :key="item.codigo" 
              class="acuerdo-card"
              @click="viewDetails(item)"
            >
              <q-card-section class="card-header">
                <div class="card-title">
                  <q-icon name="handshake" class="card-icon" />
                  <span class="card-name">{{ item.nombre }}</span>
                </div>
                <q-btn
                  icon="edit"
                  size="sm"
                  flat
                  round
                  @click.stop="goToEdit(item.codigo)"
                  class="edit-btn"
                />
              </q-card-section>
              
              <q-card-section class="card-content">
                <div class="info-row">
                  <span class="info-label">Código:</span>
                  <span class="info-value">{{ item.codigo }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Instalación:</span>
                  <span class="info-value">{{ item.instalacion_codigo }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Fecha:</span>
                  <span class="info-value">{{ formatDate(item.fecha) }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Saldo:</span>
                  <span class="info-value amount">${{ formatCurrency(item.saldo) }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Cuota:</span>
                  <span class="info-value">${{ formatCurrency(item.cuota) }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">% Interés:</span>
                  <span class="info-value interest">{{ item.por_interes }}%</span>
                </div>
              </q-card-section>
            </q-card>
          </div>
          
          <!-- Pagination for Card View -->
          <div v-if="data.length > 0" class="card-pagination">
            <q-pagination
              v-model="pagination.page"
              :max="Math.ceil(pagination.rowsNumber / pagination.rowsPerPage)"
              direction-links
              boundary-links
              @update:model-value="loadData"
              color="primary"
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
import { acuerdosPagoService } from '../services/acuerdos-pago.service';
import { exportService } from '../services/export.service';
import ViewToggle from '../components/ViewToggle.vue';

interface AcuerdoPago {
  codigo: string;
  instalacion_codigo: string;
  nombre: string;
  fecha: Date;
  saldo: number;
  cuota: number;
  por_interes: number;
}

const $q = useQuasar();
const router = useRouter();
const loading = ref(false);
const data = ref<AcuerdoPago[]>([]);
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
    const response = await acuerdosPagoService.getAll({
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      sortBy: pagination.value.sortBy || 'codigo',
      sortOrder,
      filters: filters.value
    });
    data.value = response.data;
    pagination.value.rowsNumber = response.total;
  } catch (error) {
    console.error('Error loading acuerdos pago:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los acuerdos de pago'
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
    const response = await acuerdosPagoService.getAll({
      page,
      limit: rowsPerPage,
      sortBy: sortBy || 'codigo',
      sortOrder,
      filters: filters.value
    });
    data.value = response.data;
    pagination.value.rowsNumber = response.total;
  } catch (error) {
    console.error('Error loading acuerdos pago:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los acuerdos de pago'
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

const formatDate = (dateString: string | Date) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CO');
};

const goToCuotasDiferidos = () => {
  router.push('/diferidos/cuotas-diferidos/nuevo');
};

const goToEdit = (codigo: string) => {
  router.push(`/acuerdos-pago/${codigo}/edit`);
};

const viewDetails = (item: AcuerdoPago) => {
  router.push(`/acuerdos-pago/${item.codigo}`);
};

const exportToExcel = async () => {
  try {
    loading.value = true;
    
    // Obtener todos los registros filtrados sin paginación
    const response = await acuerdosPagoService.getAll({
      page: 1,
      limit: 999999, // Límite muy alto para obtener todos los registros
      sortBy: pagination.value.sortBy || 'codigo',
      sortOrder: pagination.value.descending ? 'DESC' : 'ASC',
      filters: filters.value
    });

    const exportColumns = [
      { key: 'codigo', label: 'Código', width: 10 },
      { key: 'instalacion_codigo', label: 'Instalación', width: 15 },
      { key: 'nombre', label: 'Nombre', width: 25 },
      { key: 'fecha', label: 'Fecha', width: 12 },
      { key: 'saldo', label: 'Saldo', width: 15 },
      { key: 'cuota', label: 'Cuota', width: 15 },
      { key: 'por_interes', label: '% Interés', width: 12 }
    ];

    const filename = exportService.generateFilename('acuerdos_pago');
    
    exportService.exportToExcel({
      filename,
      title: 'Acuerdos de Pago',
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
    const response = await acuerdosPagoService.getAll({
      page: 1,
      limit: 999999, // Límite muy alto para obtener todos los registros
      sortBy: pagination.value.sortBy || 'codigo',
      sortOrder: pagination.value.descending ? 'DESC' : 'ASC',
      filters: filters.value
    });

    const exportColumns = [
      { key: 'codigo', label: 'Código' },
      { key: 'instalacion_codigo', label: 'Instalación' },
      { key: 'nombre', label: 'Nombre' },
      { key: 'fecha', label: 'Fecha' },
      { key: 'saldo', label: 'Saldo' },
      { key: 'cuota', label: 'Cuota' },
      { key: 'por_interes', label: '% Interés' }
    ];

    const filename = exportService.generateFilename('acuerdos_pago');
    
    exportService.exportToPDF({
      filename,
      title: 'Acuerdos de Pago',
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
  max-width: 1400px;
  margin: 0 auto;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #43e97b 100%);
  min-height: 100vh;
  padding: 20px;
  border-radius: 20px;
}

.page-header {
  margin-bottom: 32px;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
    background: rgba(255, 255, 255, 0.95);
    padding: 24px 32px;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
  }
  
  .header-text {
    flex: 1;
    
    .title-section {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .title-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: linear-gradient(135deg, #4facfe, #00f2fe);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 4px 16px rgba(79, 172, 254, 0.3);
      }
      
      .page-title {
        margin: 0;
        background: linear-gradient(135deg, #4facfe, #43e97b);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-weight: 700;
        font-size: 1.8rem;
      }
    }
  }
  
  .header-actions {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
    
    .primary-btn {
      background: linear-gradient(135deg, #4facfe, #00f2fe);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 12px 24px;
      font-weight: 600;
      box-shadow: 0 4px 16px rgba(79, 172, 254, 0.3);
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
      }
    }
    
    .export-btn {
      border: none;
      border-radius: 12px;
      padding: 12px 20px;
      font-weight: 600;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      
      &.excel-btn {
        background: linear-gradient(135deg, #43e97b, #38f9d7);
        color: white;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(67, 233, 123, 0.4);
        }
      }
      
      &.pdf-btn {
        background: linear-gradient(135deg, #4facfe, #00f2fe);
        color: white;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
        }
      }
    }
  }
}

.filters-section {
  margin-bottom: 32px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  overflow: hidden;
  
  .filters-header {
    padding: 20px 32px;
    background: linear-gradient(135deg, rgba(79, 172, 254, 0.1), rgba(67, 233, 123, 0.1));
    border-bottom: 1px solid rgba(79, 172, 254, 0.2);
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;
    
    &:hover {
      background: linear-gradient(135deg, rgba(79, 172, 254, 0.15), rgba(67, 233, 123, 0.15));
    }
    
    .filters-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 600;
      color: #333;
      
      .filters-icon {
        color: #4facfe;
        font-size: 20px;
      }
    }
    
    .toggle-btn {
      color: #4facfe;
    }
  }
  
  .filters-content {
    padding: 32px;
    
    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      align-items: end;
      
      .filter-item {
        .modern-input {
          :deep(.q-field__control) {
            border-radius: 12px;
            
            &:hover {
              border-color: #4facfe;
            }
          }
          
          :deep(.q-field--focused .q-field__control) {
            border-color: #4facfe;
            box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.2);
          }
        }
        
        .clear-btn {
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          padding: 12px 24px;
          color: #666;
          font-weight: 600;
          transition: all 0.3s ease;
          
          &:hover {
            border-color: #4facfe;
            color: #4facfe;
            background: rgba(79, 172, 254, 0.05);
          }
        }
      }
    }
  }
}

.data-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  overflow: hidden;
  
  .data-header {
    padding: 20px 32px;
    background: linear-gradient(135deg, rgba(79, 172, 254, 0.1), rgba(67, 233, 123, 0.1));
    border-bottom: 1px solid rgba(79, 172, 254, 0.2);
    
    .data-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 600;
      color: #333;
      
      .data-icon {
        color: #4facfe;
        font-size: 20px;
      }
    }
  }
  
  .table-view {
    .modern-table {
      :deep(.q-table__top) {
        padding: 24px 32px;
        background: transparent;
      }
      
      :deep(.q-table thead th) {
        background: #f8f9fa;
        font-weight: 600;
        color: #333;
        border-bottom: 2px solid #e0e0e0;
        padding: 16px;
      }
      
      :deep(.q-table tbody tr) {
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(79, 172, 254, 0.05);
        }
      }
      
      :deep(.q-table tbody td) {
        border-bottom: 1px solid #f0f0f0;
        padding: 16px;
      }
      
      .name-cell {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .name-icon {
          color: #4facfe;
          font-size: 18px;
        }
        
        .name-text {
          font-weight: 500;
        }
      }
    }
  }
  
  .card-view {
    padding: 32px;
    
    .loading-container,
    .no-data-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 32px;
      color: #666;
      
      p {
        margin-top: 16px;
        font-size: 16px;
      }
    }
    
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
      
      .acuerdo-card {
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        cursor: pointer;
        border: 1px solid #f0f0f0;
        
        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          border-color: #4facfe;
        }
        
        .card-header {
          padding: 20px 24px 16px;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          .card-title {
            display: flex;
            align-items: center;
            gap: 12px;
            
            .card-icon {
              color: #4facfe;
              font-size: 20px;
            }
            
            .card-name {
              font-weight: 600;
              color: #333;
              font-size: 16px;
            }
          }
          
          .edit-btn {
            color: #4facfe;
            
            &:hover {
              background: rgba(79, 172, 254, 0.1);
            }
          }
        }
        
        .card-content {
          padding: 20px 24px;
          
          .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #f8f9fa;
            
            &:last-child {
              border-bottom: none;
            }
            
            .info-label {
              font-weight: 500;
              color: #666;
              font-size: 14px;
            }
            
            .info-value {
              font-weight: 600;
              color: #333;
              
              &.amount {
                color: #43e97b;
                font-size: 16px;
              }
              
              &.interest {
                color: #ff9800;
              }
            }
          }
        }
      }
    }
    
    .card-pagination {
      display: flex;
      justify-content: center;
      padding-top: 24px;
      border-top: 1px solid #f0f0f0;
    }
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 12px;
    border-radius: 12px;
  }
  
  .page-header {
    .header-content {
      padding: 20px;
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
      
      .title-section {
        .page-title {
          font-size: 1.5rem;
        }
      }
      
      .header-actions {
        justify-content: center;
        flex-wrap: wrap;
      }
    }
  }
  
  .filters-section {
    .filters-header {
      padding: 16px 20px;
    }
    
    .filters-content {
      padding: 20px;
      
      .filters-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }
  }
  
  .data-section {
    .data-header {
      padding: 16px 20px;
    }
    
    .card-view {
      padding: 20px;
      
      .cards-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }
  }
}
</style>