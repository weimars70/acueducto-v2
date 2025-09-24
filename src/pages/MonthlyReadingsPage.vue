<template>
  <q-page class="monthly-readings-page">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">Lecturas del Mes</h1>
          <p class="page-subtitle">Gestión y seguimiento de lecturas mensuales</p>
        </div>
        <div class="header-stats">
          <div class="stat-card">
            <div class="stat-value">{{ filteredReadings.length }}</div>
            <div class="stat-label">Total Lecturas</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ registeredCount }}</div>
            <div class="stat-label">Registradas</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <q-card class="filters-card">
        <q-card-section class="filters-content">
          <div class="filters-grid">
            <div class="filter-group">
              <q-select
                v-model="filters.month"
                :options="months"
                label="Mes"
                outlined
                class="modern-select"
                option-value="value"
                option-label="text"
                emit-value
                map-options
              >
                <template v-slot:prepend>
                  <q-icon name="event" class="filter-icon" />
                </template>
              </q-select>
            </div>
            
            <div class="filter-group">
              <q-select
                v-model="filters.year"
                :options="years"
                label="Año"
                outlined
                class="modern-select"
              >
                <template v-slot:prepend>
                  <q-icon name="calendar_today" class="filter-icon" />
                </template>
              </q-select>
            </div>

            <div class="filter-group">
              <q-select
                v-model="filters.registrada"
                :options="estadoOptions"
                label="Estado"
                outlined
                class="modern-select"
                emit-value
                map-options
              >
                <template v-slot:prepend>
                  <q-icon name="check_circle" class="filter-icon" />
                </template>
              </q-select>
            </div>

            <div class="filter-group">
              <q-input
                v-model="filters.nombre"
                label="Nombre"
                outlined
                class="modern-input"
              >
                <template v-slot:prepend>
                  <q-icon name="person" class="filter-icon" />
                </template>
              </q-input>
            </div>

            <div class="filter-group">
              <q-input
                v-model="filters.instalacion"
                label="Instalación"
                outlined
                class="modern-input"
              >
                <template v-slot:prepend>
                  <q-icon name="home" class="filter-icon" />
                </template>
              </q-input>
            </div>
          </div>
          
          <div class="filters-actions">
            <ViewToggle v-model="view" />
            <q-btn
              flat
              round
              class="clear-btn"
              icon="clear"
              @click="clearFilters"
            >
              <q-tooltip>Limpiar filtros</q-tooltip>
            </q-btn>
            <q-btn
              class="search-btn"
              icon="search"
              label="Buscar"
              :loading="loading"
              @click="fetchReadings"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Content Section -->
    <div class="content-section">
      <q-card class="content-card">
        <!-- Grid View -->
        <template v-if="view === 'grid'">
          <div class="grid-container">
            <div v-for="reading in filteredReadings" :key="reading.instalacion" class="reading-card">
              <div class="card-header">
                <div class="card-title">{{ reading.nombre }}</div>
                <div class="status-badge" :class="reading.registrada === 'SI' ? 'status-registered' : 'status-pending'">
                  {{ reading.registrada }}
                </div>
              </div>
              <div class="card-content">
                <div class="card-info">
                  <q-icon name="home" class="info-icon" />
                  <span class="info-label">Instalación:</span>
                  <span class="info-value">{{ reading.instalacion }}</span>
                </div>
                <div class="card-info">
                  <q-icon name="location_on" class="info-icon" />
                  <span class="info-label">Sector:</span>
                  <span class="info-value">{{ reading.sector }}</span>
                </div>
                <div class="card-info">
                  <q-icon name="speed" class="info-icon" />
                  <span class="info-label">Lectura:</span>
                  <span class="info-value">{{ reading.lectura || 'No registrada' }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Table View -->
        <template v-else>
          <q-table
            :rows="filteredReadings"
            :columns="columns"
            row-key="instalacion"
            :loading="loading"
            :pagination="{
              rowsPerPage: 15
            }"
            rows-per-page-label="Registros por página:"
            no-data-label="No hay datos disponibles"
            loading-label="Cargando..."
            flat
            class="modern-table"
          >
            <template v-slot:header="props">
              <q-tr :props="props" class="table-header">
                <q-th
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                  class="header-cell"
                >
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template v-slot:body="props">
              <q-tr :props="props" class="table-row">
                <q-td
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                  class="body-cell"
                >
                  <template v-if="col.name === 'registrada'">
                    <div class="status-badge" :class="props.row.registrada === 'SI' ? 'status-registered' : 'status-pending'">
                      {{ props.row.registrada }}
                    </div>
                  </template>
                  <template v-else>
                    {{ props.row[col.name] }}
                  </template>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </template>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { apiClient } from '../services/api/client';
