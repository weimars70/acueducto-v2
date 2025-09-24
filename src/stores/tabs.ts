import { defineStore } from 'pinia';

export interface Tab {
  name: string;
  route: string;
  icon: string;
  closable: boolean;
}

export const useTabsStore = defineStore('tabs', {
  state: () => ({
    tabs: [] as Tab[],
    activeTab: null as string | null,
  }),

  getters: {
    hasActiveTabs: (state) => state.tabs.length > 0,
    currentActiveTab: (state) => state.tabs.find(tab => tab.route === state.activeTab),
  },

  actions: {
    addTab(tab: Tab) {
      const exists = this.tabs.some(t => t.route === tab.route);
      if (!exists) {
        this.tabs.push(tab);
      }
      this.activeTab = tab.route;
    },

    removeTab(route: string) {
      const index = this.tabs.findIndex(tab => tab.route === route);
      if (index !== -1) {
        this.tabs.splice(index, 1);
        if (this.activeTab === route) {
          this.activeTab = this.tabs[Math.min(index, this.tabs.length - 1)]?.route || null;
        }
      }
    },

    setActiveTab(route: string) {
      this.activeTab = route;
    },

    clearAllTabs() {
      this.tabs = [];
      this.activeTab = null;
    },

    // Initialize store safely - prevent automatic navigation to persisted tabs
    initializeStore() {
      // If we have persisted tabs but no valid active tab, clear the active tab
      if (this.activeTab && !this.tabs.some(tab => tab.route === this.activeTab)) {
        this.activeTab = null;
      }
      
      // If activeTab points to sync-data and we're not explicitly navigating there, clear it
      if (this.activeTab === '/sync-data' && window.location.pathname !== '/sync-data') {
        this.activeTab = null;
      }
    },
  },

  persist: {
    key: 'tabs',
    storage: localStorage,
  },
});