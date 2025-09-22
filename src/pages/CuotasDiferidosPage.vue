<template>
  <q-page class="q-pa-md">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="row items-center justify-between">
          <h6 class="page-title">Gestión de cuotas diferidas</h6>
          <div class="header-actions">
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
              icon="add"
              label="Nuevo"
              @click="goToNewForm"
              no-caps
              unelevated
            />
          </div>
        </div>
      </div>

      <!-- Filters Card -->
      <q-card class="filters-card q-mb-md">
        <q-card-section>
          <div class="row q-gutter-md">

            <div class="col-md-2 col-sm-6 col-xs-12">
              <q-input
                v-model="filters.instalacion_codigo"
                label="Instalación"
                outlined
                dense
                clearable
                @update:model-value="applyFilters"
                debounce="300"
              >
                <template v-slot:prepend>
                  <q-icon name="home" />
                </template>
              </q-input>
            </div>
            <div class="col-md-3 col-sm-6 col-xs-12">
              <q-input
                v-model="filters.nombre"
                label="Nombre"
                outlined
                dense
                clearable
                @update:model-value="applyFilters"
                debounce="300"
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>
            </div>
            <div class="col-md-2 col-sm-6 col-xs-12">
              <q-input
                v-model="filters.fecha_desde"
                label="Fecha desde"
                type="date"
                outlined
                dense
                clearable
                @update:model-value="applyFilters"
              >
                <template v-slot:prepend>
                  <q-icon name="event" />
                </template>
              </q-input>
            </div>
            <div class="col-md-2 col-sm-6 col-xs-12">
              <q-input
                v-model="filters.fecha_hasta"
                label="Fecha hasta"
                type="date"
                outlined
                dense
                clearable
                @update:model-value="applyFilters"
              >
                <template v-slot:prepend>
                  <q-icon name="event" />
                </template>
              </q-input>
            </div>
            <div class="col-md-2 col-sm-6 col-xs-12">
              <q-btn
                color="secondary"
                icon="clear"
                label="Limpiar"
                @click="clearFilters"
                no-caps
                unelevated
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Data Table Card -->
      <q-card class="data-card">
        <q-card-section>
          <q-table
            class="cuotas-table"
            :rows="data"
            :columns="columns"
            :loading="loading"
            :pagination="pagination"
            @request="onRequest"
            row-key="codigo"
            binary-state-sort
            :rows-per-page-options="[10, 25, 50, 100]"
          >
            <template v-slot:body-cell-saldo="props">
              <q-td :props="props">
                $ {{ formatCurrency(props.value) }}
              </q-td>
            </template>
            <template v-slot:body-cell-cuota="props">
              <q-td :props="props">
                $ {{ formatCurrency(props.value) }}
              </q-td>
            </template>
            <template v-slot:body-cell-por_interes="props">
              <q-td :props="props">
                {{ props.value }}%
              </q-td>
            </template>
            <template v-slot:body-cell-fecha="props">
              <q-td :props="props">
                {{ formatDate(props.value) }}
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { cuotasDiferidosService } from '../services/cuotas-diferidos.service';
import { exportService } from '../services/export.service';

interface CuotaDiferido {
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
const data = ref<CuotaDiferido[]>([]);

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
    align: 'left',
    field: 'codigo',
    sortable: true
  },
  {
    name: 'instalacion_codigo',
    label: 'Instalación',
    align: 'left',
    field: 'instalacion_codigo',
    sortable: true
  },
  {
    name: 'nombre',
    label: 'Nombre',
    align: 'left',
    field: 'nombre',
    sortable: true
  },
  {
    name: 'fecha',
    label: 'Fecha',
    align: 'center',
    field: 'fecha',
    sortable: true
  },
  {
    name: 'saldo',
    label: 'Saldo',
    align: 'right',
    field: 'saldo',
    sortable: true
  },
  {
    name: 'cuota',
    label: 'Cuota',
    align: 'right',
    field: 'cuota',
    sortable: true
  },
  {
    name: 'por_interes',
    label: '% Interés',
    align: 'center',
    field: 'por_interes',
    sortable: true
  }
];



const loadData = async () => {
  try {
    loading.value = true;
    const sortOrder = pagination.value.descending ? 'DESC' : 'ASC';
    const response = await cuotasDiferidosService.getCuotasDiferidos(
      pagination.value.page, 
      pagination.value.rowsPerPage, 
      filters.value,
      pagination.value.sortBy || 'fecha',
      sortOrder
    );
    data.value = response.data;
    pagination.value.rowsNumber = response.total;
  } catch (error) {
    console.error('Error loading cuotas diferidos:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las cuotas diferidas'
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
    const response = await cuotasDiferidosService.getCuotasDiferidos(
      page, 
      rowsPerPage, 
      filters.value,
      sortBy || 'fecha',
      sortOrder
    );
    data.value = response.data;
    pagination.value.rowsNumber = response.total;
  } catch (error) {
    console.error('Error loading cuotas diferidos:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las cuotas diferidas'
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
  router.push('/diferidos/cuotas-diferidos/nuevo');
};

const exportToExcel = async () => {
  try {
    loading.value = true;
    
    // Obtener todos los registros filtrados sin paginación
    const response = await cuotasDiferidosService.getCuotasDiferidos(
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

    const filename = exportService.generateFilename('cuotas_diferidos');
    
    exportService.exportToExcel({
      filename,
      title: 'Cuotas Diferidos',
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
    const response = await cuotasDiferidosService.getCuotasDiferidos(
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

    const filename = exportService.generateFilename('cuotas_diferidos');
    
    exportService.exportToPDF({
      filename,
      title: 'Cuotas Diferidos',
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