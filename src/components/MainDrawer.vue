<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar, Loading } from 'quasar';
import { useAuthStore } from '../stores/auth';
import { useTabsStore } from '../stores/tabs';
import { syncService } from '../services/sync/sync.service';

const props = defineProps<{
  modelValue: boolean
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>();

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const tabsStore = useTabsStore();
const miniState = ref(false);
const syncing = ref(false);

const menuItems = [
  {
    icon: 'storage',
    label: 'Datos Sincronizados',
    route: '/sync-data',
    closable: true,
  }
];

const consumoMenuItems = [
  {
    icon: 'list',
    label: 'Listado Consumo',
    route: '/consumptions',
    closable: true,
  },
  {
    icon: 'calendar_month',
    label: 'Lecturas Mes',
    route: '/monthly-readings',
    closable: true,
  },
  {
    icon: 'add_circle',
    label: 'Nuevo Consumo',
    route: '/consumptions/new',
    closable: true,
  }
];

const diferidosMenuItems = [
  {
    icon: 'account_balance',
    label: 'Cuotas conexión',
    route: '/diferidos/cuotas-conexion',
    closable: true,
  },
  {
    icon: 'speed',
    label: 'Cuotas medidor',
    route: '/diferidos/cuotas-medidor',
    closable: true,
  },
  {
    icon: 'handshake',
    label: 'Acuerdos de Pago',
    route: '/diferidos/acuerdos-pago',
    closable: true,
  }
];

const facturasMenuItems = [
  {
    icon: 'receipt_long',
    label: 'Facturar',
    route: '/facturas/facturar',
    closable: true,
  }
];

const configMenuItems = [
  {
    icon: 'business',
    label: 'Empresas',
    route: '/empresas',
    closable: true,
  },
  {
    icon: 'settings_applications',
    label: 'Maestros',
    route: '/maestros',
    closable: true,
  },
  {
    icon: 'table_chart',
    label: 'Impuestos',
    route: '/dynamic-tables',
    closable: true,
  }
];

const navigateTo = (item: typeof menuItems[0]) => {
  tabsStore.addTab({
    name: item.label,
    route: item.route,
    icon: item.icon,
    closable: item.closable,
  });
  router.push(item.route);
  emit('update:modelValue', false);
};

const toggleMiniState = () => {
  miniState.value = !miniState.value;
};

const handleSync = async () => {
  if (syncing.value) return;

  try {
    syncing.value = true;
    Loading.show({
      message: 'Sincronizando datos...',
      spinnerColor: 'primary'
    });

    await syncService.syncViews();
    
    $q.notify({
      type: 'positive',
      message: 'Datos sincronizados correctamente'
    });
  } catch (error) {
    console.error('Error syncing:', error);
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Error al sincronizar los datos'
    });
  } finally {
    syncing.value = false;
    Loading.hide();
  }
};
</script>

