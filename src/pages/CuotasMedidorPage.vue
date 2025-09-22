<template>
  <q-page class="q-pa-md">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <h6 class="page-title">Gestión Cuostas Medidor</h6>
        <q-btn
          color="primary"
          icon="add"
          label="Nuevo"
          @click="$router.push('/diferidos/cuotas-medidor/nuevo')"
          no-caps
          unelevated
          class="q-ml-md"
        />
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
                label="Fecha Desde"
                outlined
                dense
                clearable
                type="date"
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
                label="Fecha Hasta"
                outlined
                dense
                clearable
                type="date"
                @update:model-value="applyFilters"
              >
                <template v-slot:prepend>
                  <q-icon name="event" />
                </template>
              </q-input>
            </div>

            <div class="col-md-2 col-sm-6 col-xs-12">
              <q-btn
                color="primary"
                icon="refresh"
                label="Limpiar"
                outline
                @click="clearFilters"
                class="full-width"
                no-caps
                align="left"
              />
            </div>
          </div>

        </q-card-section>
      </q-card>

      <!-- Data Table -->
      <q-card class="data-card">
        <q-card-section class="q-pa-none">
          <q-table
            :rows="data"
            :columns="columns"
            :loading="loading"
            :pagination="pagination"
            row-key="codigo"
            flat
            bordered
            class="cuotas-table"
            @request="onRequest"
            binary-state-sort
            :rows-per-page-options="[5, 10, 25, 50, 100]"
            v-model:pagination="pagination"
          >
            <template v-slot:loading>
              <q-inner-loading showing color="primary" />
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
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { cuotasMedidorService } from '../services/cuotas-medidor.service';

interface CuotaMedidor {
  codigo: number;
  instalacion_codigo: number;
  nombre: string;
  fecha: string;
  saldo: number;
  cuota: number;
  por_interes: number;
}

const $q = useQuasar();
const loading = ref(false);
const data = ref<CuotaMedidor[]>([]);

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
    const response = await cuotasMedidorService.getCuotasMedidor(
      pagination.value.page, 
      pagination.value.rowsPerPage, 
      filters.value,
      pagination.value.sortBy || 'fecha',
      sortOrder
    );
    data.value = response.data;
    pagination.value.rowsNumber = response.total;
  } catch (error) {
    console.error('Error loading cuotas medidor:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las cuotas de medidor'
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
    const response = await cuotasMedidorService.getCuotasMedidor(
      page, 
      rowsPerPage, 
      filters.value,
      sortBy || 'fecha',
      sortOrder
    );
    data.value = response.data;
    pagination.value.rowsNumber = response.total;
  } catch (error) {
    console.error('Error loading cuotas medidor:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las cuotas de medidor'
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  .page-title {
    margin: 0;
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