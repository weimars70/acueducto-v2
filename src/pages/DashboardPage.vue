<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import MainDrawer from '../components/MainDrawer.vue';
import TabsBar from '../components/TabsBar.vue';
import RouterDebug from '../debug/RouterDebug.vue';
import { ref } from 'vue';

const authStore = useAuthStore();
const router = useRouter();
const leftDrawerOpen = ref(true);

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />
        
        <q-toolbar-title class="row items-center">
          <span class="text-h6 q-ml-sm">Sistema ERP</span>
        </q-toolbar-title>

        <q-btn
          flat
          round
          dense
          icon="logout"
          @click="handleLogout"
        />
      </q-toolbar>
      <TabsBar />
    </q-header>

    <MainDrawer v-model="leftDrawerOpen" />

    <q-page-container>
      <router-view />
    </q-page-container>
    
    <!-- Debug component -->
    <RouterDebug />
  </q-layout>
</template>

<style lang="scss" scoped>
.q-layout {
  background: var(--color-white);
}

.q-header {
  // Degradado horizontal sutil en el header
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%) !important;
  box-shadow: 0 2px 12px rgba(0, 77, 64, 0.15);
}

.q-toolbar {
  height: 64px;
  padding: 0 24px;
  
  .q-btn {
    border-radius: 8px;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: scale(1.05);
    }
  }
}

.q-toolbar-title {
  .text-h6 {
    font-weight: 600;
    font-size: 20px;
    color: white;
    font-family: var(--font-primary);
    letter-spacing: 0.5px;
  }
}

.q-page-container {
  background: var(--color-white);
  min-height: calc(100vh - 64px);
}

// Estilos para el TabsBar si existe
:deep(.tabs-bar) {
  background: rgba(0, 0, 0, 0.1);
  
  .q-tab {
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
    
    &.q-tab--active {
      color: white;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px 8px 0 0;
    }
    
    &:hover {
      color: white;
      background: rgba(255, 255, 255, 0.05);
    }
  }
}

// Responsive
@media (max-width: 768px) {
  .q-toolbar {
    padding: 0 16px;
    
    .q-toolbar-title {
      .text-h6 {
        font-size: 18px;
      }
    }
  }
}
</style>