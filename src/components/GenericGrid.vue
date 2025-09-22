<script setup lang="ts">
import type { CapturaGenericaEmp } from '../types/captura-generica-emp';
import type { MaestroConfig } from '../config/maestros.config';

defineProps<{
  items: CapturaGenericaEmp[];
  config: MaestroConfig;
}>();

const emit = defineEmits<{
  edit: [item: CapturaGenericaEmp];
}>();

const handleEdit = (item: CapturaGenericaEmp) => {
  emit('edit', item);
};</script>

<template>
  <div class="row q-col-gutter-sm">
    <div v-for="item in items" :key="item.codigo" class="col-12 col-sm-3 col-md-2">
      <q-card class="maestro-card">
        <!-- Encabezado -->
        <q-card-section class="bg-primary text-white q-pa-sm">
          <div class="row items-center justify-between">
            <div class="col">
              <div class="text-subtitle1">{{ item.nombre }}</div>
              <div class="text-caption row items-center q-gutter-x-sm">
                <span class="flex items-center">
                  <q-icon name="tag" size="xs" class="q-mr-xs text-green" />
                  <span class="field-label">Código:</span>
                  {{ item.codigo }}
                </span>
              </div>
            </div>
            <div class="col-auto">
              <q-btn
                flat
                round
                dense
                icon="edit"
                color="white"
                @click="handleEdit(item)"
              />
            </div>
          </div>
        </q-card-section>

        <!-- Información principal -->
        <q-card-section class="q-pa-sm">
          <div class="row items-center q-gutter-x-sm q-mb-sm">
            <q-icon :name="config.icon" size="sm" class="text-primary" />
            <div class="col">
              <div class="text-caption text-grey-6">Nombre</div>
              <div class="text-body2">{{ item.nombre }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<style scoped>
.maestro-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.maestro-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.field-label {
  font-weight: 500;
  margin-right: 4px;
}

.text-caption {
  font-size: 0.75rem;
}

.text-body2 {
  font-size: 0.875rem;
  font-weight: 500;
}

.text-subtitle1 {
  font-size: 1rem;
  font-weight: 600;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .maestro-card {
    margin-bottom: 8px;
  }
}
</style>