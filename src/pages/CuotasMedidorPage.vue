<template>
  <q-page class="modern-page">
    <div class="page-container">
      <!-- Modern Header -->
      <div class="modern-header">
        <div class="header-content">
          <div class="title-section">
            <div class="title-wrapper">
              <q-icon name="account_balance_wallet" class="title-icon" />
              <div>
                <h4 class="page-title">Gestión Cuotas Medidor</h4>
                <p class="page-subtitle">Administra las cuotas de medidor del sistema</p>
              </div>
            </div>
            <ViewToggle v-model="viewMode" />
          </div>
          <div class="header-actions">
            <q-btn
              icon="file_download"
              label="Excel"
              @click="exportToExcel"
              class="modern-btn export-btn excel-btn"
              no-caps
              unelevated
            />
            <q-btn
              icon="picture_as_pdf"
              label="PDF"
              @click="exportToPDF"
              class="modern-btn export-btn pdf-btn"
              no-caps
              unelevated
            />
            <q-btn
              icon="add"
              label="Nuevo"
              @click="goToNewForm"
              class="modern-btn primary-btn"
              no-caps
              unelevated
            />
          </div>
        </div>
      </div>

      <!-- Modern Filters -->
      <q-card class="modern-filters-card">
        <div class="filters-header" @click="filtersExpanded = !filtersExpanded">
          <div class="filters-title">
            <q-icon name="filter_list" class="filters-icon" />
            <span>Filtros de Búsqueda</span>
          </div>
          <q-btn
            :icon="filtersExpanded ? 'expand_less' : 'expand_more'"
            flat
            round
            dense
            class="toggle-btn"
          />
        </div>
        <q-slide-transition>
          <div v-show="filtersExpanded" class="filters-content">
            <div class="filters-grid">
              <q-input
                v-model="filters.instalacion_codigo"
                label="Código Instalación"
                class="modern-input"
                outlined
                dense
                clearable
                @update:model-value="applyFilters"
                debounce="300"
              >
                <template v-slot:prepend>
                  <q-icon name="home" color="primary" />
                </template>
              </q-input>

              <q-input
                v-model="filters.nombre"
                label="Nombre Cliente"
                class="modern-input"
                outlined
                dense
                clearable
                @update:model-value="applyFilters"
                debounce="300"
              >
                <template v-slot:prepend>
                  <q-icon name="person" color="primary" />
                </template>
              </q-input>

              <q-input
                v-model="filters.fecha_desde"
                label="Fecha Desde"
                class="modern-input"
                outlined
                dense
                clearable
                type="date"
                @update:model-value="applyFilters"
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="primary" />
                </template>
              </q-input>

              <q-input
                v-model="filters.fecha_hasta"
                label="Fecha Hasta"
                class="modern-input"
                outlined
                dense
                clearable
                type="date"
                @update:model-value="applyFilters"
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="primary" />
                </template>
              </q-input>

              <q-btn
                icon="refresh"
                label="Limpiar Filtros"
                @click="clearFilters"
                class="modern-btn clear-btn"
                no-caps
                unelevated
              />
            </div>
          </div>
        </q-slide-transition>
      </q-card>

      <!-- Data Display -->
      <q-card class="modern-data-card">
        <!-- Table View -->
        <div v-if="viewMode === 'list'" class="table-container">
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
              <q-inner-loading showing color="primary" />
            </template>

            <template v-slot:body-cell-nombre="props">
              <q-td :props="props">
                <div class="name-cell">
                  <span class="name-text">{{ props.value }}</span>
                  <span class="installation-code">ID: {{ props.row.instalacion_codigo }}</span>
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-saldo="props">
              <q-td :props="props">
                <div class="amount-cell saldo">
                  <span class="currency-symbol">$</span>
                  <span class="amount-value">{{ formatCurrency(props.value) }}</span>
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-cuota="props">
              <q-td :props="props">
                <div class="amount-cell cuota">
                  <span class="currency-symbol">$</span>
                  <span class="amount-value">{{ formatCurrency(props.value) }}</span>
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-por_interes="props">
              <q-td :props="props">
                <q-chip
                  :label="`${props.value}%`"
                  color="orange-2"
                  text-color="orange-8"
                  class="interest-chip"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-fecha="props">
              <q-td :props="props">
                <div class="date-cell">
                  <q-icon name="event" class="date-icon" />
                  <span>{{ formatDate(props.value) }}</span>
                </div>
              </q-td>
            </template>
          </q-table>
        </div>

        <!-- Card View -->
        <div v-else class="cards-container">
          <div class="cards-header">
            <h6 class="cards-title">
              <q-icon name="view_module" class="cards-icon" />
              Vista de Tarjetas
            </h6>
            <div class="cards-count">
              {{ data.length }} de {{ pagination.rowsNumber }} registros
            </div>
          </div>

          <div v-if="loading" class="cards-loading">
            <div class="loading-grid">
              <q-skeleton v-for="n in 6" :key="n" class="card-skeleton" />
            </div>
          </div>

          <div v-else-if="data.length === 0" class="no-data">
            <q-icon name="inbox" class="no-data-icon" />
            <p class="no-data-text">No se encontraron cuotas de medidor</p>
          </div>

          <div v-else class="cards-grid">
            <q-card
              v-for="item in data"
              :key="item.codigo"
              class="cuota-card"
              @click="goToEdit(item.codigo)"
            >
              <q-card-section class="card-header">
                <div class="card-title">
                  <q-icon name="account_balance_wallet" class="card-icon" />
                  <div>
                    <div class="card-name">{{ item.nombre }}</div>
                    <div class="card-subtitle">Código: {{ item.codigo }}</div>
                  </div>
                </div>
                <q-chip
                  :label="`${item.por_interes}%`"
                  color="orange-2"
                  text-color="orange-8"
                  class="interest-chip"
                />
              </q-card-section>

              <q-separator />

              <q-card-section class="card-content">
                <div class="info-grid">
                  <div class="info-item">
                    <q-icon name="home" class="info-icon" />
                    <div class="info-content">
                      <span class="info-label">Instalación</span>
                      <span class="info-value">{{ item.instalacion_codigo }}</span>
                    </div>
                  </div>

                  <div class="info-item">
                    <q-icon name="event" class="info-icon" />
                    <div class="info-content">
                      <span class="info-label">Fecha</span>
                      <span class="info-value">{{ formatDate(item.fecha) }}</span>
                    </div>
                  </div>

                  <div class="info-item saldo-item">
                    <q-icon name="account_balance" class="info-icon saldo-icon" />
                    <div class="info-content">
                      <span class="info-label">Saldo</span>
                      <span class="info-value saldo-value">${{ formatCurrency(item.saldo) }}</span>
                    </div>
                  </div>

                  <div class="info-item cuota-item">
                    <q-icon name="payments" class="info-icon cuota-icon" />
                    <div class="info-content">
                      <span class="info-label">Cuota</span>
                      <span class="info-value cuota-value">${{ formatCurrency(item.cuota) }}</span>
                    </div>
                  </div>
                </div>
              </q-card-section>

              <q-card-actions class="card-actions">
                <q-btn
                  icon="edit"
                  label="Editar"
                  color="primary"
                  flat
                  dense
                  @click.stop="goToEdit(item.codigo)"
                />
                <q-space />
                <q-btn
                  icon="visibility"
                  label="Ver"
                  color="grey-7"
                  flat
                  dense
                  @click.stop="viewDetails(item)"
                />
              </q-card-actions>
            </q-card>
          </div>

          <!-- Card View Pagination -->
          <div v-if="data.length > 0" class="cards-pagination">
            <q-pagination
              v-model="pagination.page"
              :max="Math.ceil(pagination.rowsNumber / pagination.rowsPerPage)"
              :max-pages="6"
              direction-links
              boundary-links
              color="primary"
              @update:model-value="loadData"
            />
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { cuotasMedidorService } from '../services/cuotas-medidor.service';
import { exportService } from '../services/export.service';
import ViewToggle from '../components/ViewToggle.vue';

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
const router = useRouter();
const loading = ref(false);
const data = ref<CuotaMedidor[]>([]);
const viewMode = ref<'grid' | 'list'>('list');
const filtersExpanded = ref(true);
const filters = ref({
  instalacion_codigo: '',
  nombre: '',
  fecha_desde: '',
  fecha_hasta: ''
});
const pagination = ref({
  sortBy: 'desc',
  descending: false,
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

const exportToExcel = async () => {
  try {
    loading.value = true;
    const response = await cuotasMedidorService.getCuotasMedidor(
      1,
      pagination.value.rowsNumber || 1000,
      filters.value,
      'fecha',
      'DESC'
    );
    
    const exportData = response.data.map(item => ({
      'Código': item.codigo,
      'Instalación': item.instalacion_codigo,
      'Nombre': item.nombre,
      'Fecha': formatDate(item.fecha),
      'Saldo': item.saldo,
      'Cuota': item.cuota,
      '% Interés': item.por_interes
    }));
    
    await exportService.exportToExcel({
      filename: 'cuotas-medidor',
      title: 'Gestión Cuotas Medidor',
      columns: [
        { key: 'codigo', label: 'Código' },
        { key: 'instalacion_codigo', label: 'Instalación' },
        { key: 'nombre', label: 'Nombre' },
        { key: 'fecha', label: 'Fecha' },
        { key: 'saldo', label: 'Saldo' },
        { key: 'cuota', label: 'Cuota' },
        { key: 'por_interes', label: '% Interés' }
      ],
      data: exportData
    });
    
    $q.notify({
      type: 'positive',
      message: 'Datos exportados a Excel exitosamente'
    });
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al exportar a Excel'
    });
  } finally {
    loading.value = false;
  }
};

