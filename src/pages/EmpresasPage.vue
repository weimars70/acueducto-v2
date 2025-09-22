<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div class="col">
        <h4 class="text-h4 q-my-none">Empresas</h4>
        <p class="text-grey-6 q-mb-none">Gestión de empresas del sistema</p>
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          icon="add"
          label="Nueva Empresa"
          @click="goToCreate"
          unelevated
        />
      </div>
    </div>

    <q-card>
      <q-card-section>
        <div class="row q-gutter-md q-mb-md">
          <q-input
            v-model="searchText"
            placeholder="Buscar por nombre, código o identificación..."
            outlined
            dense
            clearable
            class="col"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <q-table
          :rows="filteredEmpresas"
          :columns="columns"
          :loading="loading"
          row-key="codigo"
          :pagination="{ rowsPerPage: 10 }"
          :filter="searchText"
          :filter-method="filterMethod"
        >
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                color="primary"
                icon="edit"
                size="sm"
                @click="goToEdit(props.row.codigo)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                size="sm"
                @click="confirmDelete(props.row)"
                class="q-ml-xs"
              >
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Dialog de confirmación para eliminar -->
    <q-dialog v-model="deleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">
            ¿Está seguro que desea eliminar la empresa "{{ empresaToDelete?.nombre }}"?
          </span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn
            flat
            label="Eliminar"
            color="negative"
            @click="deleteEmpresa"
            :loading="deleting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { empresaService } from '../services/api/empresa.service';
import type { Empresa } from '../types/empresa';

const $q = useQuasar();
const router = useRouter();

const empresas = ref<Empresa[]>([]);
const loading = ref(true);
const searchText = ref('');
const deleteDialog = ref(false);
const empresaToDelete = ref<Empresa | null>(null);
const deleting = ref(false);

const columns = [
  {
    name: 'codigo_alterno',
    required: true,
    label: 'Código Alterno',
    align: 'left',
    field: 'codigo_alterno',
    sortable: true
  },
  {
    name: 'nombre',
    required: true,
    label: 'Nombre',
    align: 'left',
    field: 'nombre',
    sortable: true
  },
  {
    name: 'ident',
    label: 'Identificación',
    align: 'left',
    field: 'ident',
    sortable: true
  },
  {
    name: 'telefono',
    label: 'Teléfono',
    align: 'left',
    field: 'telefono',
    sortable: true
  },
  {
    name: 'direccion',
    label: 'Dirección',
    align: 'left',
    field: 'direccion',
    sortable: true
  },
  {
    name: 'actions',
    label: 'Acciones',
    align: 'center',
    field: 'actions'
  }
];

const filteredEmpresas = computed(() => {
  if (!searchText.value) return empresas.value;
  
  const search = searchText.value.toLowerCase();
  return empresas.value.filter(empresa => 
    empresa.nombre.toLowerCase().includes(search) ||
    empresa.codigo_alterno.toLowerCase().includes(search) ||
    empresa.ident.toLowerCase().includes(search)
  );
});

const filterMethod = (rows: Empresa[], terms: string) => {
  if (!terms) return rows;
  
  const search = terms.toLowerCase();
  return rows.filter(row => 
    row.nombre.toLowerCase().includes(search) ||
    row.codigo_alterno.toLowerCase().includes(search) ||
    row.ident.toLowerCase().includes(search)
  );
};

const loadEmpresas = async () => {
  try {
    loading.value = true;
    empresas.value = await empresaService.getEmpresas();
  } catch (error) {
    console.error('Error al cargar empresas:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las empresas'
    });
  } finally {
    loading.value = false;
  }
};

const goToCreate = () => {
  router.push('/empresas/nueva');
};

const goToEdit = (codigo: number) => {
  router.push(`/empresas/editar/${codigo}`);
};

const confirmDelete = (empresa: Empresa) => {
  empresaToDelete.value = empresa;
  deleteDialog.value = true;
};

const deleteEmpresa = async () => {
  if (!empresaToDelete.value) return;
  
  try {
    deleting.value = true;
    await empresaService.delete(empresaToDelete.value.codigo);
    
    $q.notify({
      type: 'positive',
      message: 'Empresa eliminada exitosamente'
    });
    
    await loadEmpresas();
    deleteDialog.value = false;
    empresaToDelete.value = null;
  } catch (error) {
    console.error('Error al eliminar empresa:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al eliminar la empresa'
    });
  } finally {
    deleting.value = false;
  }
};

onMounted(() => {
  loadEmpresas();
});
</script>