<template>
  <div class="new-cuotas-diferidos-page">
    <div class="page-header">
      <h1 class="page-title">NUEVO REGISTRO ACUERDO DE PAGO</h1>
      <span class="date">{{ currentDate }}</span>
    </div>

    <form @submit.prevent="handleSubmit" class="cuota-form">
      <div class="form-row">
        <div class="form-group">
          <label for="fecha" class="required">Fecha</label>
          <input
            id="fecha"
            v-model="form.fecha"
            type="date"
            class="form-control"
            required
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="instalacion" class="required">Instalacion Codigo</label>
          <q-select
            v-model="form.instalacion_codigo"
            :options="filteredInstalaciones"
            option-value="codigo"
            option-label="display"
            emit-value
            map-options
            use-input
            input-debounce="300"
            @filter="filterInstalaciones"
            @input-value="setModel"
            outlined
            dense
            clearable
            placeholder="Buscar instalación..."
            class="form-control-quasar"
            :rules="[val => !!val || 'Instalación es requerida']"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  No se encontraron instalaciones
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="valor" class="required">Valor</label>
          <input
            id="valor"
            v-model="valorFormatted"
            type="text"
            class="form-control"
            required
            @input="onValorInput"
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="por_interes">Por Interes</label>
          <input
            id="por_interes"
            v-model.number="form.por_interes"
            type="number"
            step="0.01"
            class="form-control"
            placeholder="0,00"
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="numero_cuotas" class="required"># Cuotas</label>
          <input
            id="numero_cuotas"
            v-model.number="form.numero_cuotas"
            type="number"
            min="1"
            class="form-control"
            required
            placeholder="1"
            @input="calcularCuota"
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="cuota" class="required">Cuota</label>
          <input
            id="cuota"
            v-model="cuotaFormatted"
            type="text"
            class="form-control"
            required
            placeholder="0"
            readonly
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="saldo">Saldo</label>
          <input
            id="saldo"
            v-model="saldoFormatted"
            type="text"
            class="form-control"
            readonly
          />
        </div>
      </div>

      <div class="required-note">
        * Campos obligatorios
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-success" :disabled="loading">
          <i class="material-icons">add</i>
          Guardar
        </button>
        <button type="button" class="btn btn-danger" @click="handleCancel">
          <i class="material-icons">exit_to_app</i>
          Salir
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuth } from '../composables/useAuth';
import { instalacionesService, type Instalacion } from '../services/instalaciones.service';
import { cuotasDiferidosService } from '../services/cuotas-diferidos.service';

const router = useRouter();
const { codigoEmpresa } = useAuth();
const $q = useQuasar();

const loading = ref(false);
const instalaciones = ref<Instalacion[]>([]);
const filteredInstalaciones = ref<any[]>([]);

const form = ref({
  fecha: new Date().toISOString().split('T')[0],
  instalacion_codigo: '',
  valor: 0,
  por_interes: 0,
  numero_cuotas: 1,
  cuota: 0,
  saldo: 0
});

// Variables para mostrar valores formateados
const valorFormatted = ref('0');
const saldoFormatted = ref('0');
const cuotaFormatted = ref('0');

// Funciones para formatear números
const formatNumber = (value: number): string => {
  if (isNaN(value) || value === 0) return '0';
  return new Intl.NumberFormat('es-CO').format(value);
};

const parseFormattedNumber = (value: string): number => {
  if (!value) return 0;
  // Remover separadores de miles y convertir a número
  const cleanValue = value.replace(/[.,]/g, (match, offset, string) => {
    // Si es el último punto o coma, es decimal
    const lastDotIndex = string.lastIndexOf('.');
    const lastCommaIndex = string.lastIndexOf(',');
    const lastSeparatorIndex = Math.max(lastDotIndex, lastCommaIndex);
    
    if (offset === lastSeparatorIndex && lastSeparatorIndex > string.length - 4) {
      return '.'; // Es separador decimal
    }
    return ''; // Es separador de miles, se remueve
  });
  
  return parseFloat(cleanValue) || 0;
};

const currentDate = computed(() => {
  return new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
});

// Calcular saldo automáticamente
watch([() => form.value.valor, () => form.value.por_interes], () => {
  form.value.saldo = form.value.valor + form.value.por_interes;
  saldoFormatted.value = formatNumber(form.value.saldo);
});

// Calcular cuota automáticamente
watch([() => form.value.valor, () => form.value.numero_cuotas], () => {
  calcularCuota();
});

const loadInstalaciones = async () => {
  try {
    if (codigoEmpresa) {
      instalaciones.value = await instalacionesService.getByEmpresa(codigoEmpresa);
      // Inicializar las opciones filtradas con todas las instalaciones
      filteredInstalaciones.value = instalaciones.value.map(instalacion => ({
        codigo: instalacion.codigo,
        display: `${instalacion.codigo} - ${instalacion.nombre}`,
        nombre: instalacion.nombre
      }));
    }
  } catch (error) {
    console.error('Error al cargar instalaciones:', error);
  }
};