const exportToPDF = async () => {
  try {
    loading.value = true;
    const response = await cuotasMedidorService.getCuotasMedidor(
      1,
      pagination.value.rowsNumber || 1000,
      filters.value,
      'fecha',
      'DESC'
    );
    
    const exportData = response.data.map(item => ({
      'Código': item.codigo,
      'Instalación': item.instalacion_codigo,
      'Nombre': item.nombre,
      'Fecha': formatDate(item.fecha),
      'Saldo': `$${formatCurrency(item.saldo)}`,
      'Cuota': `$${formatCurrency(item.cuota)}`,
      '% Interés': `${item.por_interes}%`
    }));
    
    await exportService.exportToPDF({
      filename: 'cuotas-medidor',
      title: 'Gestión Cuotas Medidor',
      columns: [
        { key: 'codigo', label: 'Código' },
        { key: 'instalacion_codigo', label: 'Instalación' },
        { key: 'nombre', label: 'Nombre' },
        { key: 'fecha', label: 'Fecha' },
        { key: 'saldo', label: 'Saldo' },
        { key: 'cuota', label: 'Cuota' },
        { key: 'por_interes', label: '% Interés' }
      ],
      data: exportData
    });
    
    $q.notify({
      type: 'positive',
      message: 'Datos exportados a PDF exitosamente'
    });
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al exportar a PDF'
    });
  } finally {
    loading.value = false;
  }
};

