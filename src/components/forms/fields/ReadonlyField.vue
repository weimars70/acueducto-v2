<script setup lang="ts">
defineProps<{
  modelValue: string;
  label: string;
  type?: string;
}>();
</script>

<template>
  <q-input
    :model-value="modelValue"
    :label="label"
    :type="type"
    outlined
    dense
    readonly
    class="readonly-field"
  />
</template>

<style lang="scss" scoped>
.readonly-field {
  :deep(.q-field) {
    .q-field__control {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border: 2px solid #e9ecef;
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover {
        background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
    }

    .q-field__native {
      color: #495057;
      font-weight: 600;
      cursor: not-allowed;
    }

    .q-field__label {
      font-weight: 600;
      color: #6c757d;
    }

    // Icono de solo lectura
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      right: 12px;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236c757d'%3E%3Cpath d='M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM8.9 6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2H8.9V6z'/%3E%3C/svg%3E") no-repeat center;
      background-size: contain;
      opacity: 0.6;
    }
  }
}
</style>