<template>
  <q-drawer
    :model-value="modelValue"
    :mini="miniState"
    :width="260"
    :breakpoint="500"
    class="modern-sidebar"
    show-if-above
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- Header -->
    <q-toolbar class="sidebar-header">
      <q-avatar size="40px" class="header-avatar">
        <q-icon name="water_drop" size="24px" color="white" />
      </q-avatar>
      <q-toolbar-title class="header-title">
        Acueducto
      </q-toolbar-title>
      <q-btn
        flat
        round
        dense
        icon="chevron_left"
        @click="toggleMiniState"
        :rotate="miniState ? 180 : 0"
        class="toggle-btn"
      />
    </q-toolbar>

    <!-- User Info -->
    <q-list class="sidebar-content">
      <q-item v-if="authStore.user" class="user-info">
        <q-item-section avatar>
          <q-avatar size="48px" class="user-avatar">
            {{ (authStore.user.name || authStore.user.username || authStore.user.email || 'U').charAt(0).toUpperCase() }}
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label class="user-name">{{ authStore.user.name || authStore.user.username || 'Usuario' }}</q-item-label>
          <q-item-label class="user-email">{{ authStore.user.email || '' }}</q-item-label>
        </q-item-section>
      </q-item>

      <q-separator class="user-separator" />

      <!-- Separador adicional -->
      <q-separator class="section-separator" />

      <!-- Consumo Section -->
      <q-expansion-item
        icon="show_chart"
        label="Consumo"
        class="menu-expansion consumo-expansion"
        header-class="expansion-header"
      >
        <q-item
          v-for="item in consumoMenuItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          @click="navigateTo(item)"
          class="menu-item consumo-item"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" class="menu-icon" />
          </q-item-section>
          <q-item-section>
            <span class="menu-label">{{ item.label }}</span>
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <!-- Menu Items -->
      <q-item
        v-for="item in menuItems"
        :key="item.route"
        clickable
        v-ripple
        :active="router.currentRoute.value.path === item.route"
        @click="navigateTo(item)"
        class="menu-item"
      >
        <q-item-section avatar>
          <q-icon :name="item.icon" class="menu-icon" />
        </q-item-section>
        <q-item-section>
          <span class="menu-label">{{ item.label }}</span>
        </q-item-section>
      </q-item>

      <!-- Diferidos Section -->
      <q-separator class="section-separator" />
      
      <q-expansion-item
        icon="payment"
        label="Diferidos"
        class="menu-expansion diferidos-expansion"
        header-class="expansion-header"
      >
        <q-item
          v-for="item in diferidosMenuItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          @click="navigateTo(item)"
          class="menu-item diferidos-item"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" class="menu-icon" />
          </q-item-section>
          <q-item-section>
            <span class="menu-label">{{ item.label }}</span>
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <!-- Facturas Section -->
      <q-separator class="section-separator" />
      
      <q-expansion-item
        icon="receipt"
        label="Facturas"
        class="menu-expansion facturas-expansion"
        header-class="expansion-header"
      >
        <q-item
          v-for="item in facturasMenuItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          @click="navigateTo(item)"
          class="menu-item facturas-item"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" class="menu-icon" />
          </q-item-section>
          <q-item-section>
            <span class="menu-label">{{ item.label }}</span>
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <!-- Configuration Section -->
      <q-separator class="section-separator" />
      
      <q-expansion-item
        icon="settings"
        label="Configuración"
        class="menu-expansion config-expansion"
        header-class="expansion-header"
      >
        <q-item
          v-for="item in configMenuItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          @click="navigateTo(item)"
          class="menu-item config-item"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" class="menu-icon" />
          </q-item-section>
          <q-item-section>
            <span class="menu-label">{{ item.label }}</span>
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <!-- Sync Button -->
      <q-separator class="section-separator" />
      
      <q-item 
        clickable 
        v-ripple 
        @click="handleSync"
        :disable="syncing"
        class="sync-button"
      >
        <q-item-section avatar>
          <q-icon :name="syncing ? 'sync_disabled' : 'sync'" class="sync-icon" :class="{ 'syncing': syncing }" />
        </q-item-section>
        <q-item-section>
          <span class="sync-label">{{ syncing ? 'Sincronizando...' : 'Sincronizar Datos' }}</span>
        </q-item-section>
      </q-item>
    </q-list>
  </q-drawer>
</template>

<style lang="scss" scoped>
// Importar fuente Inter
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

// Nueva paleta profesional
$primary-dark: #004D40;     // Verde azulado oscuro
$primary-medium: #00796B;   // Verde jade
$accent-gold: #FFD54F;      // Dorado
$white: #FFFFFF;            // Blanco
$gray-light: #F5F5F5;       // Gris neutro claro
$gray-medium: #9E9E9E;      // Gris neutro
$active-bg: #E0F2F1;        // Verde claro para activos
$hover-bg: #F0F4F8;         // Gris azulado claro para hover
$border-color: #E0E0E0;     // Bordes suaves

