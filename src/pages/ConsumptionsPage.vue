<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { io } from 'socket.io-client';
import { consumptionService } from '../services/api';
import { exportService } from '../services/export.service';
import { useScreenSize } from '../composables/useScreenSize';
import { useAuthStore } from '../stores/auth';
import ViewToggle from '../components/ViewToggle.vue';
import ConsumptionGrid from '../components/ConsumptionGrid.vue';
import ConsumptionTable from '../components/table/ConsumptionTable.vue';
import ConsumptionFilters from '../components/filters/ConsumptionFilters.vue';
import type { Consumption } from '../types/consumption';

interface ConsumptionFilters {
  year?: number | null;
  mes_codigo?: number | null;
  nombre?: string;
  instalacion?: number | null;
  empresa?: number | null;
  page?: number;
  limit?: number;
}

const $q = useQuasar();
const router = useRouter();
const { isMobile } = useScreenSize();
const authStore = useAuthStore();
const view = ref<'grid' | 'list'>(isMobile.value ? 'grid' : 'list');
const consumptions = ref<Consumption[]>([]);
const loading = ref(true);
const currentFilters = ref<ConsumptionFilters>({});
const socket = ref<any>(null);
const pagination = ref({
  sortBy: 'codigo',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0 // Esto debe ser actualizado por el backend
});

watch(isMobile, (newValue) => {
  view.value = newValue ? 'grid' : 'list';
});

const loadData = async () => {
  try {
    loading.value = true;
    
    // CAMBIO IMPORTANTE: Usar paginación real del servidor
    const response = await consumptionService.getConsumptions({
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      empresa: authStore.codigoEmpresa,
      ...currentFilters.value
    });
    

    if (response && response.data) {
      console.log('✅ Datos encontrados:', {
        dataLength: response.data.length,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        firstItem: response.data[0] || 'No hay elementos'
      });
      
      consumptions.value = response.data;
      
      // CAMBIO IMPORTANTE: Usar el total del servidor, no la longitud local
      if (response.total !== undefined) {
        pagination.value.rowsNumber = response.total;
        console.log('📈 Total desde backend:', response.total);
      } else {
        // TEMPORAL: Simular 100 registros para probar
        pagination.value.rowsNumber = 100; // Cambia esto por el total real
        console.warn('⚠️ No se encontró total en la respuesta, usando valor temporal');
      }
      
      console.log('🎯 Estado final:', {
        consumptionsCount: consumptions.value.length,
        paginationRowsNumber: pagination.value.rowsNumber,
        currentPage: pagination.value.page,
        rowsPerPage: pagination.value.rowsPerPage
      });
    } else {
      console.warn('⚠️ No se encontraron datos o estructura incorrecta');
      console.log('🔍 Detalles de respuesta vacía:', {
        response,
        hasResponse: !!response,
        responseKeys: response ? Object.keys(response) : 'No response'
      });
      consumptions.value = [];
      pagination.value.rowsNumber = 0;
    }
  } catch (error) {
    console.error('❌ Error al cargar datos:', error);
    console.error('🔍 Detalles del error:', {
      message: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      type: typeof error
    });
    consumptions.value = [];
    pagination.value.rowsNumber = 0;
  } finally {
    loading.value = false;
    console.log('🏁 Carga de datos finalizada');
  }
};

