export type FieldType = 'text' | 'number' | 'select' | 'date' | 'email' | 'tel' | 'textarea';

export interface SelectOption {
  value: any;
  label: string;
}

export interface FieldConfig {
  name: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
  options?: SelectOption[]; // Para campos select
  defaultValue?: any;
  disabled?: boolean;
  hint?: string;
}

export interface TableSchema {
  table: string;
  title: string;
  singular: string;
  plural: string;
  icon: string;
  description: string;
  primaryKey: string;
  fields: FieldConfig[];
  displayFields?: string[]; // Campos a mostrar en la tabla
  searchFields?: string[]; // Campos por los que se puede buscar
}

export interface DynamicRecord {
  [key: string]: any;
}

export interface CrudOperation {
  action: 'create' | 'read' | 'update' | 'delete' | 'list';
  table: string;
  data?: DynamicRecord;
  id?: number | string;
  filters?: Record<string, any>;
  pagination?: {
    page: number;
    limit: number;
  };
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface CrudResponse<T = DynamicRecord> {
  success: boolean;
  data?: T | T[];
  message?: string;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}