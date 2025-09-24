<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { storageService } from '../services/database/storage.service';
import type { Installation } from '../types/installation';
import type { Consumption } from '../types/consumption';

const $q = useQuasar();
const activeTab = ref('installations');
const viewMode = ref('table'); // 'table' or 'cards'
const installations = ref<Installation[]>([]);
const consumptions = ref<Consumption[]>([]);
const loading = ref(false);
const searchQuery = ref('');

// Computed properties for filtered data
const filteredInstallations = computed(() => {
  if (!searchQuery.value) return installations.value;
  const query = searchQuery.value.toLowerCase();
  return installations.value.filter(item => 
    item.codigo?.toString().toLowerCase().includes(query) ||
    item.nombre?.toLowerCase().includes(query) ||
    item.sector_nombre?.toLowerCase().includes(query) ||
    item.direccion?.toLowerCase().includes(query)
  );
});

const filteredConsumptions = computed(() => {
  if (!searchQuery.value) return consumptions.value;
  const query = searchQuery.value.toLowerCase();
  return consumptions.value.filter(item => 
    item.codigo?.toString().toLowerCase().includes(query) ||
    item.nombre?.toLowerCase().includes(query) ||
    item.instalacion?.toString().toLowerCase().includes(query)
  );
});

const loadData = async () => {
  try {
    loading.value = true;
    installations.value = await storageService.getInstallations();
    consumptions.value = await storageService.getConsumptions();
  } catch (error) {
    console.error('Error loading data:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los datos sincronizados'
    });
  } finally {
    loading.value = false;
  }
};

const refreshData = async () => {
  await loadData();
  $q.notify({
    type: 'positive',
    message: 'Datos actualizados correctamente'
  });
};

const exportData = () => {
  $q.notify({
    type: 'info',
    message: 'Función de exportación en desarrollo'
  });
};

const clearSearch = () => {
  searchQuery.value = '';
};

// Table columns
const installationColumns = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' as const, sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' as const, sortable: true },
  { name: 'sector_nombre', label: 'Sector', field: 'sector_nombre', align: 'left' as const, sortable: true },
  { name: 'direccion', label: 'Dirección', field: 'direccion', align: 'left' as const, sortable: true },
  { name: 'codigo_medidor', label: 'Medidor', field: 'codigo_medidor', align: 'left' as const, sortable: true }
];

const consumptionColumns = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' as const, sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' as const, sortable: true },
  { name: 'instalacion', label: 'Instalación', field: 'instalacion', align: 'left' as const, sortable: true },
  { name: 'lectura_anterior', label: 'Lectura Anterior', field: 'lectura_anterior', align: 'right' as const, sortable: true },
  { name: 'lectura', label: 'Lectura Actual', field: 'lectura', align: 'right' as const, sortable: true },
  { name: 'consumo', label: 'Consumo', field: 'consumo', align: 'right' as const, sortable: true }
];

onMounted(() => {
  loadData();
});
</script>