const exportToExcel = async () => {
  try {
    loading.value = true;
    
    // Obtener todos los registros filtrados sin paginación
    const response = await consumptionService.getConsumptions({
      page: 1,
      limit: 999999, // Límite muy alto para obtener todos los registros
      ...currentFilters.value,
      empresa: authStore.codigoEmpresa
    } as any);

    const exportColumns = [
      { key: 'codigo', label: 'Código', width: 10 },
      { key: 'instalacion', label: 'Instalación', width: 15 },
      { key: 'nombre', label: 'Nombre', width: 25 },
      { key: 'fecha', label: 'Fecha', width: 12 },
      { key: 'mes', label: 'Mes', width: 12 },
      { key: 'year', label: 'Año', width: 10 },
      { key: 'lectura', label: 'Lectura', width: 12 },
      { key: 'consumo', label: 'Consumo', width: 12 },
      { key: 'consumo_facturar', label: 'Facturar', width: 12 },
      { key: 'medidor', label: 'Medidor', width: 15 },
      { key: 'otros_cobros', label: 'Otros Cobros', width: 15 },
      { key: 'reconexion', label: 'Reconexión', width: 15 }
    ];

    const filename = exportService.generateFilename('consumos');
    
    exportService.exportToExcel({
      filename,
      title: 'Consumos',
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
    const response = await consumptionService.getConsumptions({
      page: 1,
      limit: 999999, // Límite muy alto para obtener todos los registros
      ...currentFilters.value,
      empresa: authStore.codigoEmpresa
    } as any);

    const exportColumns = [
      { key: 'codigo', label: 'Código' },
      { key: 'instalacion', label: 'Instalación' },
      { key: 'nombre', label: 'Nombre' },
      { key: 'fecha', label: 'Fecha' },
      { key: 'mes', label: 'Mes' },
      { key: 'year', label: 'Año' },
      { key: 'lectura', label: 'Lectura' },
      { key: 'consumo', label: 'Consumo' },
      { key: 'consumo_facturar', label: 'Facturar' }
    ];

    const filename = exportService.generateFilename('consumos');
    
    exportService.exportToPDF({
      filename,
      title: 'Consumos',
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

const handleNewRecord = () => {
  router.push('/consumptions/new');
};

const handleFilter = async (filters: any) => {
  currentFilters.value = filters;
  pagination.value.page = 1;
  await loadData();
};

const onRequest = async (props: any) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  pagination.value = { ...pagination.value, page, rowsPerPage, sortBy, descending };
  await loadData();
};

const setupSocketConnection = () => {
  socket.value = io('http://108.181.193.178:3007', {
    transports: ['websocket'],
    autoConnect: true
  });

  socket.value.on('connect', () => {
    console.log('Conectado al servidor de Socket.IO');
  });

  socket.value.on('consumo_update', (data: any) => {
    console.log('Actualización de consumo recibida:', data);
    if (data.type === 'consumo_update' && data.operation === 'INSERT') {
      // Agregar el nuevo consumo al inicio de la lista
      consumptions.value.unshift(data.record);
      
      // Actualizar el contador total
      pagination.value.rowsNumber += 1;
      
      $q.notify({
        type: 'positive',
        message: 'Nuevo consumo registrado',
        position: 'top'
      });
    }
  });

  socket.value.on('disconnect', () => {
    console.log('Desconectado del servidor de Socket.IO');
  });

  socket.value.on('error', (error: any) => {
    console.error('Error de Socket.IO:', error);
  });
};

onMounted(() => {
  setupSocketConnection();
  loadData();
});

onUnmounted(() => {
  if (socket.value) {
    socket.value.disconnect();
  }
});
</script>

<template>
  <q-page class="modern-page">
    <div class="consumption-page">
      <!-- Header con título y estadísticas -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <h1 class="page-title">
              <q-icon name="water_drop" class="title-icon" />
              Gestión de Consumos
            </h1>
            <p class="page-subtitle">Administra y visualiza los consumos de agua</p>
          </div>
          
          <!-- Tarjetas de estadísticas -->
          <div class="stats-cards">
            <div class="stat-card stat-card-primary">
              <div class="stat-icon">
                <q-icon name="assessment" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ pagination.rowsNumber }}</div>
                <div class="stat-label">Total Registros</div>
              </div>
            </div>
            <div class="stat-card stat-card-secondary">
              <div class="stat-icon">
                <q-icon name="today" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ new Date().getMonth() + 1 }}</div>
                <div class="stat-label">Mes Actual</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección de filtros y acciones -->
      <div class="filters-section">
        <div class="filters-card">
          <div class="filters-header">
            <h3 class="filters-title">
              <q-icon name="filter_list" class="filters-icon" />
              Filtros y Acciones
            </h3>
          </div>
          
          <div class="filters-content">
            <div class="filters-wrapper">
              <ConsumptionFilters @filter="handleFilter" />
            </div>
            
            <div class="actions-wrapper">
              <div class="view-toggle-wrapper">
                <ViewToggle v-model="view" />
              </div>
              
              <div class="export-buttons">
                <q-btn
                  class="export-btn excel-btn"
                  icon="file_download"
                  label="Excel"
                  @click="exportToExcel"
                  no-caps
                  unelevated
                />
                <q-btn
                  class="export-btn pdf-btn"
                  icon="picture_as_pdf"
                  label="PDF"
                  @click="exportToPDF"
                  no-caps
                  unelevated
                />
              </div>
              
              <q-btn
                class="new-btn"
                :icon-right="isMobile ? undefined : 'add'"
                :icon="isMobile ? 'add' : undefined"
                :label="isMobile ? undefined : 'Nuevo Consumo'"
                @click="handleNewRecord"
                no-caps
                unelevated
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Sección de contenido -->
      <div class="content-section">
        <div class="content-card">
          <template v-if="view === 'list'">
            <div class="table-wrapper">
              <ConsumptionTable
                :rows="consumptions"
                :loading="loading"
                :pagination="pagination"
                @request="onRequest"
              />
            </div>
          </template>
          <template v-else>
            <div class="grid-wrapper">
              <ConsumptionGrid :items="consumptions" />
              
              <div class="pagination-wrapper">
                <q-pagination
                  v-model="pagination.page"
                  :max="Math.ceil(pagination.rowsNumber / pagination.rowsPerPage)"
                  :max-pages="6"
                  boundary-links
                  direction-links
                  class="modern-pagination"
                  @update:model-value="page => onRequest({ pagination: { ...pagination, page } })"
                />
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

// Variables de colores
:root {
  --color-dark-teal: #004D40;
  --color-jade-green: #00796B;
  --color-light-green: #4DB6AC;
  --color-petroleum-blue: #01579B;
  --color-sky-blue: #4FC3F7;
  --color-pure-white: #FFFFFF;
  --color-light-gray: #F5F5F5;
  --color-charcoal-gray: #212121;
  --color-medium-gray: #757575;
  --color-golden: #FFD54F;
}

.modern-page {
  background: var(--color-pure-white);
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
}

.consumption-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;

  // Header principal
  .page-header {
    margin-bottom: 32px;
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 32px;
      flex-wrap: wrap;
    }
    
    .title-section {
      flex: 1;
      min-width: 300px;
      
      .page-title {
        font-size: 24px;
        font-weight: 700;
        color: var(--color-charcoal-gray);
        margin: 0 0 8px 0;
        display: flex;
        align-items: center;
        gap: 12px;
        
        .title-icon {
          color: var(--color-jade-green);
          font-size: 28px;
        }
      }
      
      .page-subtitle {
        font-size: 16px;
        color: var(--color-medium-gray);
        margin: 0;
        font-weight: 400;
      }
    }
    
    .stats-cards {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      
      .stat-card {
        background: var(--color-pure-white);
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        display: flex;
        align-items: center;
        gap: 16px;
        min-width: 180px;
        border: 1px solid rgba(0, 77, 64, 0.1);
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }
        
        &.stat-card-primary {
          .stat-icon {
            background: linear-gradient(135deg, var(--color-jade-green), var(--color-light-green));
            color: var(--color-pure-white);
          }
        }
        
        &.stat-card-secondary {
          .stat-icon {
            background: linear-gradient(135deg, var(--color-petroleum-blue), var(--color-sky-blue));
            color: var(--color-pure-white);
          }
        }
        
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
        
        .stat-content {
          .stat-value {
            font-size: 20px;
            font-weight: 700;
            color: var(--color-charcoal-gray);
            line-height: 1.2;
          }
          
          .stat-label {
            font-size: 12px;
            color: var(--color-medium-gray);
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        }
      }
    }
  }

  // Sección de filtros
  .filters-section {
    margin-bottom: 24px;
    
    .filters-card {
      background: var(--color-pure-white);
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(0, 77, 64, 0.1);
      overflow: hidden;
      
      .filters-header {
        background: linear-gradient(135deg, var(--color-dark-teal), var(--color-jade-green));
        padding: 16px 24px;
        
        .filters-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-pure-white);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          
          .filters-icon {
            font-size: 20px;
          }
        }
      }
      
      .filters-content {
        padding: 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 24px;
        flex-wrap: wrap;
        
        .filters-wrapper {
          flex: 1;
          min-width: 300px;
        }
        
        .actions-wrapper {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          
          /* Los estilos para .view-toggle-wrapper se aplicarán en su componente */
          
          .export-buttons {
            display: flex;
            gap: 8px;
            
            .export-btn {
              padding: 8px 16px;
              border-radius: 8px;
              font-weight: 500;
              font-size: 14px;
              transition: all 0.3s ease;
              
              &.excel-btn {
                background: var(--color-light-green);
                color: var(--color-pure-white);
                
                &:hover {
                  background: var(--color-jade-green);
                  transform: translateY(-1px);
                }
              }
              
              &.pdf-btn {
                background: #E53E3E;
                color: var(--color-pure-white);
                
                &:hover {
                  background: #C53030;
                  transform: translateY(-1px);
                }
              }
            }
          }
          
          .new-btn {
            background: linear-gradient(135deg, var(--color-jade-green), var(--color-light-green));
            color: var(--color-pure-white);
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.3s ease;
            
            &:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(0, 121, 107, 0.3);
            }
          }
        }
      }
    }
  }

  // Sección de contenido
  .content-section {
    .content-card {
      background: var(--color-pure-white);
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(0, 77, 64, 0.1);
      overflow: hidden;
      
      /* Los estilos para .table-wrapper se aplicarán en el componente ConsumptionTable */
      
      .grid-wrapper {
        padding: 24px;
        
        .pagination-wrapper {
          display: flex;
          justify-content: center;
          margin-top: 32px;
          
          .modern-pagination {
            :deep(.q-pagination__content) {
              .q-btn {
                color: var(--color-jade-green);
                
                &.q-btn--active {
                  background: var(--color-jade-green);
                  color: var(--color-pure-white);
                }
                
                &:hover:not(.q-btn--active) {
                  background: var(--color-light-gray);
                }
              }
            }
          }
        }
      }
    }
  }

  // Responsive
  @media (max-width: 768px) {
    padding: 16px;
    
    .page-header {
      .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: 24px;
      }
      
      .title-section {
        min-width: unset;
        
        .page-title {
          font-size: 20px;
        }
      }
      
      .stats-cards {
        justify-content: center;
        
        .stat-card {
          flex: 1;
          min-width: 140px;
        }
      }
    }
    
    .filters-section {
      .filters-card {
        .filters-content {
          flex-direction: column;
          align-items: stretch;
          gap: 16px;
          
          .filters-wrapper {
            min-width: unset;
          }
          
          .actions-wrapper {
            justify-content: center;
            flex-wrap: wrap;
          }
        }
      }
    }
  }
  
  @media (max-width: 480px) {
    .stats-cards {
      .stat-card {
        min-width: unset;
        flex-direction: column;
        text-align: center;
        gap: 12px;
        
        .stat-icon {
          width: 40px;
          height: 40px;
          font-size: 20px;
        }
      }
    }
    
    .actions-wrapper {
      .export-buttons {
        flex-direction: column;
        width: 100%;
        
        .export-btn {
          width: 100%;
        }
      }
      
      .new-btn {
        width: 100%;
        justify-content: center;
      }
    }
  }
}
</style>