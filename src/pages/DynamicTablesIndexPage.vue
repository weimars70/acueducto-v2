<template>
  <q-page class="impuestos-page">
    <div class="page-container">
      <!-- Header Section -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <div class="title-section">
              <div class="title-icon">
                <q-icon name="account_balance" size="24px" />
              </div>
              <h1 class="page-title">Gestión de Impuestos</h1>
            </div>
            <p class="page-subtitle">
              Administra y configura los diferentes tipos de impuestos del sistema
            </p>
          </div>
        </div>
      </div>

      <!-- Cards Grid -->
      <div class="cards-container">
        <div class="cards-grid">
          <div 
            v-for="table in availableTables" 
            :key="table.id"
            class="table-card-wrapper"
          >
            <q-card 
              class="table-card cursor-pointer"
              @click="navigateToTable(table.id)"
            >
              <div class="card-header">
                <div class="card-icon">
                  <q-icon name="receipt" size="28px" />
                </div>
                <div class="card-badge">
                  <q-icon name="settings" size="14px" />
                </div>
              </div>
              
              <q-card-section class="card-content">
                <div class="card-title">{{ table.title }}</div>
                <div class="card-description" v-if="table.description">
                  {{ table.description }}
                </div>
              </q-card-section>

              <q-card-actions class="card-actions">
                <q-btn 
                  class="manage-btn"
                  unelevated
                  @click.stop="navigateToTable(table.id)"
                >
                  <q-icon name="arrow_forward" size="18px" />
                  <span>Gestionar</span>
                </q-btn>
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="availableTables.length === 0" class="empty-state">
        <div class="empty-icon">
          <q-icon name="table_chart" size="80px" />
        </div>
        <div class="empty-title">
          No hay configuraciones de impuestos
        </div>
        <div class="empty-description">
          Las configuraciones de impuestos aparecerán aquí cuando estén disponibles
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getDynamicTablesList } from '../config/dynamic-tables.config';

const router = useRouter();

// Estado reactivo
const availableTables = ref<Array<{ id: string; title: string; description?: string }>>([]);

// Métodos
const loadAvailableTables = () => {
  availableTables.value = getDynamicTablesList();
};

const navigateToTable = (tableId: string) => {
  router.push({ name: 'dynamic-table', params: { tableId } });
};

// Lifecycle
onMounted(() => {
  loadAvailableTables();
});
</script>

<style scoped>
.impuestos-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f5e8 0%, #f0f9f0 50%, #e1f5e1 100%);
  padding: 24px;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Header Styles */
.page-header {
  margin-bottom: 40px;
  
  .header-content {
    background: rgba(255, 255, 255, 0.95);
    padding: 32px;
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(46, 125, 50, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(76, 175, 80, 0.1);
  }
  
  .header-text {
    .title-section {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 12px;
      
      .title-icon {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        background: linear-gradient(135deg, #4caf50, #66bb6a);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 4px 16px rgba(76, 175, 80, 0.3);
      }
      
      .page-title {
        margin: 0;
        background: linear-gradient(135deg, #2e7d32, #4caf50);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-weight: 700;
        font-size: 2rem;
        line-height: 1.2;
      }
    }
    
    .page-subtitle {
      margin: 0;
      color: #5d7c61;
      font-size: 1.1rem;
      font-weight: 400;
      line-height: 1.5;
    }
  }
}

/* Cards Container */
.cards-container {
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
  }
  
  .table-card-wrapper {
    .table-card {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 16px;
      border: 1px solid rgba(76, 175, 80, 0.1);
      box-shadow: 0 4px 20px rgba(46, 125, 50, 0.08);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #4caf50, #66bb6a, #81c784);
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 40px rgba(46, 125, 50, 0.15);
        border-color: rgba(76, 175, 80, 0.3);
        
        &::before {
          opacity: 1;
        }
        
        .card-header .card-icon {
          transform: scale(1.1);
          background: linear-gradient(135deg, #388e3c, #4caf50);
        }
        
        .manage-btn {
          background: linear-gradient(135deg, #4caf50, #66bb6a);
          color: white;
          transform: translateX(4px);
        }
      }
      
      .card-header {
        padding: 24px 24px 0;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        
        .card-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #e8f5e8, #f1f8e9);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2e7d32;
          transition: all 0.3s ease;
          border: 2px solid rgba(76, 175, 80, 0.1);
        }
        
        .card-badge {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background: rgba(76, 175, 80, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4caf50;
        }
      }
      
      .card-content {
        padding: 20px 24px;
        
        .card-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1b5e20;
          margin-bottom: 8px;
          line-height: 1.3;
        }
        
        .card-description {
          color: #5d7c61;
          font-size: 0.95rem;
          line-height: 1.5;
          opacity: 0.9;
        }
      }
      
      .card-actions {
        padding: 0 24px 24px;
        
        .manage-btn {
          background: rgba(76, 175, 80, 0.1);
          color: #2e7d32;
          border: 1px solid rgba(76, 175, 80, 0.2);
          border-radius: 10px;
          padding: 12px 20px;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          justify-content: center;
          
          &:hover {
            background: linear-gradient(135deg, #4caf50, #66bb6a);
            color: white;
            border-color: transparent;
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
          }
        }
      }
    }
  }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  
  .empty-icon {
    margin-bottom: 24px;
    color: rgba(76, 175, 80, 0.3);
  }
  
  .empty-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2e7d32;
    margin-bottom: 12px;
  }
  
  .empty-description {
    color: #5d7c61;
    font-size: 1rem;
    line-height: 1.5;
    max-width: 400px;
    margin: 0 auto;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .impuestos-page {
    padding: 16px;
  }
  
  .page-header {
    margin-bottom: 24px;
    
    .header-content {
      padding: 24px 20px;
      
      .title-section {
        .title-icon {
          width: 48px;
          height: 48px;
        }
        
        .page-title {
          font-size: 1.6rem;
        }
      }
      
      .page-subtitle {
        font-size: 1rem;
      }
    }
  }
  
  .cards-container {
    .cards-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }
}

@media (max-width: 480px) {
  .page-header {
    .header-content {
      .title-section {
        flex-direction: column;
        text-align: center;
        gap: 12px;
        
        .page-title {
          font-size: 1.4rem;
        }
      }
    }
  }
}
</style>