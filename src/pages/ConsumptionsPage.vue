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

const $q = useQuasar();
const router = useRouter();
const { isMobile } = useScreenSize();
const authStore = useAuthStore();
const view = ref<'grid' | 'list'>(isMobile.value ? 'grid' : 'list');
const consumptions = ref<Consumption[]>([]);
const loading = ref(true);
const currentFilters = ref({});
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
    });

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
    });

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
  <q-page padding>
    <div class="consumption-page q-pa-md">
      <div class="page-header q-mb-md">
        <div class="row items-center no-wrap">
          <div class="col">
            <ConsumptionFilters @filter="handleFilter" />
          </div>
          <div class="col-auto actions-wrapper q-ml-sm">
            <div class="row items-center no-wrap q-gutter-x-xs">
              <ViewToggle v-model="view" />
              <q-btn
                color="green"
                icon="file_download"
                label="Excel"
                @click="exportToExcel"
                no-caps
                unelevated
                class="q-mr-sm"
              />
              <q-btn
                color="red"
                icon="picture_as_pdf"
                label="PDF"
                @click="exportToPDF"
                no-caps
                unelevated
                class="q-mr-sm"
              />
              <q-btn
                color="primary"
                :icon-right="isMobile ? undefined : 'add'"
                :icon="isMobile ? 'add' : undefined"
                :label="isMobile ? undefined : 'Nuevo'"
                dense
                @click="handleNewRecord"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="content-section">
        <template v-if="view === 'list'">
          <ConsumptionTable
            :rows="consumptions"
            :loading="loading"
            :pagination="pagination"
            @request="onRequest"
          />
        </template>
        <template v-else>
          <div class="grid-container">
            <ConsumptionGrid :items="consumptions" />
            
            <div class="row justify-center q-mt-md">
              <q-pagination
                v-model="pagination.page"
                :max="Math.ceil(pagination.rowsNumber / pagination.rowsPerPage)"
                :max-pages="6"
                boundary-links
                direction-links
                color="primary"
                @update:model-value="page => onRequest({ pagination: { ...pagination, page } })"
              />
            </div>
          </div>
        </template>
      </div>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
.consumption-page {
  .page-header .row {
    flex-wrap: nowrap;
  }

  .actions-wrapper {
    white-space: nowrap;
  }

  .q-btn {
    min-width: unset;
  }

  .grid-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  @media (max-width: 599px) {
    .page-header .row {
      flex-wrap: wrap;
      row-gap: 8px;
      
      .col {
        width: 100%;
      }
      
      .actions-wrapper {
        width: 100%;
        justify-content: flex-end;
        display: flex;
      }
    }
  }
}
</style>