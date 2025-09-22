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
    :width="240"
    :breakpoint="500"
    bordered
    class="bg-white"
    show-if-above
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- Header -->
    <q-toolbar class="bg-primary text-white">
      <q-avatar>
        <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg" />
      </q-avatar>
      <q-toolbar-title class="text-weight-bold">
        Menu
      </q-toolbar-title>
      <q-btn
        flat
        round
        dense
        icon="chevron_left"
        @click="toggleMiniState"
        :rotate="miniState ? 180 : 0"
      />
    </q-toolbar>

    <!-- User Info -->
    <q-list padding>
      <q-item v-if="authStore.user">
        <q-item-section avatar>
          <q-avatar color="primary" text-color="white">
            {{ (authStore.user.name || authStore.user.username || authStore.user.email || 'U').charAt(0).toUpperCase() }}
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ authStore.user.name || authStore.user.username || 'Usuario' }}</q-item-label>
          <q-item-label caption>{{ authStore.user.email || '' }}</q-item-label>
        </q-item-section>
      </q-item>

      <q-separator spaced />

      <!-- Consumo Section -->
      <q-expansion-item
        icon="show_chart"
        label="Consumo"
        class="consumo-expansion"
      >
        <q-item
          v-for="item in consumoMenuItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          active-class="text-primary"
          @click="navigateTo(item)"
          class="consumo-item"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            {{ item.label }}
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
        active-class="text-primary"
        @click="navigateTo(item)"
      >
        <q-item-section avatar>
          <q-icon :name="item.icon" />
        </q-item-section>
        <q-item-section>
          {{ item.label }}
        </q-item-section>
      </q-item>

      <!-- Diferidos Section -->
      <q-separator spaced />
      
      <q-expansion-item
        icon="payment"
        label="Diferidos"
        class="diferidos-expansion"
      >
        <q-item
          v-for="item in diferidosMenuItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          active-class="text-primary"
          @click="navigateTo(item)"
          class="diferidos-item"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <!-- Facturas Section -->
      <q-separator spaced />
      
      <q-expansion-item
        icon="receipt"
        label="Facturas"
        class="facturas-expansion"
      >
        <q-item
          v-for="item in facturasMenuItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          active-class="text-primary"
          @click="navigateTo(item)"
          class="facturas-item"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <!-- Configuration Section -->
      <q-separator spaced />
      
      <q-expansion-item
        icon="settings"
        label="Configuración"
        class="config-expansion"
      >
        <q-item
          v-for="item in configMenuItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          active-class="text-primary"
          @click="navigateTo(item)"
          class="config-item"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <!-- Sync Button -->
      <q-separator spaced />
      
      <q-item 
        clickable 
        v-ripple 
        @click="handleSync"
        :disable="syncing"
      >
        <q-item-section avatar>
          <q-icon :name="syncing ? 'sync_disabled' : 'sync'" />
        </q-item-section>
        <q-item-section>
          {{ syncing ? 'Sincronizando...' : 'Sincronizar Datos' }}
        </q-item-section>
      </q-item>
    </q-list>
  </q-drawer>
</template>

<style lang="scss" scoped>
.q-drawer {
  .q-toolbar {
    height: 64px;
  }
  
  .q-item {
    border-radius: 8px;
    margin: 0 8px;
    
    &.q-item--active {
      background: rgba(25, 118, 210, 0.1);
    }
  }

  .consumo-expansion {
    margin: 0 8px;
    border-radius: 8px;
    
    :deep(.q-expansion-item__container) {
      .q-item {
        margin: 0;
        border-radius: 0;
      }
    }
    
    .consumo-item {
      padding-left: 48px;
      margin: 0 8px;
      border-radius: 8px;
      
      &.q-item--active {
        background: rgba(25, 118, 210, 0.1);
      }
    }
  }

  .diferidos-expansion {
    margin: 0 8px;
    border-radius: 8px;
    
    :deep(.q-expansion-item__container) {
      .q-item {
        margin: 0;
        border-radius: 0;
      }
    }
    
    .diferidos-item {
      padding-left: 48px;
      margin: 0 8px;
      border-radius: 8px;
      
      &.q-item--active {
        background: rgba(25, 118, 210, 0.1);
      }
    }
  }

  .facturas-expansion {
    margin: 0 8px;
    border-radius: 8px;
    
    :deep(.q-expansion-item__container) {
      .q-item {
        margin: 0;
        border-radius: 0;
      }
    }
    
    .facturas-item {
      padding-left: 48px;
      margin: 0 8px;
      border-radius: 8px;
      
      &.q-item--active {
        background: rgba(25, 118, 210, 0.1);
      }
    }
  }

  .config-expansion {
    margin: 0 8px;
    border-radius: 8px;
    
    :deep(.q-expansion-item__container) {
      .q-item {
        margin: 0;
        border-radius: 0;
      }
    }
    
    .config-item {
      padding-left: 48px;
      margin: 0 8px;
      border-radius: 8px;
      
      &.q-item--active {
        background: rgba(25, 118, 210, 0.1);
      }
    }
  }
}
</style>