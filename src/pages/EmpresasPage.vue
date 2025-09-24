<template>
  <q-page class="page-container">
    <!-- Header moderno -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <div class="title-section">
            <div class="title-icon">
              <q-icon name="business" size="24px" />
            </div>
            <h1 class="page-title">Empresas</h1>
          </div>
          <p class="page-subtitle">Gestión de empresas del sistema</p>
        </div>
        <div class="header-actions">
          <ViewToggle v-model="viewMode" />
          <q-btn
            class="primary-btn"
            icon="add"
            label="Nueva Empresa"
            @click="goToCreate"
            no-caps
          />
        </div>
      </div>
    </div>

    <!-- Sección de filtros -->
    <div class="filters-section">
      <div class="filters-header" @click="filtersExpanded = !filtersExpanded">
        <div class="filters-title">
          <q-icon name="filter_list" class="filters-icon" />
          <span>Filtros de búsqueda</span>
        </div>
        <q-icon 
          :name="filtersExpanded ? 'expand_less' : 'expand_more'" 
          class="toggle-icon"
        />
      </div>
      <q-slide-transition>
        <div v-show="filtersExpanded" class="filters-content">
          <div class="filters-grid">
            <q-input
              v-model="searchText"
              placeholder="Buscar por nombre, código o identificación..."
              class="modern-input"
              outlined
              dense
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </div>
      </q-slide-transition>
    </div>

    <!-- Sección de datos -->
    <div class="data-section">
      <div class="data-header">
        <div class="data-title">
          <q-icon name="business" class="data-icon" />
          <span>Lista de Empresas</span>
        </div>
      </div>

      <!-- Vista de tabla -->
      <div v-if="viewMode === 'list'" class="table-view">
        <q-table
          :rows="filteredEmpresas"
          :columns="columns"
          :loading="loading"
          row-key="codigo"
          :pagination="{ rowsPerPage: 10 }"
          :filter="searchText"
          :filter-method="filterMethod"
          class="modern-table"
        >
          <template v-slot:body-cell-nombre="props">
            <q-td :props="props">
              <div class="name-cell">
                <q-icon name="business" class="name-icon" />
                <span class="name-text">{{ props.value }}</span>
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <div class="action-buttons">
                <q-btn
                  flat
                  round
                  class="edit-btn"
                  icon="edit"
                  size="sm"
                  @click="goToEdit(props.row.codigo)"
                >
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  class="delete-btn"
                  icon="delete"
                  size="sm"
                  @click="confirmDelete(props.row)"
                >
                  <q-tooltip>Eliminar</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
          <template v-slot:no-data>
            <div class="no-data">
              <q-icon name="business_center" size="48px" />
              <p>No hay empresas registradas</p>
            </div>
          </template>
        </q-table>
      </div>

      <!-- Vista de tarjetas -->
      <div v-else class="card-view">
        <div v-if="loading" class="loading-container">
          <q-spinner-dots size="50px" color="primary" />
          <p>Cargando empresas...</p>
        </div>
        <div v-else-if="filteredEmpresas.length === 0" class="no-data">
          <q-icon name="business_center" size="64px" />
          <p>No hay empresas que coincidan con los filtros</p>
        </div>
        <div v-else class="cards-grid">
          <q-card v-for="empresa in filteredEmpresas" :key="empresa.codigo" class="empresa-card">
            <q-card-section class="card-header">
              <div class="card-title">
                <q-icon name="business" class="card-icon" />
                <span class="card-name">{{ empresa.nombre }}</span>
              </div>
              <div class="card-actions">
                <q-btn
                  flat
                  round
                  class="edit-btn"
                  icon="edit"
                  size="sm"
                  @click="goToEdit(empresa.codigo)"
                >
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  class="delete-btn"
                  icon="delete"
                  size="sm"
                  @click="confirmDelete(empresa)"
                >
                  <q-tooltip>Eliminar</q-tooltip>
                </q-btn>
              </div>
            </q-card-section>
            <q-card-section class="card-content">
              <div class="info-row">
                <span class="info-label">Código:</span>
                <span class="info-value">{{ empresa.codigo_alterno }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Identificación:</span>
                <span class="info-value">{{ empresa.ident }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Teléfono:</span>
                <span class="info-value">{{ empresa.telefono || 'No especificado' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Dirección:</span>
                <span class="info-value">{{ empresa.direccion || 'No especificada' }}</span>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Dialog de confirmación para eliminar -->
    <q-dialog v-model="deleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">
            ¿Está seguro que desea eliminar la empresa "{{ empresaToDelete?.nombre }}"?
          </span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn
            flat
            label="Eliminar"
            color="negative"
            @click="deleteEmpresa"
            :loading="deleting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { empresaService } from '../services/api/empresa.service';
import type { Empresa } from '../types/empresa';
import ViewToggle from '../components/ViewToggle.vue';

const $q = useQuasar();
const router = useRouter();

const empresas = ref<Empresa[]>([]);
const loading = ref(true);
const searchText = ref('');
const deleteDialog = ref(false);
const empresaToDelete = ref<Empresa | null>(null);
const deleting = ref(false);
const viewMode = ref<'grid' | 'list'>('list');
const filtersExpanded = ref(true);

const columns = [
  {
    name: 'codigo_alterno',
    required: true,
    label: 'Código Alterno',
    align: 'left' as const,
    field: 'codigo_alterno',
    sortable: true
  },
  {
    name: 'nombre',
    required: true,
    label: 'Nombre',
    align: 'left' as const,
    field: 'nombre',
    sortable: true
  },
  {
    name: 'ident',
    label: 'Identificación',
    align: 'left' as const,
    field: 'ident',
    sortable: true
  },
  {
    name: 'telefono',
    label: 'Teléfono',
    align: 'left' as const,
    field: 'telefono',
    sortable: true
  },
  {
    name: 'direccion',
    label: 'Dirección',
    align: 'left' as const,
    field: 'direccion',
    sortable: true
  },
  {
    name: 'actions',
    label: 'Acciones',
    align: 'center' as const,
    field: 'actions'
  }
];

const filteredEmpresas = computed(() => {
  if (!searchText.value) return empresas.value;
  
  const search = searchText.value.toLowerCase();
  return empresas.value.filter(empresa => 
    empresa.nombre.toLowerCase().includes(search) ||
    empresa.codigo_alterno.toLowerCase().includes(search) ||
    empresa.ident.toLowerCase().includes(search)
  );
});

const filterMethod = (rows: readonly Empresa[], terms: string, cols: readonly any[], getCellValue: (col: any, row: any) => any): readonly Empresa[] => {
  if (!terms) return rows;
  
  const search = terms.toLowerCase();
  return rows.filter(row => 
    row.nombre.toLowerCase().includes(search) ||
    row.codigo_alterno.toLowerCase().includes(search) ||
    row.ident.toLowerCase().includes(search)
  );
};

const loadEmpresas = async () => {
  try {
    loading.value = true;
    empresas.value = await empresaService.getEmpresas();
  } catch (error) {
    console.error('Error al cargar empresas:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las empresas'
    });
  } finally {
    loading.value = false;
  }
};

const goToCreate = () => {
  router.push('/empresas/nueva');
};

const goToEdit = (codigo: number) => {
  router.push(`/empresas/editar/${codigo}`);
};

const confirmDelete = (empresa: Empresa) => {
  empresaToDelete.value = empresa;
  deleteDialog.value = true;
};

const deleteEmpresa = async () => {
  if (!empresaToDelete.value) return;
  
  try {
    deleting.value = true;
    await empresaService.delete(empresaToDelete.value.codigo);
    
    $q.notify({
      type: 'positive',
      message: 'Empresa eliminada exitosamente'
    });
    
    await loadEmpresas();
    deleteDialog.value = false;
    empresaToDelete.value = null;
  } catch (error) {
    console.error('Error al eliminar empresa:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al eliminar la empresa'
    });
  } finally {
    deleting.value = false;
  }
};

onMounted(() => {
  loadEmpresas();
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
      margin-bottom: 8px;
      
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
    
    .page-subtitle {
      margin: 0;
      color: #666;
      font-size: 0.95rem;
    }
  }
  
  .header-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    
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
  }
}

.filters-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  margin-bottom: 24px;
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
      }
    }
    
    .toggle-icon {
      color: #4facfe;
      transition: transform 0.3s ease;
    }
  }
  
  .filters-content {
    padding: 24px 32px;
    
    .filters-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      
      .modern-input {
        :deep(.q-field__control) {
          border-radius: 12px;
          border: 2px solid #e0e0e0;
          transition: all 0.3s ease;
          
          &:hover {
            border-color: #4facfe;
          }
        }
        
        :deep(.q-field--focused .q-field__control) {
          border-color: #4facfe;
          box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.2);
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
      }
    }
  }
  
  .table-view {
    .modern-table {
      :deep(.q-table__top) {
        padding: 16px 32px;
      }
      
      :deep(.q-table thead th) {
        background: rgba(79, 172, 254, 0.05);
        color: #333;
        font-weight: 600;
        border-bottom: 2px solid rgba(79, 172, 254, 0.1);
      }
      
      :deep(.q-table tbody tr) {
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(79, 172, 254, 0.05);
        }
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
      
      .action-buttons {
        display: flex;
        gap: 8px;
        
        .edit-btn {
          color: #4facfe;
          
          &:hover {
            background: rgba(79, 172, 254, 0.1);
          }
        }
        
        .delete-btn {
          color: #f44336;
          
          &:hover {
            background: rgba(244, 67, 54, 0.1);
          }
        }
      }
    }
    
    .no-data {
      text-align: center;
      padding: 48px 32px;
      color: #666;
      
      .q-icon {
        color: #4facfe;
        margin-bottom: 16px;
      }
    }
  }
  
  .card-view {
    padding: 32px;
    
    .loading-container {
      text-align: center;
      padding: 48px;
      color: #666;
    }
    
    .no-data {
      text-align: center;
      padding: 48px;
      color: #666;
      
      .q-icon {
        color: #4facfe;
        margin-bottom: 16px;
      }
    }
    
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
      
      .empresa-card {
        border-radius: 16px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        border: 2px solid transparent;
        
        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          border-color: rgba(79, 172, 254, 0.3);
        }
        
        .card-header {
          background: linear-gradient(135deg, rgba(79, 172, 254, 0.1), rgba(67, 233, 123, 0.1));
          border-bottom: 1px solid rgba(79, 172, 254, 0.2);
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
              font-size: 1.1rem;
            }
          }
          
          .card-actions {
            display: flex;
            gap: 8px;
            
            .edit-btn {
              color: #4facfe;
              
              &:hover {
                background: rgba(79, 172, 254, 0.2);
              }
            }
            
            .delete-btn {
              color: #f44336;
              
              &:hover {
                background: rgba(244, 67, 54, 0.2);
              }
            }
          }
        }
        
        .card-content {
          .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;
            
            &:last-child {
              border-bottom: none;
            }
            
            .info-label {
              font-weight: 500;
              color: #666;
              min-width: 100px;
            }
            
            .info-value {
              color: #333;
              text-align: right;
              flex: 1;
            }
          }
        }
      }
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
      
      .header-actions {
        justify-content: space-between;
        
        .primary-btn {
          flex: 1;
          margin-left: 16px;
        }
      }
    }
  }
  
  .filters-section,
  .data-section {
    .filters-header,
    .data-header {
      padding: 16px 20px;
    }
    
    .filters-content {
      padding: 20px;
    }
  }
  
  .card-view {
    padding: 20px;
    
    .cards-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }
}
</style>