const goToNewForm = () => {
  router.push('/cuotas-medidor/nuevo');
};

const goToEdit = (codigo: number) => {
  router.push(`/cuotas-medidor/editar/${codigo}`);
};

const viewDetails = (item: CuotaMedidor) => {
  $q.dialog({
    title: 'Detalles de Cuota Medidor',
    message: `
      <div style="text-align: left;">
        <p><strong>Código:</strong> ${item.codigo}</p>
        <p><strong>Instalación:</strong> ${item.instalacion_codigo}</p>
        <p><strong>Nombre:</strong> ${item.nombre}</p>
        <p><strong>Fecha:</strong> ${formatDate(item.fecha)}</p>
        <p><strong>Saldo:</strong> $${formatCurrency(item.saldo)}</p>
        <p><strong>Cuota:</strong> $${formatCurrency(item.cuota)}</p>
        <p><strong>% Interés:</strong> ${item.por_interes}%</p>
      </div>
    `,
    html: true,
    ok: 'Cerrar'
  });
};

onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.modern-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #43e97b 100%);
  min-height: 100vh;
}

// Modern Header Styles
.modern-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  
  .header-content {
    padding: 24px;
    
    .title-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      
      .title-wrapper {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .title-icon {
           background: linear-gradient(135deg, #4facfe, #00f2fe);
           color: white;
           border-radius: 12px;
           padding: 12px;
           font-size: 24px;
         }
         
         .page-title {
           margin: 0 0 4px 0;
           font-size: 28px;
           font-weight: 700;
           background: linear-gradient(135deg, #4facfe, #43e97b);
           -webkit-background-clip: text;
           -webkit-text-fill-color: transparent;
           background-clip: text;
         }
        
        .page-subtitle {
          margin: 0;
          color: #666;
          font-size: 14px;
        }
      }
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }
  }
}