// Variables de colores CSS
:root {
  --sidebar-primary-dark: #{$primary-dark};
  --sidebar-primary-medium: #{$primary-medium};
  --sidebar-accent-gold: #{$accent-gold};
  --sidebar-white: #{$white};
  --sidebar-gray-light: #{$gray-light};
  --sidebar-gray-medium: #{$gray-medium};
  --sidebar-active-bg: #1B5E20;
  --sidebar-hover-bg: #2E7D32;
  --sidebar-border-color: #388E3C;
  --sidebar-card-bg: #1B5E20;
  --sidebar-text-primary: #E8F5E8;
  --sidebar-text-secondary: #C8E6C9;
}

.modern-sidebar {
  // Degradado vertical de verde oscuro a verde jade
  background: linear-gradient(180deg, #002e2a 0%, #003d36 100%) !important;
  box-shadow: 4px 0 20px rgba(0, 77, 64, 0.15) !important;
  border: none !important;
  font-family: 'Poppins', 'Inter', sans-serif !important;
  
  // Header de la barra lateral
  .sidebar-header {
    height: 80px;
    background: linear-gradient(135deg, rgba(52, 183, 136, 0.15), rgba(116, 198, 157, 0.15));
    backdrop-filter: blur(15px);
    border-bottom: 1px solid rgba(52, 183, 136, 0.2);
    padding: 0 24px;
    
    .header-avatar {
      background: linear-gradient(135deg, var(--sidebar-primary-dark), var(--sidebar-primary-medium)) !important;
      box-shadow: 0 6px 20px rgba(0, 77, 64, 0.3) !important;
      border: 2px solid rgba(255, 255, 255, 0.2) !important;
      transition: all 0.3s ease !important;
      
      &:hover {
        transform: scale(1.05) !important;
        box-shadow: 0 8px 25px rgba(0, 77, 64, 0.4) !important;
      }
    }
    
    .header-title {
       color: #FFFFFF;
       font-weight: 700;
       font-size: 22px;
       letter-spacing: 0.8px;
       margin-left: 16px;
       text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
     }
    
    .toggle-btn {
      color: var(--sidebar-white);
      transition: all 0.3s ease;
      background: linear-gradient(135deg, rgba(52, 183, 136, 0.3), rgba(116, 198, 157, 0.3));
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      backdrop-filter: blur(10px);
      
      &:hover {
        background: linear-gradient(135deg, rgba(52, 183, 136, 0.5), rgba(116, 198, 157, 0.5));
        transform: scale(1.1);
        box-shadow: 0 4px 15px rgba(52, 183, 136, 0.3);
      }
      
      &:active {
        transform: scale(0.95);
      }
    }
  }
  
  // Contenido de la barra lateral
  .sidebar-content {
    padding: 20px 16px;
    height: calc(100vh - 72px);
    overflow-y: auto;
    
    &::-webkit-scrollbar {
      width: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
    }
  }
  
  // Información del usuario
  .user-info {
    margin: 16px !important;
    padding: 20px !important;
    background: var(--sidebar-card-bg) !important;
    border-radius: 12px !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
    border: 1px solid var(--sidebar-border-color) !important;
    position: relative !important;
    
    &:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25) !important;
      background: var(--sidebar-hover-bg) !important;
    }
    
    .user-avatar {
      width: 48px !important;
      height: 48px !important;
      border-radius: 50% !important;
      background: var(--sidebar-accent-gold) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-weight: 700 !important;
      font-size: 20px !important;
      color: var(--sidebar-primary-dark) !important;
      margin-bottom: 16px !important;
      box-shadow: 0 4px 12px rgba(255, 213, 79, 0.3) !important;
      border: 2px solid var(--sidebar-white) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      font-family: 'Poppins', sans-serif !important;
      
      &:hover {
        transform: scale(1.05) !important;
        box-shadow: 0 6px 16px rgba(255, 213, 79, 0.4) !important;
      }
    }
    
    .user-name {
      font-size: 17px !important;
      font-weight: 600 !important;
      color: var(--sidebar-text-primary) !important;
      margin-bottom: 6px !important;
      font-family: 'Poppins', sans-serif !important;
      letter-spacing: 0.4px !important;
      line-height: 1.3 !important;
    }
    
    .user-email {
      font-size: 14px !important;
      color: var(--sidebar-text-secondary) !important;
      font-weight: 400 !important;
      font-family: 'Poppins', sans-serif !important;
      letter-spacing: 0.3px !important;
      line-height: 1.4 !important;
    }
  }
  
  .user-separator {
    margin: 20px 16px !important;
    height: 2px !important;
    border: none !important;
    background: linear-gradient(90deg, transparent, var(--sidebar-border-color), transparent) !important;
    opacity: 0.8 !important;
    border-radius: 1px !important;
  }
  
  .section-separator {
    margin: 16px 20px !important;
    height: 1px !important;
    border: none !important;
    background: linear-gradient(90deg, transparent, var(--sidebar-border-color), transparent) !important;
    opacity: 0.6 !important;
    border-radius: 0.5px !important;
  }
  
  // Items del menú
    .menu-item {
      margin: 6px 16px !important;
      border-radius: 10px !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      position: relative !important;
      background: var(--sidebar-card-bg) !important;
      border: 1px solid var(--sidebar-border-color) !important;
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15) !important;
      padding: 14px 18px !important;
      
      &:hover {
        background: var(--sidebar-hover-bg) !important;
        border-color: var(--sidebar-accent-gold) !important;
        transform: translateX(3px) !important;
        box-shadow: 0 5px 12px rgba(0, 0, 0, 0.2) !important;
        
        .menu-icon {
          color: var(--sidebar-accent-gold) !important;
          transform: scale(1.08) !important;
        }
        
        .menu-label {
          color: var(--sidebar-text-primary) !important;
        }
      }
      
      &.q-item--active {
        background: var(--sidebar-active-bg) !important;
        border: 1px solid var(--sidebar-accent-gold) !important;
        box-shadow: 0 6px 16px rgba(255, 213, 79, 0.2) !important;
        transform: translateX(5px) !important;
        
        .menu-icon {
          color: var(--sidebar-accent-gold) !important;
          transform: scale(1.12) !important;
        }
        
        .menu-label {
          color: var(--sidebar-text-primary) !important;
          font-weight: 700 !important;
        }
      }
    
    .menu-icon {
      color: var(--sidebar-text-secondary) !important;
      font-size: 22px !important;
      margin-right: 18px !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      font-weight: 500 !important;
    }
    
    .menu-label {
      color: var(--sidebar-text-secondary) !important;
      font-size: 16px !important;
      font-weight: 600 !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      letter-spacing: 0.3px !important;
      font-family: 'Poppins', sans-serif !important;
      line-height: 1.4 !important;
      word-spacing: 0.1em !important;
    }
  }
  
  // Expansion items
  .menu-expansion {
    margin: 8px 0;
    border-radius: 14px;
    overflow: hidden;
    background: linear-gradient(135deg, rgba(52, 183, 136, 0.1), rgba(116, 198, 157, 0.1));
    border: 1px solid rgba(52, 183, 136, 0.2);
    backdrop-filter: blur(5px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      background: linear-gradient(135deg, rgba(52, 183, 136, 0.15), rgba(116, 198, 157, 0.15));
      border-color: rgba(52, 183, 136, 0.4);
      box-shadow: 0 4px 15px rgba(52, 183, 136, 0.2);
      transform: translateX(2px);
    }
    
    :deep(.expansion-header) {
      background: var(--sidebar-card-bg) !important;
      border-radius: 10px !important;
      margin: 6px 16px !important;
      border: 1px solid var(--sidebar-border-color) !important;
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15) !important;
      color: var(--sidebar-text-secondary) !important;
      font-weight: 600 !important;
      font-size: 16px !important;
      padding: 14px 18px !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      font-family: 'Poppins', sans-serif !important;
      letter-spacing: 0.3px !important;
      line-height: 1.4 !important;
      
      .q-icon {
        color: var(--sidebar-text-secondary) !important;
        font-size: 20px !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        font-weight: 500 !important;
      }
      
      &:hover {
        background: var(--sidebar-hover-bg) !important;
        border-color: var(--sidebar-accent-gold) !important;
        transform: translateX(3px) !important;
        color: var(--sidebar-text-primary) !important;
        
        .q-icon {
          color: var(--sidebar-accent-gold) !important;
          transform: scale(1.05) !important;
        }
      }
    }
    
    &.q-expansion-item--expanded {
      background: linear-gradient(135deg, rgba(52, 183, 136, 0.15), rgba(116, 198, 157, 0.15));
      border-color: rgba(52, 183, 136, 0.4);
      
      :deep(.expansion-header) {
        background: linear-gradient(135deg, rgba(52, 183, 136, 0.2), rgba(116, 198, 157, 0.2));
        
        .q-icon {
          color: var(--sidebar-accent-green);
        }
      }
    }
    
    :deep(.q-expansion-item__content) {
      background: rgba(0, 0, 0, 0.2);
      padding: 10px 0;
      backdrop-filter: blur(3px);
    }
    
    .menu-item {
      margin: 2px 8px;
      padding-left: 48px;
      border-radius: 10px;
      
      .menu-label {
        font-size: 13px;
        font-weight: 500;
      }
      
      .menu-icon {
        font-size: 18px;
      }
      
      &:hover {
        transform: translateX(4px);
      }
      
      &.q-item--active {
        transform: translateX(4px);
      }
    }
  }
  
  // Botón de sincronización
  .sync-button {
    margin: 6px 16px !important;
    border-radius: 10px !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    position: relative !important;
    background: var(--sidebar-card-bg) !important;
    border: 1px solid var(--sidebar-border-color) !important;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15) !important;
    padding: 14px 18px !important;
    
    &:hover {
      background: var(--sidebar-hover-bg) !important;
      border-color: var(--sidebar-accent-gold) !important;
      transform: translateX(3px) !important;
      box-shadow: 0 5px 12px rgba(0, 0, 0, 0.2) !important;
      
      .sync-icon {
        color: var(--sidebar-accent-gold) !important;
        transform: scale(1.08) !important;
      }
      
      .sync-label {
        color: var(--sidebar-text-primary) !important;
      }
    }

    &:active {
      background: var(--sidebar-active-bg) !important;
      border: 1px solid var(--sidebar-accent-gold) !important;
      box-shadow: 0 6px 16px rgba(255, 213, 79, 0.2) !important;
      transform: translateX(5px) !important;
    }
    
    &:disabled {
      background: rgba(255, 255, 255, 0.1) !important;
      color: rgba(255, 255, 255, 0.4) !important;
      cursor: not-allowed !important;
      transform: none !important;
      box-shadow: none !important;
      border-color: rgba(255, 255, 255, 0.1) !important;
    }
    
    .sync-icon {
      color: var(--sidebar-text-secondary) !important;
      font-size: 22px !important;
      margin-right: 18px !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      font-weight: 500 !important;
      
      &.syncing {
        animation: spin 1s linear infinite !important;
        color: var(--sidebar-accent-gold) !important;
      }
    }
    
    .sync-label {
      color: var(--sidebar-text-secondary) !important;
      font-size: 16px !important;
      font-weight: 600 !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      letter-spacing: 0.3px !important;
      font-family: 'Poppins', sans-serif !important;
      line-height: 1.4 !important;
      word-spacing: 0.1em !important;
    }
  }
}

// Animación para el icono de sincronización
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// Responsive
@media (max-width: 768px) {
  .modern-sidebar {
    .sidebar-content {
      padding: 16px 12px;
    }
    
    .menu-item {
      margin: 4px 0;
      
      .menu-label {
        font-size: 13px;
      }
      
      .menu-icon {
        font-size: 20px;
      }
    }
    
    .user-info {
      padding: 12px;
      
      .user-name {
        font-size: 15px;
      }
      
      .user-email {
        font-size: 12px;
      }
    }
  }
}

@media (max-width: 480px) {
  .modern-sidebar {
    .sidebar-header {
      height: 64px;
      padding: 0 16px;
      
      .header-title {
        font-size: 18px;
      }
    }
  }
}
</style>