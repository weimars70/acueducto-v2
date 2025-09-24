<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Datos simulados para el dashboard
const dashboardData = ref({
  totalUsuarios: 1247,
  facturasActivas: 89,
  ingresosMes: 125430,
  consumoPromedio: 45.2,
  alertasPendientes: 12,
  sistemaEstado: 'Operativo'
});

// Datos para gráficos (simulados)
const chartData = ref({
  consumoSemanal: [42, 38, 51, 47, 43, 49, 45],
  ingresosMensuales: [98000, 112000, 125430, 118000, 134000, 142000]
});

const loading = ref(true);

onMounted(() => {
  // Simular carga de datos
  setTimeout(() => {
    loading.value = false;
  }, 1000);
});
</script>

<template>
  <q-page class="dashboard-page">
    <!-- Header del Dashboard -->
    <div class="dashboard-header q-mb-lg">
      <div class="text-title q-mb-sm">Dashboard Principal</div>
      <div class="text-secondary">Resumen general del sistema - {{ new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</div>
    </div>

    <!-- Tarjetas de Métricas Principales -->
    <div class="metrics-grid q-mb-xl">
      <div class="dashboard-card card-primary fade-in-up">
        <div class="card-content">
          <div class="card-header">
            <q-icon name="people" size="32px" class="card-icon" />
            <div class="card-title">Total Usuarios</div>
          </div>
          <div class="card-value">{{ dashboardData.totalUsuarios.toLocaleString() }}</div>
          <div class="card-subtitle">
            <q-icon name="trending_up" size="16px" class="q-mr-xs" />
            +12% vs mes anterior
          </div>
        </div>
      </div>

      <div class="dashboard-card card-info fade-in-up" style="animation-delay: 0.1s">
        <div class="card-content">
          <div class="card-header">
            <q-icon name="receipt" size="32px" class="card-icon" />
            <div class="card-title">Facturas Activas</div>
          </div>
          <div class="card-value">{{ dashboardData.facturasActivas }}</div>
          <div class="card-subtitle">
            <q-icon name="schedule" size="16px" class="q-mr-xs" />
            Pendientes de pago
          </div>
        </div>
      </div>

      <div class="dashboard-card card-accent fade-in-up" style="animation-delay: 0.2s">
        <div class="card-content">
          <div class="card-header">
            <q-icon name="attach_money" size="32px" class="card-icon" />
            <div class="card-title">Ingresos del Mes</div>
          </div>
          <div class="card-value">${{ (dashboardData.ingresosMes / 1000).toFixed(0) }}K</div>
          <div class="card-subtitle">
            <q-icon name="trending_up" size="16px" class="q-mr-xs" />
            +8.5% vs mes anterior
          </div>
        </div>
      </div>

      <div class="dashboard-card fade-in-up" style="animation-delay: 0.3s">
        <div class="card-content">
          <div class="card-header">
            <q-icon name="water_drop" size="32px" class="card-icon" style="color: var(--color-blue-steel)" />
            <div class="card-title">Consumo Promedio</div>
          </div>
          <div class="card-value">{{ dashboardData.consumoPromedio }}m³</div>
          <div class="card-subtitle">
            <q-icon name="trending_down" size="16px" class="q-mr-xs" style="color: var(--color-secondary)" />
            -2.1% vs mes anterior
          </div>
        </div>
      </div>
    </div>

    <!-- Sección de Estado del Sistema y Alertas -->
    <div class="row q-gutter-lg q-mb-xl">
      <div class="col-md-7 col-12">
        <div class="dashboard-card fade-in-up" style="animation-delay: 0.4s">
          <div class="card-header q-mb-md">
            <q-icon name="dashboard" size="24px" class="q-mr-sm" style="color: var(--color-secondary)" />
            <div class="text-subtitle">Estado del Sistema</div>
          </div>
          <div class="system-status">
            <div class="status-item">
              <div class="status-indicator active"></div>
              <div class="status-info">
                <div class="status-title">Servidor Principal</div>
                <div class="status-subtitle">Operativo - 99.9% uptime</div>
              </div>
            </div>
            <div class="status-item">
              <div class="status-indicator active"></div>
              <div class="status-info">
                <div class="status-title">Base de Datos</div>
                <div class="status-subtitle">Conectada - Respuesta: 45ms</div>
              </div>
            </div>
            <div class="status-item">
              <div class="status-indicator warning"></div>
              <div class="status-info">
                <div class="status-title">Sistema de Facturación</div>
                <div class="status-subtitle">Mantenimiento programado</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-4 col-12">
        <div class="dashboard-card fade-in-up" style="animation-delay: 0.5s">
          <div class="card-header q-mb-md">
            <q-icon name="notifications" size="24px" class="q-mr-sm" style="color: var(--color-gold)" />
            <div class="text-subtitle">Alertas Recientes</div>
          </div>
          <div class="alerts-list">
            <div class="alert-item">
              <q-icon name="warning" size="20px" class="alert-icon warning" />
              <div class="alert-content">
                <div class="alert-title">Consumo elevado</div>
                <div class="alert-time">Hace 2 horas</div>
              </div>
            </div>
            <div class="alert-item">
              <q-icon name="info" size="20px" class="alert-icon info" />
              <div class="alert-content">
                <div class="alert-title">Actualización disponible</div>
                <div class="alert-time">Hace 1 día</div>
              </div>
            </div>
            <div class="alert-item">
              <q-icon name="check_circle" size="20px" class="alert-icon success" />
              <div class="alert-content">
                <div class="alert-title">Backup completado</div>
                <div class="alert-time">Hace 2 días</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Accesos Rápidos -->
    <div class="dashboard-card fade-in-up" style="animation-delay: 0.6s">
      <div class="card-header q-mb-lg">
        <q-icon name="speed" size="24px" class="q-mr-sm" style="color: var(--color-secondary)" />
        <div class="text-subtitle">Accesos Rápidos</div>
      </div>
      <div class="quick-actions">
        <q-btn 
          class="quick-action-btn"
          unelevated
          size="lg"
          color="secondary"
          icon="person_add"
          label="Nuevo Usuario"
        />
        <q-btn 
          class="quick-action-btn"
          unelevated
          size="lg"
          color="primary"
          icon="receipt_long"
          label="Generar Factura"
        />
        <q-btn 
          class="quick-action-btn"
          unelevated
          size="lg"
          color="accent"
          icon="analytics"
          label="Ver Reportes"
        />
        <q-btn 
          class="quick-action-btn"
          unelevated
          size="lg"
          color="info"
          icon="settings"
          label="Configuración"
        />
      </div>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
.dashboard-page {
  padding: 24px;
  background: var(--color-white);
  min-height: 100vh;
}

.dashboard-header {
  margin-bottom: 32px;
  
  .text-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--color-grey-carbon);
    margin-bottom: 8px;
  }
}

