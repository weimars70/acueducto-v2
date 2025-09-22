<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md">
      <div class="col">
        <h4 class="q-my-none">Impuestos</h4>
        <p class="text-grey-6 q-mb-none">
          Gestión de tablas configurables del sistema
        </p>
      </div>
    </div>

    <div class="row q-gutter-md">
      <div 
        v-for="table in availableTables" 
        :key="table.id"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card 
          class="cursor-pointer hover-card"
          @click="navigateToTable(table.id)"
        >
          <q-card-section>
            <div class="text-h6 q-mb-xs">{{ table.title }}</div>
            <div class="text-caption text-grey-6" v-if="table.description">
              {{ table.description }}
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn 
              flat 
              color="primary" 
              label="Gestionar"
              @click.stop="navigateToTable(table.id)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Mensaje si no hay tablas configuradas -->
    <div v-if="availableTables.length === 0" class="text-center q-mt-xl">
      <q-icon name="table_chart" size="4rem" color="grey-4" />
      <div class="text-h6 text-grey-6 q-mt-md">
        No hay tablas dinámicas configuradas
      </div>
      <div class="text-body2 text-grey-5">
        Las tablas dinámicas aparecerán aquí cuando estén configuradas
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getDynamicTablesList } from '../config/dynamic-tables.config';

const router = useRouter();

// Estado reactivo
const availableTables = ref<Array<{ id: string; title: string; description?: string }>>([]);

// Métodos
const loadAvailableTables = () => {
  availableTables.value = getDynamicTablesList();
};

const navigateToTable = (tableId: string) => {
  router.push({ name: 'dynamic-table', params: { tableId } });
};

// Lifecycle
onMounted(() => {
  loadAvailableTables();
});
</script>

<style scoped>
.hover-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.q-page {
  max-width: 1200px;
  margin: 0 auto;
}
</style>