import { months } from '../utils/dates';
import { useScreenSize } from '../composables/useScreenSize';
import ViewToggle from '../components/ViewToggle.vue';

interface MonthlyReading {
  instalacion: string | number;
  nombre: string;
  sector: string;
  lectura: string | number | null;
  registrada: 'SI' | 'NO';
}

const $q = useQuasar();
const { isMobile } = useScreenSize();
const loading = ref(false);
const readings = ref<MonthlyReading[]>([]);
const view = ref<'grid' | 'list'>(isMobile.value ? 'grid' : 'list');

// Watch para cambiar la vista cuando cambia el tamaño de pantalla
watch(isMobile, (newValue) => {
  view.value = newValue ? 'grid' : 'list';
});

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 11 }, (_, i) => currentYear - i);

const filters = ref({
  month: new Date().getMonth() + 1,
  year: currentYear,
  instalacion: '',
  nombre: '',
  registrada: null
});

const columns = [
  { name: 'instalacion', label: 'Instalación', field: 'instalacion', sortable: true, align: 'left' as const },
  { name: 'nombre', label: 'Nombre', field: 'nombre', sortable: true, align: 'left' as const },
  { name: 'sector', label: 'Sector', field: 'sector', sortable: true, align: 'left' as const },
  { name: 'lectura', label: 'Lectura', field: 'lectura', sortable: true, align: 'right' as const },
  { name: 'registrada', label: 'Registrada', field: 'registrada', sortable: true, align: 'center' as const }
];

const estadoOptions = [
  { label: 'Todos', value: null },
  { label: 'SI', value: 'SI' },
  { label: 'NO', value: 'NO' }
];

const filteredReadings = computed<MonthlyReading[]>(() => {
  return readings.value.filter((reading: MonthlyReading) => {
    const matchesInstalacion = !filters.value.instalacion || 
      reading.instalacion.toString().includes(filters.value.instalacion);
    
    const matchesNombre = !filters.value.nombre || 
      reading.nombre.toLowerCase().includes(filters.value.nombre.toLowerCase());
    
    const matchesRegistrada = !filters.value.registrada || 
      reading.registrada === filters.value.registrada;
    
    return matchesInstalacion && matchesNombre && matchesRegistrada;
  });
});

const registeredCount = computed(() => {
  return filteredReadings.value.filter(reading => reading.registrada === 'SI').length;
});

const fetchReadings = async () => {
  try {
    loading.value = true;
    const { data } = await apiClient.get('/consumo/last-lecturas', {
      params: {
        month: filters.value.month,
        year: filters.value.year
      }
    });
    readings.value = data;
  } catch (error) {
    console.error('Error fetching readings:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las lecturas'
    });
  } finally {
    loading.value = false;
  }
};

const clearFilters = () => {
  filters.value.instalacion = '';
  filters.value.nombre = '';
  filters.value.registrada = null;
};
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

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

.monthly-readings-page {
  font-family: 'Inter', sans-serif;
  background-color: var(--color-light-gray);
  min-height: 100vh;
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
}

// Header Section
.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-charcoal-gray);
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 16px;
  font-weight: 400;
  color: var(--color-medium-gray);
  margin: 0;
  line-height: 1.4;
}

.header-stats {
  display: flex;
  gap: 16px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
}

.stat-card {
  background: linear-gradient(135deg, var(--color-jade-green), var(--color-light-green));
  color: var(--color-pure-white);
  padding: 20px;
  border-radius: 16px;
  text-align: center;
  min-width: 120px;
  box-shadow: 0 4px 12px rgba(0, 125, 107, 0.15);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    flex: 1;
    min-width: auto;
    padding: 16px;
  }
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;

  @media (max-width: 768px) {
    font-size: 24px;
  }
}

