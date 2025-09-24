<template>
  <div class="debug-panel" v-if="showDebug">
    <div class="debug-header">
      <h4>Router Debug Panel</h4>
      <q-btn flat icon="close" @click="showDebug = false" />
    </div>
    <div class="debug-content">
      <div class="debug-section">
        <h5>Current Route</h5>
        <pre>{{ JSON.stringify(currentRoute, null, 2) }}</pre>
      </div>
      <div class="debug-section">
        <h5>Tabs State</h5>
        <pre>{{ JSON.stringify(tabsState, null, 2) }}</pre>
      </div>
      <div class="debug-section">
        <h5>Navigation History</h5>
        <div v-for="(nav, index) in navigationHistory" :key="index" class="nav-item">
          <small>{{ nav.timestamp }}</small>
          <div>{{ nav.from }} → {{ nav.to }}</div>
        </div>
      </div>
      <div class="debug-actions">
        <q-btn @click="clearTabs" color="warning" size="sm">Clear All Tabs</q-btn>
        <q-btn @click="clearStorage" color="negative" size="sm">Clear Storage</q-btn>
        <q-btn @click="goToDashboard" color="primary" size="sm">Go to Dashboard</q-btn>
      </div>
    </div>
  </div>
  <q-btn 
    v-else
    fab
    icon="bug_report"
    color="orange"
    class="debug-toggle"
    @click="showDebug = true"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTabsStore } from '../stores/tabs';

const router = useRouter();
const route = useRoute();
const tabsStore = useTabsStore();

const showDebug = ref(false);
const navigationHistory = ref<Array<{from: string, to: string, timestamp: string}>>([]);

const currentRoute = computed(() => ({
  path: route.path,
  name: route.name,
  params: route.params,
  query: route.query
}));

const tabsState = computed(() => ({
  tabs: tabsStore.tabs,
  activeTab: tabsStore.activeTab,
  tabsCount: tabsStore.tabs.length
}));

// Watch for route changes
watch(() => route.path, (to, from) => {
  if (from && to !== from) {
    navigationHistory.value.unshift({
      from,
      to,
      timestamp: new Date().toLocaleTimeString()
    });
    
    // Keep only last 10 navigations
    if (navigationHistory.value.length > 10) {
      navigationHistory.value = navigationHistory.value.slice(0, 10);
    }
    
    console.log('Route changed:', { from, to, activeTab: tabsStore.activeTab });
  }
});

const clearTabs = () => {
  tabsStore.tabs.splice(0);
  tabsStore.activeTab = null;
  console.log('Tabs cleared');
};

const clearStorage = () => {
  localStorage.clear();
  sessionStorage.clear();
  console.log('Storage cleared');
  location.reload();
};

const goToDashboard = () => {
  tabsStore.activeTab = null;
  router.push('/dashboard');
};
</script>

<style scoped>
.debug-panel {
  position: fixed;
  top: 60px;
  right: 10px;
  width: 400px;
  max-height: 80vh;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 9999;
  overflow: hidden;
}

.debug-header {
  background: #f5f5f5;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
}

.debug-header h4 {
  margin: 0;
  font-size: 14px;
}

.debug-content {
  padding: 10px;
  max-height: 60vh;
  overflow-y: auto;
}

.debug-section {
  margin-bottom: 15px;
}

.debug-section h5 {
  margin: 0 0 5px 0;
  font-size: 12px;
  color: #666;
}

.debug-section pre {
  background: #f8f8f8;
  padding: 8px;
  border-radius: 4px;
  font-size: 10px;
  margin: 0;
  overflow-x: auto;
}

.nav-item {
  background: #f0f0f0;
  padding: 5px;
  margin: 2px 0;
  border-radius: 3px;
  font-size: 11px;
}

.debug-actions {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.debug-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9998;
}
</style>