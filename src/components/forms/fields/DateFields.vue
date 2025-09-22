```vue
<script setup lang="ts">
import { computed } from 'vue';
import { months } from '../../../utils/dates';

const props = defineProps<{
  modelValue: {
    year: string;
    mes: string;
    fecha: string;
  }
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: typeof props.modelValue): void
}>();

const currentYear = new Date().getFullYear();
const years = computed(() => {
  const result = [];
  for (let i = currentYear; i >= currentYear - 5; i--) {
    result.push(i);
  }
  return result;
});

const updateField = (field: keyof typeof props.modelValue, value: string) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value
  });
};

const formatDate = (date: string) => {
  if (!date) return '';
  const [year, month, day] = date.split('-');
  return `${year}-${month}-${day}`;
};
</script>

<template>
  <div class="row q-col-gutter-sm">
    <!-- Año -->
    <div class="col-12 col-sm-4">
      <q-select
        :model-value="modelValue.year"
        :options="years"
        label="Año"
        outlined
        dense
        emit-value
        map-options
        @update:model-value="value => updateField('year', value)"
      />
    </div>

    <!-- Mes -->
    <div class="col-12 col-sm-4">
      <q-select
        :model-value="modelValue.mes"
        :options="months"
        label="Mes"
        outlined
        dense
        option-value="text"
        option-label="text"
        emit-value
        map-options
        @update:model-value="value => updateField('mes', value)"
      />
    </div>

    <!-- Fecha -->
    <div class="col-12 col-sm-4">
      <q-input
        :model-value="modelValue.fecha"
        label="Fecha"
        outlined
        dense
        readonly
        @update:model-value="value => updateField('fecha', formatDate(value))"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date
                :model-value="modelValue.fecha"
                mask="YYYY-MM-DD"
                @update:model-value="value => updateField('fecha', value)"
              />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.row {
  margin: 0 -4px;
  > div {
    padding: 0 4px;
  }
}

// Estilos para campos de fecha modernos
:deep(.q-field) {
  .q-field__control {
    border-radius: 12px;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.9);
    border: 2px solid transparent;

    &:hover {
      background: rgba(255, 255, 255, 1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &.q-field__control--focused {
      border-color: #1976d2;
      box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
    }
  }

  .q-field__native {
    font-weight: 500;
    color: #2c3e50;
  }

  .q-field__label {
    font-weight: 600;
    color: #546e7a;
  }

  // Estilos específicos para select
  &.q-select {
    .q-field__append {
      .q-icon {
        color: #1976d2;
        transition: all 0.3s ease;
      }
    }

    &.q-field--focused {
      .q-field__append .q-icon {
        transform: rotate(180deg);
      }
    }
  }

  // Estilos para el campo de fecha con popup
  .q-field__append {
    .q-icon {
      color: #1976d2;
      transition: all 0.3s ease;
      cursor: pointer;

      &:hover {
        color: #1565c0;
        transform: scale(1.1);
      }
    }
  }
}

// Estilos para el popup del calendario
:deep(.q-date) {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);

  .q-date__header {
    background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
    border-radius: 12px 12px 0 0;
  }

  .q-date__view {
    padding: 16px;
  }

  .q-btn {
    border-radius: 8px;
    transition: all 0.3s ease;

    &.q-date__calendar-item--in {
      background: #1976d2;
      color: white;
    }

    &:hover {
      transform: scale(1.05);
    }
  }
}

// Estilos para el dropdown del select
:deep(.q-menu) {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);

  .q-item {
    border-radius: 8px;
    margin: 4px 8px;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(25, 118, 210, 0.1);
      transform: translateX(4px);
    }

    &.q-item--active {
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      color: white;
    }
  }
}
</style>
```