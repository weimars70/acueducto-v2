<template>
  <form @submit.prevent="handleSubmit" class="dynamic-form">
    <div v-for="field in (fields || [])" :key="field.name" class="form-field">
      <!-- Campo de texto -->
      <div v-if="field.type === 'text'" class="input-group">
        <label :for="field.name" class="form-label">
          {{ field.label }}
          <span v-if="field.required" class="required">*</span>
        </label>
        <input
          :id="field.name"
          v-model="formData[field.name]"
          type="text"
          :placeholder="field.placeholder"
          :disabled="field.disabled"
          :required="field.required"
          :maxlength="field.validation?.maxLength"
          :minlength="field.validation?.minLength"
          :pattern="field.validation?.pattern"
          class="form-input"
          @blur="validateField(field)"
        />
        <small v-if="field.hint" class="field-hint">{{ field.hint }}</small>
        <div v-if="errors[field.name]" class="error-message">
          {{ errors[field.name] }}
        </div>
      </div>

      <!-- Campo numérico -->
      <div v-else-if="field.type === 'number'" class="input-group">
        <label :for="field.name" class="form-label">
          {{ field.label }}
          <span v-if="field.required" class="required">*</span>
        </label>
        <input
          :id="field.name"
          v-model.number="formData[field.name]"
          type="number"
          :placeholder="field.placeholder"
          :disabled="field.disabled"
          :required="field.required"
          :min="field.validation?.min"
          :max="field.validation?.max"
          class="form-input"
          @blur="validateField(field)"
        />
        <small v-if="field.hint" class="field-hint">{{ field.hint }}</small>
        <div v-if="errors[field.name]" class="error-message">
          {{ errors[field.name] }}
        </div>
      </div>

      <!-- Campo de área de texto -->
      <div v-else-if="field.type === 'textarea'" class="input-group">
        <label :for="field.name" class="form-label">
          {{ field.label }}
          <span v-if="field.required" class="required">*</span>
        </label>
        <textarea
          :id="field.name"
          v-model="formData[field.name]"
          :placeholder="field.placeholder"
          :disabled="field.disabled"
          :required="field.required"
          :maxlength="field.validation?.maxLength"
          :minlength="field.validation?.minLength"
          class="form-textarea"
          rows="3"
          @blur="validateField(field)"
        ></textarea>
        <small v-if="field.hint" class="field-hint">{{ field.hint }}</small>
        <div v-if="errors[field.name]" class="error-message">
          {{ errors[field.name] }}
        </div>
      </div>

      <!-- Campo de selección -->
      <div v-else-if="field.type === 'select'" class="input-group">
        <label :for="field.name" class="form-label">
          {{ field.label }}
          <span v-if="field.required" class="required">*</span>
        </label>
        <select
          :id="field.name"
          v-model="formData[field.name]"
          :disabled="field.disabled"
          :required="field.required"
          class="form-select"
          @blur="validateField(field)"
        >
          <option value="">Seleccione una opción</option>
          <option
            v-for="option in field.options"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
        <small v-if="field.hint" class="field-hint">{{ field.hint }}</small>
        <div v-if="errors[field.name]" class="error-message">
          {{ errors[field.name] }}
        </div>
      </div>

      <!-- Campo de email -->
      <div v-else-if="field.type === 'email'" class="input-group">
        <label :for="field.name" class="form-label">
          {{ field.label }}
          <span v-if="field.required" class="required">*</span>
        </label>
        <input
          :id="field.name"
          v-model="formData[field.name]"
          type="email"
          :placeholder="field.placeholder"
          :disabled="field.disabled"
          :required="field.required"
          class="form-input"
          @blur="validateField(field)"
        />
        <small v-if="field.hint" class="field-hint">{{ field.hint }}</small>
        <div v-if="errors[field.name]" class="error-message">
          {{ errors[field.name] }}
        </div>
      </div>

      <!-- Campo de fecha -->
      <div v-else-if="field.type === 'date'" class="input-group">
        <label :for="field.name" class="form-label">
          {{ field.label }}
          <span v-if="field.required" class="required">*</span>
        </label>
        <input
          :id="field.name"
          v-model="formData[field.name]"
          type="date"
          :disabled="field.disabled"
          :required="field.required"
          class="form-input"
          @blur="validateField(field)"
        />
        <small v-if="field.hint" class="field-hint">{{ field.hint }}</small>
        <div v-if="errors[field.name]" class="error-message">
          {{ errors[field.name] }}
        </div>
      </div>

      <!-- Campo de teléfono -->
      <div v-else-if="field.type === 'tel'" class="input-group">
        <label :for="field.name" class="form-label">
          {{ field.label }}
          <span v-if="field.required" class="required">*</span>
        </label>
        <input
          :id="field.name"
          v-model="formData[field.name]"
          type="tel"
          :placeholder="field.placeholder"
          :disabled="field.disabled"
          :required="field.required"
          class="form-input"
          @blur="validateField(field)"
        />
        <small v-if="field.hint" class="field-hint">{{ field.hint }}</small>
        <div v-if="errors[field.name]" class="error-message">
          {{ errors[field.name] }}
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button
        type="button"
        @click="$emit('cancel')"
        class="btn btn-secondary"
      >
        Cancelar
      </button>
      <button
        type="submit"
        :disabled="!isFormValid || loading"
        class="btn btn-primary"
      >
        <span v-if="loading" class="loading-spinner"></span>
        {{ submitText }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { FieldConfig, ValidationError } from '../types/dynamic-maestros';

interface Props {
  fields: FieldConfig[];
  initialData?: Record<string, any>;
  submitText?: string;
  loading?: boolean;
}

interface Emits {
  (e: 'submit', data: Record<string, any>): void;
  (e: 'cancel'): void;
  (e: 'change', data: Record<string, any>): void;
}

const props = withDefaults(defineProps<Props>(), {
  submitText: 'Guardar',
  loading: false,
});

const emit = defineEmits<Emits>();

const formData = ref<Record<string, any>>({});
const errors = ref<Record<string, string>>({});

// Inicializar datos del formulario
const initializeFormData = () => {
  const data: Record<string, any> = {};
  
  if (!props.fields || !Array.isArray(props.fields)) {
    formData.value = data;
    return;
  }
  
  props.fields.forEach(field => {
    if (props.initialData && props.initialData[field.name] !== undefined) {
      data[field.name] = props.initialData[field.name];
    } else if (field.defaultValue !== undefined) {
      data[field.name] = field.defaultValue;
    } else {
      data[field.name] = field.type === 'number' ? null : '';
    }
  });
  
  formData.value = data;
};

// Validar un campo específico
const validateField = (field: FieldConfig): boolean => {
  const value = formData.value[field.name];
  let error = '';

  // Validación de campo requerido
  if (field.required && (!value || value === '')) {
    error = `${field.label} es requerido`;
  }
  // Validaciones específicas por tipo
  else if (value) {
    if (field.validation) {
      const validation = field.validation;
      
      if (field.type === 'text' || field.type === 'textarea') {
        if (validation.minLength && value.length < validation.minLength) {
          error = `${field.label} debe tener al menos ${validation.minLength} caracteres`;
        } else if (validation.maxLength && value.length > validation.maxLength) {
          error = `${field.label} no puede tener más de ${validation.maxLength} caracteres`;
        } else if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
          error = `${field.label} no tiene el formato correcto`;
        }
      } else if (field.type === 'number') {
        if (validation.min !== undefined && value < validation.min) {
          error = `${field.label} debe ser mayor o igual a ${validation.min}`;
        } else if (validation.max !== undefined && value > validation.max) {
          error = `${field.label} debe ser menor o igual a ${validation.max}`;
        }
      }
    }
  }

  if (error) {
    errors.value[field.name] = error;
    return false;
  } else {
    delete errors.value[field.name];
    return true;
  }
};