const filterInstalaciones = (val: string, update: Function) => {
  update(() => {
    if (val === '') {
      filteredInstalaciones.value = instalaciones.value.map(instalacion => ({
        codigo: instalacion.codigo,
        display: `${instalacion.codigo} - ${instalacion.nombre}`,
        nombre: instalacion.nombre
      }));
    } else {
      const needle = val.toLowerCase();
      filteredInstalaciones.value = instalaciones.value
        .filter(instalacion => 
          instalacion.codigo.toString().toLowerCase().includes(needle) ||
          instalacion.nombre.toLowerCase().includes(needle)
        )
        .map(instalacion => ({
          codigo: instalacion.codigo,
          display: `${instalacion.codigo} - ${instalacion.nombre}`,
          nombre: instalacion.nombre
        }));
    }
  });
};

const setModel = (val: string) => {
  // Esta función se ejecuta cuando el usuario escribe en el input
  // No necesitamos hacer nada especial aquí
};

// Función para manejar input del campo valor
const onValorInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const numericValue = parseFormattedNumber(target.value);
  form.value.valor = numericValue;
  valorFormatted.value = formatNumber(numericValue);
  calcularCuota();
};

// Función para actualizar valores formateados
const updateFormattedValues = () => {
  valorFormatted.value = formatNumber(form.value.valor);
  saldoFormatted.value = formatNumber(form.value.saldo);
  cuotaFormatted.value = formatNumber(form.value.cuota);
};

const calcularCuota = () => {
  if (form.value.valor > 0 && form.value.numero_cuotas > 0) {
    form.value.cuota = Number((form.value.valor / form.value.numero_cuotas).toFixed(2));
  } else {
    form.value.cuota = 0;
  }
  // Actualizar valor formateado de cuota
  cuotaFormatted.value = formatNumber(form.value.cuota);
};

const validateForm = () => {
  const errors = [];
  
  if (!form.value.fecha) {
    errors.push('La fecha es obligatoria');
  }
  
  if (!form.value.instalacion_codigo) {
    errors.push('La instalación es obligatoria');
  }
  
  if (!form.value.valor || form.value.valor <= 0) {
    errors.push('El valor debe ser mayor a 0');
  }
  
  if (!form.value.numero_cuotas || form.value.numero_cuotas <= 0) {
    errors.push('El número de cuotas debe ser mayor a 0');
  }
  
  if (!form.value.cuota || form.value.cuota <= 0) {
    errors.push('La cuota debe ser mayor a 0');
  }
  
  return errors;
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    
    // Validar formulario
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      $q.notify({
        type: 'negative',
        message: 'Por favor complete todos los campos obligatorios',
        caption: validationErrors.join(', '),
        position: 'center'
      });
      loading.value = false;
      return;
    }
    
    const cuotaData = {
      instalacion_codigo: Number(form.value.instalacion_codigo),
      fecha: form.value.fecha,
      concepto: form.value.concepto,
      valor: form.value.valor,
      por_interes: form.value.por_interes,
      cuota: form.value.cuota,
      saldo: form.value.saldo,
      empresa: Number(codigoEmpresa)
    };

    console.log('Datos que se envían al backend:', cuotaData);
    console.log('form.value.instalacion_codigo original:', form.value.instalacion_codigo);

    await cuotasDiferidosService.create(cuotaData);
    
    $q.notify({
      type: 'positive',
      message: 'Cuota diferido creada exitosamente',
      position: 'center'
    });
    
    // Redirigir a la página de cuotas diferidos
    router.push('/diferidos/cuotas-diferidos');
  } catch (error) {
    console.error('Error al crear cuota diferido:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al crear la cuota diferido',
      caption: 'Por favor intente nuevamente',
      position: 'center'
    });
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.push('/diferidos/cuotas-diferidos');
};

// Sincronizar valores formateados cuando cambien los valores del form
watch([() => form.value.valor, () => form.value.saldo, () => form.value.cuota], () => {
  updateFormattedValues();
}, { immediate: true });

onMounted(() => {
  loadInstalaciones();
});
</script>

<style scoped>
.new-cuotas-diferidos-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e0e0e0;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.date {
  font-size: 18px;
  color: #666;
  font-weight: 500;
}

.cuota-form {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-row {
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.form-row .form-group {
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 15px;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
  min-width: 120px;
  text-align: left;
  margin: 0;
}

.form-group label.required::after {
  content: ' *';
  color: #e74c3c;
}

.form-control {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  flex: 1;
  max-width: 300px;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-control:readonly {
  background-color: #f8f9fa;
  color: #6c757d;
}

.form-control-quasar {
  flex: 1;
  max-width: 300px;
}

.form-control-quasar :deep(.q-field__control) {
  height: 44px;
  padding: 0 12px;
  border-radius: 4px;
}

.form-control-quasar :deep(.q-field__native) {
  font-size: 14px;
}

.required-note {
  color: #e74c3c;
  font-size: 12px;
  margin-bottom: 20px;
  font-style: italic;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #218838;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.material-icons {
  font-size: 18px;
}

@media (max-width: 768px) {
  .new-cuotas-diferidos-page {
    padding: 10px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .cuota-form {
    padding: 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>