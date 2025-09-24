<script setup lang="ts">
const props = defineProps<{
  modelValue: 'grid' | 'list'
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: 'grid' | 'list'): void
}>();
</script>

<template>
  <div class="modern-view-toggle">
    <div class="toggle-container">
      <button 
        class="toggle-btn"
        :class="{ active: modelValue === 'grid' }"
        @click="emit('update:modelValue', 'grid')"
        title="Vista de Tarjetas"
      >
        <q-icon name="grid_view" class="toggle-icon" />
        <span class="toggle-label">Tarjetas</span>
      </button>
      
      <button 
        class="toggle-btn"
        :class="{ active: modelValue === 'list' }"
        @click="emit('update:modelValue', 'list')"
        title="Vista de Tabla"
      >
        <q-icon name="list" class="toggle-icon" />
        <span class="toggle-label">Tabla</span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

// Variables de colores
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
}

.modern-view-toggle {
  font-family: 'Inter', sans-serif;
  
  .toggle-container {
    display: flex;
    background: var(--color-light-gray);
    border-radius: 12px;
    padding: 4px;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
    
    .toggle-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border: none;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: inherit;
      font-size: 14px;
      font-weight: 500;
      color: var(--color-medium-gray);
      min-width: 100px;
      justify-content: center;
      
      .toggle-icon {
        font-size: 18px;
        transition: all 0.3s ease;
      }
      
      .toggle-label {
        font-weight: 500;
        letter-spacing: 0.25px;
      }
      
      &:hover:not(.active) {
        background: rgba(255, 255, 255, 0.7);
        color: var(--color-charcoal-gray);
        transform: translateY(-1px);
      }
      
      &.active {
        background: linear-gradient(135deg, var(--color-jade-green), var(--color-light-green));
        color: var(--color-pure-white);
        box-shadow: 0 2px 8px rgba(0, 121, 107, 0.3);
        transform: translateY(-1px);
        
        .toggle-icon {
          transform: scale(1.1);
        }
      }
      
      &:active {
        transform: translateY(0);
      }
    }
  }
}

// Responsive
@media (max-width: 480px) {
  .modern-view-toggle {
    .toggle-container {
      .toggle-btn {
        min-width: 80px;
        padding: 8px 12px;
        
        .toggle-label {
          display: none;
        }
        
        .toggle-icon {
          font-size: 20px;
        }
      }
    }
  }
}
</style>