.stat-label {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

// Filters Section
.filters-section {
  margin-bottom: 24px;
}

.filters-card {
  background: var(--color-pure-white);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: none;
}

.filters-content {
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.modern-select,
.modern-input {
  :deep(.q-field__control) {
    border-radius: 12px;
    border: 2px solid #E0E0E0;
    background: var(--color-pure-white);
    transition: all 0.2s ease;
    height: 48px;

    &:hover {
      border-color: var(--color-light-green);
    }
  }

  :deep(.q-field--focused .q-field__control) {
    border-color: var(--color-jade-green);
    box-shadow: 0 0 0 3px rgba(0, 121, 107, 0.1);
  }

  :deep(.q-field__label) {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-medium-gray);
  }

  :deep(.q-field__native) {
    font-size: 14px;
    font-weight: 400;
    color: var(--color-charcoal-gray);
  }
}

.filter-icon {
  color: var(--color-petroleum-blue);
  font-size: 20px;
}

.filters-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #E0E0E0;

  @media (max-width: 768px) {
    justify-content: center;
    flex-wrap: wrap;
  }
}

.clear-btn {
  color: var(--color-medium-gray);
  border-radius: 12px;
  padding: 8px;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(117, 117, 117, 0.1);
    color: var(--color-charcoal-gray);
  }
}

.search-btn {
  background: linear-gradient(135deg, var(--color-jade-green), var(--color-dark-teal));
  color: var(--color-pure-white);
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  font-size: 14px;
  border: none;
  transition: all 0.2s ease;
  text-transform: none;

  &:hover {
    background: linear-gradient(135deg, var(--color-dark-teal), var(--color-jade-green));
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 77, 64, 0.3);
  }

  @media (max-width: 768px) {
    width: 100%;
    margin-top: 8px;
  }
}

// Content Section
.content-section {
  margin-bottom: 24px;
}

.content-card {
  background: var(--color-pure-white);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: none;
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
}

// Grid View
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.reading-card {
  background: var(--color-pure-white);
  border: 1px solid #E0E0E0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: var(--color-light-green);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-charcoal-gray);
  line-height: 1.3;
  flex: 1;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.info-icon {
  color: var(--color-petroleum-blue);
  font-size: 16px;
  flex-shrink: 0;
}

.info-label {
  color: var(--color-medium-gray);
  font-weight: 500;
  min-width: 80px;
}

.info-value {
  color: var(--color-charcoal-gray);
  font-weight: 400;
  flex: 1;
}

// Status Badge
.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
  min-width: 60px;

  &.status-registered {
    background: linear-gradient(135deg, var(--color-jade-green), var(--color-light-green));
    color: var(--color-pure-white);
  }

  &.status-pending {
    background: linear-gradient(135deg, var(--color-golden), #FFB74D);
    color: var(--color-charcoal-gray);
  }
}

// Table View
.modern-table {
  border-radius: 12px;
  overflow: hidden;

  :deep(.q-table__container) {
    border-radius: 12px;
  }

  :deep(.q-table__top) {
    padding: 16px;
    background: var(--color-light-gray);
  }

  :deep(.q-table__bottom) {
    padding: 16px;
    background: var(--color-light-gray);
  }
}

.table-header {
  background: linear-gradient(135deg, var(--color-dark-teal), var(--color-jade-green));

  .header-cell {
    color: var(--color-pure-white);
    font-weight: 600;
    font-size: 14px;
    padding: 16px 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.table-row {
  transition: background-color 0.2s ease;

  &:nth-child(even) {
    background-color: rgba(245, 245, 245, 0.5);
  }

  &:hover {
    background-color: rgba(77, 182, 172, 0.1) !important;
  }

  .body-cell {
    padding: 12px;
    font-size: 14px;
    color: var(--color-charcoal-gray);
    border-bottom: 1px solid #E0E0E0;
  }
}

// Responsive adjustments
@media (max-width: 480px) {
  .monthly-readings-page {
    padding: 12px;
  }

  .page-title {
    font-size: 20px;
  }

  .page-subtitle {
    font-size: 14px;
  }

  .stat-card {
    padding: 12px;
  }

  .stat-value {
    font-size: 20px;
  }

  .filters-content {
    padding: 12px;
  }

  .content-card {
    padding: 12px;
  }

  .reading-card {
    padding: 16px;
  }

  .grid-container {
    grid-template-columns: 1fr;
  }
}
</style>