// Validar todo el formulario
const validateForm = (): boolean => {
  if (!props.fields || !Array.isArray(props.fields)) {
    return false;
  }
  
  let isValid = true;
  
  props.fields.forEach(field => {
    if (!validateField(field)) {
      isValid = false;
    }
  });
  
  return isValid;
};

// Computed para verificar si el formulario es válido
const isFormValid = computed(() => {
  if (!props.fields || !Array.isArray(props.fields)) {
    return false;
  }
  
  return Object.keys(errors.value).length === 0 && 
         props.fields.filter(f => f.required).every(field => {
           const value = formData.value[field.name];
           return value !== null && value !== undefined && value !== '';
         });
});

// Manejar envío del formulario
const handleSubmit = () => {
  if (validateForm()) {
    emit('submit', { ...formData.value });
  }
};

// Watch para cambios en los datos del formulario
watch(formData, (newData) => {
  emit('change', { ...newData });
}, { deep: true });

// Watch para cambios en initialData
watch(() => props.initialData, () => {
  initializeFormData();
}, { deep: true });

onMounted(() => {
  initializeFormData();
});
</script>

<style lang="scss" scoped>
// Contenedor principal del formulario dinámico
.dynamic-form {
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
}

// Campo del formulario
.form-field {
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

// Grupo de entrada
.input-group {
  display: flex;
  flex-direction: column;
  position: relative;
}

// Etiquetas del formulario
.form-label {
  font-weight: 600;
  color: #546e7a;
  margin-bottom: 8px;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.3s ease;
}

// Asterisco requerido
.required {
  color: #ef4444;
  font-weight: 700;
  font-size: 1rem;
  margin-left: 4px;
}

// Campos de entrada base
.form-input,
.form-textarea,
.form-select {
  padding: 12px 16px;
  border: 2px solid transparent;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  color: #2c3e50;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &::placeholder {
    color: #95a5a6;
    font-weight: 400;
  }

  &:hover {
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:focus {
    outline: none;
    border-color: #1976d2;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
  }

  &:disabled {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border: 2px solid #e9ecef;
    color: #495057;
    cursor: not-allowed;
    opacity: 0.7;
  }
}

// Área de texto específica
.form-textarea {
  resize: vertical;
  min-height: 80px;
  line-height: 1.6;
  font-family: inherit;
}

// Select específico
.form-select {
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 48px;
  appearance: none;

  option {
    padding: 8px;
    background: white;
    color: #2c3e50;
  }
}

// Pista del campo
.field-hint {
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 6px;
  font-weight: 500;
  font-style: italic;
}

// Mensaje de error
.error-message {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 6px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &::before {
    content: "⚠";
    font-size: 0.875rem;
  }
}

// Acciones del formulario
.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  
  @media (max-width: 600px) {
    flex-direction: column-reverse;
    gap: 12px;
  }
}

