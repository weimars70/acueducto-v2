<script setup lang="ts">
import type { CapturaGenericaEmp } from '../types/captura-generica-emp';

defineProps<{
  items: CapturaGenericaEmp[]
}>();

const handleEdit = (estrato: CapturaGenericaEmp) => {
  // Implementar navegación a edición si es necesario
  console.log('Editar estrato:', estrato);
};
</script>

<template>
  <div class="row q-col-gutter-sm">
    <div v-for="item in items" :key="item.codigo" class="col-12 col-sm-6 col-md-4">
      <q-card class="estrato-card">
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
          <div class="row q-col-gutter-sm">
            <!-- Solo mostramos código y nombre -->
            <div class="col-12">
              <div class="flex items-center">
                <q-icon name="description" color="green" size="sm" class="q-mr-xs" />
                <span class="field-label">Nombre:</span>
                <span class="text-body2">{{ item.nombre }}</span>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.estrato-card {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 6px 0 rgba(0,0,0,.1);
  }
}

.field-label {
  font-weight: 500;
  margin-right: 4px;
  opacity: 0.9;
}
</style>