<template>
  <q-page class="sync-data-page">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <q-icon name="sync" class="title-icon" />
            Datos Sincronizados
          </h1>
          <p class="page-subtitle">
            Visualiza y gestiona los datos sincronizados desde el servidor
          </p>
        </div>
        <div class="header-actions">
          <q-btn
            @click="refreshData"
            color="white"
            text-color="primary"
            icon="refresh"
            label="Actualizar"
            class="action-btn"
            :loading="loading"
          />
          <q-btn
            @click="exportData"
            color="white"
            text-color="primary"
            icon="download"
            label="Exportar"
            class="action-btn"
          />
        </div>
      </div>
    </div>

    <!-- Controls Section -->
    <div class="controls-section">
      <q-card class="controls-card">
        <q-card-section class="controls-content">
          <!-- Search -->
          <div class="search-section">
            <q-input
              v-model="searchQuery"
              placeholder="Buscar por código, nombre, sector..."
              outlined
              dense
              class="search-input"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
              <template v-slot:append>
                <q-btn
                  v-if="searchQuery"
                  icon="clear"
                  flat
                  round
                  dense
                  @click="clearSearch"
                  color="grey-6"
                />
              </template>
            </q-input>
          </div>

          <!-- Tabs Section -->
          <div class="tabs-section">
            <q-tabs
              v-model="activeTab"
              dense
              class="modern-tabs"
              indicator-color="primary"
              active-color="primary"
              align="left"
            >
              <q-tab 
                name="installations" 
                icon="home_work" 
                label="Instalaciones"
                class="modern-tab"
              />
              <q-tab 
                name="consumptions" 
                icon="water_drop" 
                label="Consumos"
                class="modern-tab"
              />
            </q-tabs>
          </div>

          <!-- View Toggle -->
          <div class="view-toggle">
            <q-btn-toggle
              v-model="viewMode"
              toggle-color="primary"
              :options="[
                { label: 'Tabla', value: 'table', icon: 'table_view' },
                { label: 'Tarjetas', value: 'cards', icon: 'view_module' }
              ]"
              unelevated
              class="view-toggle-buttons"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Content Section -->
    <div class="content-section">
      <q-tab-panels v-model="activeTab" animated class="content-panels">
        <!-- Installations Panel -->
        <q-tab-panel name="installations" class="panel-content">
          <!-- Table View -->
          <div v-if="viewMode === 'table'" class="table-view">
            <q-card class="data-card">
              <q-table
                :rows="filteredInstallations"
                :columns="installationColumns"
                row-key="codigo"
                :loading="loading"
                class="modern-table"
                :pagination="{ rowsPerPage: 10 }"
              >
                <template v-slot:no-data>
                  <div class="no-data-message">
                    <q-icon name="home_work" size="48px" color="grey-4" />
                    <p>No hay instalaciones sincronizadas</p>
                  </div>
                </template>
              </q-table>
            </q-card>
          </div>

          <!-- Cards View -->
          <div v-else class="cards-view">
            <div v-if="loading" class="loading-cards">
              <q-card v-for="n in 6" :key="n" class="skeleton-card">
                <q-skeleton height="200px" />
              </q-card>
            </div>
            <div v-else-if="filteredInstallations.length === 0" class="no-data-cards">
              <q-icon name="home_work" size="64px" color="grey-4" />
              <p class="no-data-text">No hay instalaciones sincronizadas</p>
            </div>
            <div v-else class="cards-grid">
              <q-card 
                v-for="installation in filteredInstallations" 
                :key="installation.codigo"
                class="installation-card"
              >
                <div class="card-header">
                  <div class="card-title">
                    <q-icon name="home_work" class="card-icon" />
                    <span class="card-code">{{ installation.codigo }}</span>
                  </div>
                </div>
                <div class="card-content">
                  <div class="card-info">
                    <q-icon name="person" class="info-icon" />
                    <span class="info-label">Nombre:</span>
                    <span class="info-value">{{ installation.nombre || 'N/A' }}</span>
                  </div>
                  <div class="card-info">
                    <q-icon name="location_on" class="info-icon" />
                    <span class="info-label">Sector:</span>
                    <span class="info-value">{{ installation.sector_nombre || 'N/A' }}</span>
                  </div>
                  <div class="card-info">
                    <q-icon name="home" class="info-icon" />
                    <span class="info-label">Dirección:</span>
                    <span class="info-value">{{ installation.direccion || 'N/A' }}</span>
                  </div>
                  <div class="card-info">
                    <q-icon name="info" class="info-icon" />
                    <span class="info-label">Medidor:</span>
                    <span class="info-value">{{ installation.codigo_medidor || 'N/A' }}</span>
                  </div>
                </div>
              </q-card>
            </div>
          </div>
        </q-tab-panel>

        <!-- Consumptions Panel -->
        <q-tab-panel name="consumptions" class="panel-content">
          <!-- Table View -->
          <div v-if="viewMode === 'table'" class="table-view">
            <q-card class="data-card">
              <q-table
                :rows="filteredConsumptions"
                :columns="consumptionColumns"
                row-key="codigo"
                :loading="loading"
                class="modern-table"
                :pagination="{ rowsPerPage: 10 }"
              >
                <template v-slot:no-data>
                  <div class="no-data-message">
                    <q-icon name="water_drop" size="48px" color="grey-4" />
                    <p>No hay consumos sincronizados</p>
                  </div>
                </template>
              </q-table>
            </q-card>
          </div>

          <!-- Cards View -->
          <div v-else class="cards-view">
            <div v-if="loading" class="loading-cards">
              <q-card v-for="n in 6" :key="n" class="skeleton-card">
                <q-skeleton height="200px" />
              </q-card>
            </div>
            <div v-else-if="filteredConsumptions.length === 0" class="no-data-cards">
              <q-icon name="water_drop" size="64px" color="grey-4" />
              <p class="no-data-text">No hay consumos sincronizados</p>
            </div>
            <div v-else class="cards-grid">
              <q-card 
                v-for="consumption in filteredConsumptions" 
                :key="consumption.codigo"
                class="consumption-card"
              >
                <div class="card-header">
                  <div class="card-title">
                    <q-icon name="water_drop" class="card-icon" />
                    <span class="card-code">{{ consumption.codigo }}</span>
                  </div>
                </div>
                <div class="card-content">
                  <div class="card-info">
                    <q-icon name="person" class="info-icon" />
                    <span class="info-label">Nombre:</span>
                    <span class="info-value">{{ consumption.nombre || 'N/A' }}</span>
                  </div>
                  <div class="card-info">
                    <q-icon name="home_work" class="info-icon" />
                    <span class="info-label">Instalación:</span>
                    <span class="info-value">{{ consumption.instalacion || 'N/A' }}</span>
                  </div>
                  <div class="card-info">
                    <q-icon name="trending_down" class="info-icon" />
                    <span class="info-label">L. Anterior:</span>
                    <span class="info-value">{{ consumption.lectura_anterior || 0 }}</span>
                  </div>
                  <div class="card-info">
                    <q-icon name="trending_up" class="info-icon" />
                    <span class="info-label">L. Actual:</span>
                    <span class="info-value">{{ consumption.lectura || 0 }}</span>
                  </div>
                  <div class="card-info">
                    <q-icon name="water" class="info-icon" />
                    <span class="info-label">Consumo:</span>
                    <span class="info-value consumption-highlight">{{ consumption.consumo || 0 }} m³</span>
                  </div>
                </div>
              </q-card>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