// Modern Button Styles
.modern-btn {
  border-radius: 12px;
  padding: 8px 20px;
  font-weight: 600;
  text-transform: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }
  
  &.primary-btn {
     background: linear-gradient(135deg, #4facfe, #00f2fe);
     color: white;
   }
   
   &.export-btn {
     &.excel-btn {
       background: linear-gradient(135deg, #43e97b, #38f9d7);
       color: white;
     }
     
     &.pdf-btn {
       background: linear-gradient(135deg, #4facfe, #00f2fe);
       color: white;
     }
   }
   
   &.clear-btn {
     background: linear-gradient(135deg, #ff6b6b, #ee5a24);
     color: white;
   }
}

// Modern Filters Card
.modern-filters-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  
  .filters-header {
       padding: 20px 24px;
       background: linear-gradient(135deg, rgba(79, 172, 254, 0.1), rgba(67, 233, 123, 0.1));
       border-bottom: 1px solid rgba(255, 255, 255, 0.2);
       display: flex;
       justify-content: space-between;
       align-items: center;
       cursor: pointer;
       transition: all 0.3s ease;
       
       &:hover {
         background: linear-gradient(135deg, rgba(79, 172, 254, 0.15), rgba(67, 233, 123, 0.15));
       }
       
       .filters-title {
         display: flex;
         align-items: center;
         gap: 12px;
         font-size: 18px;
         font-weight: 600;
         color: #2c3e50;
         
         .filters-icon {
           color: #4facfe;
           font-size: 20px;
         }
       }
       
       .toggle-btn {
         color: #4facfe;
         transition: transform 0.3s ease;
       }
     }
  
  .filters-content {
    padding: 24px;
    
    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      align-items: end;
    }
  }
}

// Modern Input Styles
.modern-input {
  :deep(.q-field__control) {
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.8);
    border: 2px solid transparent;
    transition: all 0.3s ease;
    
    &:hover {
           background: rgba(255, 255, 255, 0.9);
           border-color: rgba(79, 172, 254, 0.3);
         }
       }
       
       &.q-field--focused .q-field__control {
         border-color: #4facfe;
         box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
       }
}

// Modern Data Card
.modern-data-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

// Modern Table Styles
.modern-table {
  background: transparent;
  
  :deep(.q-table__top) {
    padding: 0;
    border: none;
  }
  
  :deep(.q-table thead tr th) {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
    color: #2c3e50;
    font-weight: 600;
    padding: 16px;
    border: none;
  }
  
  :deep(.q-table tbody tr) {
    transition: all 0.3s ease;
    
    &:hover {
             background: rgba(79, 172, 254, 0.05);
           }
    
    td {
      padding: 16px;
      border: none;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }
  }
  
  :deep(.q-table__bottom) {
    padding: 16px 24px;
    border: none;
    background: rgba(248, 249, 250, 0.5);
  }
}