// Grid de métricas principales
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

// Estilos para tarjetas del dashboard
.dashboard-card {
  .card-content {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    
    .card-icon {
      opacity: 0.9;
    }
    
    .card-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.8;
    }
  }
  
  .card-value {
    font-size: 36px;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 8px;
  }
  
  .card-subtitle {
    font-size: 13px;
    font-weight: 500;
    opacity: 0.8;
    display: flex;
    align-items: center;
  }
}

// Estado del sistema
.system-status {
  .status-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    
    &:last-child {
      border-bottom: none;
    }
    
    .status-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 16px;
      
      &.active {
        background: var(--color-secondary);
        box-shadow: 0 0 0 3px rgba(0, 121, 107, 0.2);
      }
      
      &.warning {
        background: var(--color-gold);
        box-shadow: 0 0 0 3px rgba(255, 213, 79, 0.2);
      }
      
      &.error {
        background: #f44336;
        box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.2);
      }
    }
    
    .status-info {
      flex: 1;
      
      .status-title {
        font-weight: 600;
        color: var(--color-grey-carbon);
        margin-bottom: 2px;
      }
      
      .status-subtitle {
        font-size: 13px;
        color: var(--color-grey-medium);
      }
    }
  }
}

// Lista de alertas
.alerts-list {
  .alert-item {
    display: flex;
    align-items: flex-start;
    padding: 12px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    
    &:last-child {
      border-bottom: none;
    }
    
    .alert-icon {
      margin-right: 12px;
      margin-top: 2px;
      
      &.warning {
        color: var(--color-gold);
      }
      
      &.info {
        color: var(--color-blue-light);
      }
      
      &.success {
        color: var(--color-secondary);
      }
    }
    
    .alert-content {
      flex: 1;
      
      .alert-title {
        font-weight: 500;
        color: var(--color-grey-carbon);
        margin-bottom: 2px;
        font-size: 14px;
      }
      
      .alert-time {
        font-size: 12px;
        color: var(--color-grey-medium);
      }
    }
  }
}

// Accesos rápidos
.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  
  .quick-action-btn {
    height: 56px;
    font-weight: 600;
    border-radius: 12px;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .dashboard-page {
    padding: 16px;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .dashboard-card {
    .card-value {
      font-size: 28px;
    }
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .row {
    margin: 0 -8px;
    
    .col-md-7, .col-md-4 {
      padding: 0 8px;
    }
  }
}

@media (max-width: 480px) {
  .dashboard-header {
    .text-title {
      font-size: 24px;
    }
  }
  
  .dashboard-card {
    padding: 16px;
    
    .card-value {
      font-size: 24px;
    }
  }
}
</style>