// Variables CSS personalizadas
:root {
  --color-primary: #1976d2;
  --color-secondary: #26a69a;
  --color-jade-green: #004d40;
  --color-light-green: #00695c;
  --color-petroleum-blue: #0277bd;
  --color-golden: #ffa726;
  --color-charcoal-gray: #37474f;
  --color-medium-gray: #78909c;
  --color-light-gray: #f5f5f5;
  --color-pure-white: #ffffff;
  --color-border: #e0e0e0;
  --shadow-light: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-medium: 0 4px 12px rgba(0, 0, 0, 0.15);
  --shadow-strong: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.sync-data-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  padding: 0;
}

// Header Section
.page-header {
  background: linear-gradient(135deg, var(--color-jade-green), var(--color-light-green));
  color: var(--color-pure-white);
  padding: 32px 24px;
  margin-bottom: 24px;
  
  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
  }
  
  .title-section {
    flex: 1;
    
    .page-title {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      gap: 12px;
      
      .title-icon {
        font-size: 32px;
        opacity: 0.9;
      }
    }
    
    .page-subtitle {
      font-size: 16px;
      opacity: 0.9;
      margin: 0;
      font-weight: 400;
    }
  }
  
  .header-actions {
    display: flex;
    gap: 12px;
    
    .action-btn {
      padding: 12px 24px;
      font-weight: 600;
      border-radius: 8px;
      text-transform: none;
      letter-spacing: 0.5px;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-medium);
      }
    }
  }
}

// Controls Section
.controls-section {
  max-width: 1200px;
  margin: 0 auto 24px auto;
  padding: 0 24px;
  
  .controls-card {
    border-radius: 16px;
    box-shadow: var(--shadow-light);
    border: 1px solid var(--color-border);
    
    .controls-content {
      padding: 24px;
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      align-items: center;
    }
  }
  
  .search-section {
    flex: 1;
    min-width: 300px;
    
    .search-input {
      :deep(.q-field__control) {
        border-radius: 12px;
        background: var(--color-pure-white);
      }
      
      :deep(.q-field__native) {
        font-size: 14px;
      }
    }
  }
  
  .tabs-section {
    .modern-tabs {
      :deep(.q-tab) {
        padding: 12px 24px;
        font-weight: 600;
        text-transform: none;
        border-radius: 8px;
        margin-right: 8px;
        transition: all 0.3s ease;
        
        &.q-tab--active {
          background: rgba(25, 118, 210, 0.1);
        }
      }
      
      :deep(.q-tabs__content) {
        border-bottom: none;
      }
    }
  }
  
  .view-toggle {
    .view-toggle-buttons {
      :deep(.q-btn-toggle) {
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid var(--color-border);
      }
      
      :deep(.q-btn) {
        padding: 8px 16px;
        font-weight: 500;
        text-transform: none;
      }
    }
  }
}