// Table Cell Styles
.name-cell {
  .name-text {
    font-weight: 600;
    color: #2c3e50;
    display: block;
  }
  
  .installation-code {
    font-size: 12px;
    color: #7f8c8d;
    display: block;
    margin-top: 2px;
  }
}

.amount-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  font-weight: 600;
  
  .currency-symbol {
    font-size: 14px;
    opacity: 0.7;
  }
  
  .amount-value {
    font-size: 16px;
  }
  
  &.saldo {
    color: #27ae60;
  }
  
  &.cuota {
    color: #3498db;
  }
}

.interest-chip {
  font-weight: 600;
  border-radius: 8px;
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .date-icon {
    color: #7f8c8d;
    font-size: 16px;
  }
}

// Cards Container Styles
.cards-container {
  padding: 24px;
  
  .cards-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    
    .cards-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
      
      .cards-icon {
        color: #4facfe;
      }
    }
    
    .cards-count {
      color: #7f8c8d;
      font-size: 14px;
    }
  }
  
  .cards-loading {
    .loading-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      
      .card-skeleton {
        height: 200px;
        border-radius: 16px;
      }
    }
  }
  
  .no-data {
    text-align: center;
    padding: 60px 20px;
    color: #7f8c8d;
    
    .no-data-icon {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    
    .no-data-text {
      margin: 0;
      font-size: 16px;
    }
  }
  
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
  }
  
  .cards-pagination {
    display: flex;
    justify-content: center;
    padding: 20px;
    background: rgba(248, 249, 250, 0.5);
    border-radius: 12px;
    margin-top: 24px;
  }
}

// Cuota Card Styles
.cuota-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    
    .card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .card-icon {
         color: #4facfe;
         font-size: 20px;
       }
      
      .card-name {
        font-size: 16px;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 2px;
      }
      
      .card-subtitle {
        font-size: 12px;
        color: #7f8c8d;
      }
    }
  }
  
  .card-content {
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      
      .info-item {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .info-icon {
          color: #7f8c8d;
          font-size: 16px;
          
          &.saldo-icon {
            color: #27ae60;
          }
          
          &.cuota-icon {
            color: #3498db;
          }
        }
        
        .info-content {
          .info-label {
            display: block;
            font-size: 12px;
            color: #7f8c8d;
            margin-bottom: 2px;
          }
          
          .info-value {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: #2c3e50;
            
            &.saldo-value {
              color: #27ae60;
            }
            
            &.cuota-value {
              color: #3498db;
            }
          }
        }
        
        &.saldo-item,
        &.cuota-item {
          grid-column: span 2;
        }
      }
    }
  }
  
  .card-actions {
    padding: 12px 16px;
    background: rgba(248, 249, 250, 0.5);
    
    .q-btn {
      border-radius: 8px;
    }
  }
}

// Responsive Design
@media (max-width: 768px) {
  .page-container {
    padding: 16px;
  }
  
  .modern-header {
    .header-content {
      padding: 16px;
      
      .title-section {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
        
        .title-wrapper {
          .page-title {
            font-size: 24px;
          }
        }
      }
      
      .header-actions {
        justify-content: center;
      }
    }
  }
  
  .modern-filters-card {
    .filters-content {
      padding: 16px;
      
      .filters-grid {
        grid-template-columns: 1fr;
      }
    }
  }
  
  .cards-container {
    padding: 16px;
    
    .cards-grid {
      grid-template-columns: 1fr;
    }
  }
}

@media (max-width: 480px) {
  .modern-header {
    .header-content {
      .title-wrapper {
        .title-icon {
          padding: 8px;
          font-size: 20px;
        }
        
        .page-title {
          font-size: 20px;
        }
      }
    }
  }
  
  .modern-btn {
    padding: 6px 16px;
    font-size: 14px;
  }
  
  .cuota-card {
    .card-content {
      .info-grid {
        grid-template-columns: 1fr;
        
        .info-item {
          &.saldo-item,
          &.cuota-item {
            grid-column: span 1;
          }
        }
      }
    }
  }
}
</style>