// Botones mejorados
.btn {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 100px;
  letter-spacing: 0.5px;
  text-transform: none;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
}

// Botón primario (verde como en NewConsumptionForm)
.btn-primary {
  background: #4caf50;
  color: white;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);

  &:hover:not(:disabled) {
    background: #45a049;
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    box-shadow: none;
    
    &:hover {
      transform: none;
    }
  }
}

// Botón secundario (rojo como en NewConsumptionForm)
.btn-secondary {
  background: #f44336;
  color: white;
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);

  &:hover {
    background: #d32f2f;
    box-shadow: 0 6px 20px rgba(244, 67, 54, 0.4);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
  }
}

// Spinner de carga
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// Espaciado mejorado
.q-mb-xs {
  margin-bottom: 12px !important;
}

// Responsive design
@media (max-width: 768px) {
  .dynamic-form {
    padding: 24px 16px;
    margin: 8px;
  }
  
  .form-input,
  .form-textarea,
  .form-select {
    padding: 12px 16px;
    font-size: 16px; // Evita zoom en iOS
  }
  
  .btn {
    padding: 12px 20px;
    min-width: 100px;
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .dynamic-form {
    padding: 20px 12px;
  }
  
  .form-actions {
    flex-direction: column;
    
    .btn {
      width: 100%;
    }
  }
}
</style>