// Content Section
.content-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 24px 24px;
  
  .content-panels {
    :deep(.q-tab-panel) {
      padding: 0;
    }
  }
  
  .panel-content {
    .table-view {
      .data-card {
        border-radius: 16px;
        box-shadow: var(--shadow-light);
        border: 1px solid var(--color-border);
        overflow: hidden;
        
        .modern-table {
          :deep(.q-table__top) {
            background: var(--color-light-gray);
            padding: 16px;
          }
          
          :deep(.q-table__bottom) {
            background: var(--color-light-gray);
            padding: 16px;
          }
          
          :deep(.q-table thead th) {
            background: linear-gradient(135deg, var(--color-jade-green), var(--color-light-green));
            color: var(--color-pure-white);
            font-weight: 600;
            font-size: 14px;
            padding: 16px 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          :deep(.q-table tbody tr) {
            transition: all 0.3s ease;
            
            &:hover {
              background: rgba(25, 118, 210, 0.05);
            }
          }
          
          :deep(.q-table tbody td) {
            padding: 16px 12px;
            border-bottom: 1px solid #f0f0f0;
            font-size: 14px;
          }
        }
      }
      
      .no-data-message {
        text-align: center;
        padding: 48px 24px;
        color: var(--color-medium-gray);
        
        p {
          margin: 16px 0 0 0;
          font-size: 16px;
          font-weight: 500;
        }
      }
    }
    
    .cards-view {
      .loading-cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 24px;
        
        .skeleton-card {
          border-radius: 16px;
          overflow: hidden;
        }
      }
      
      .no-data-cards {
        text-align: center;
        padding: 64px 24px;
        color: var(--color-medium-gray);
        
        .no-data-text {
          margin: 24px 0 0 0;
          font-size: 18px;
          font-weight: 500;
        }
      }
      
      .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 24px;
      }
    }
  }
}

// Card Styles
.installation-card,
.consumption-card {
  border-radius: 16px;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
  background: var(--color-pure-white);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-medium);
  }
  
  .card-header {
    background: linear-gradient(135deg, var(--color-jade-green), var(--color-light-green));
    color: var(--color-pure-white);
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .card-icon {
        font-size: 24px;
        opacity: 0.9;
      }
      
      .card-code {
        font-size: 18px;
        font-weight: 700;
      }
    }
  }
  
  .card-content {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .card-info {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .info-icon {
      color: var(--color-petroleum-blue);
      font-size: 18px;
      flex-shrink: 0;
    }
    
    .info-label {
      color: var(--color-medium-gray);
      font-weight: 600;
      font-size: 13px;
      min-width: 80px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .info-value {
      color: var(--color-charcoal-gray);
      font-weight: 500;
      font-size: 14px;
      flex: 1;
      
      &.consumption-highlight {
        color: var(--color-secondary);
        font-weight: 700;
        font-size: 16px;
      }
    }
  }
}

.consumption-card {
  .card-header {
    background: linear-gradient(135deg, var(--color-secondary), var(--color-petroleum-blue));
  }
}

// Responsive Design
@media (max-width: 768px) {
  .sync-data-page {
    .page-header {
      padding: 24px 16px;
      
      .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: 20px;
      }
      
      .title-section {
        .page-title {
          font-size: 24px;
        }
        
        .page-subtitle {
          font-size: 14px;
        }
      }
      
      .header-actions {
        justify-content: center;
        
        .action-btn {
          flex: 1;
          max-width: 150px;
        }
      }
    }
    
    .controls-section {
      padding: 0 16px;
      
      .controls-content {
        padding: 16px;
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }
      
      .search-section {
        min-width: unset;
      }
      
      .tabs-section {
        .modern-tabs {
          :deep(.q-tab) {
            padding: 8px 16px;
            font-size: 14px;
          }
        }
      }
    }
    
    .content-section {
      padding: 0 16px 16px 16px;
      
      .cards-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }
  }
}

@media (max-width: 480px) {
  .installation-card,
  .consumption-card {
    .card-header {
      padding: 16px;
      
      .card-title {
        .card-code {
          font-size: 16px;
        }
      }
    }
    
    .card-content {
      padding: 16px;
      gap: 12px;
    }
    
    .card-info {
      gap: 8px;
      
      .info-label {
        min-width: 70px;
        font-size: 12px;
      }
      
      .info-value {
        font-size: 13px;
        
        &.consumption-highlight {
          font-size: 15px;
        }
      }
    }
  }
}
</style>