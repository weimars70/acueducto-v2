import type { TableSchema } from '../types/dynamic-maestros';

export interface DynamicTableConfig {
  id: string;
  name: string;
  title: string;
  description?: string;
  tableName: string;
  schema: TableSchema;
  permissions?: {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
  };
}

export const dynamicTablesConfig: Record<string, DynamicTableConfig> = {
  tipo_regimen: {
    id: 'tipo_regimen',
    name: 'tipo_regimen',
    title: 'Tipos de Régimen',
    description: 'Gestión de tipos de régimen fiscal',
    tableName: 'tipo_regimen',
    permissions: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    schema: {
      tableName: 'tipo_regimen',
      primaryKey: 'codigo',
      fields: [
        {
          name: 'codigo',
          type: 'number',
          label: 'Código',
          required: true,
          validation: {
            min: 1
          }
        },
        {
          name: 'nombre',
          type: 'text',
          label: 'Nombre',
          required: true,
          validation: {
            maxLength: 255,
            minLength: 2
          }
        },
        {
          name: 'code',
          type: 'text',
          label: 'Code',
          required: true,
          validation: {
            maxLength: 50,
            minLength: 1
          }
        }
      ],
      displayFields: ['codigo', 'nombre', 'code'],
      searchFields: ['nombre', 'code'],
      sortField: 'codigo',
      sortOrder: 'asc'
    }
  },
  
  tipo_ident: {
    id: 'tipo_ident',
    name: 'tipo_ident',
    title: 'Tipos de Identificación',
    description: 'Gestión de tipos de identificación del sistema',
    tableName: 'tipo_ident',
    permissions: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    schema: {
      tableName: 'tipo_ident',
      primaryKey: 'codigo',
      fields: [
        {
          name: 'codigo',
          type: 'number',
          label: 'Código',
          required: true,
          validation: {
            min: 1
          }
        },
        {
          name: 'nombre',
          type: 'text',
          label: 'Nombre',
          required: true,
          validation: {
            maxLength: 255,
            minLength: 2
          }
        },
        {
          name: 'abreviado',
          type: 'text',
          label: 'Abreviado',
          required: false,
          validation: {
            maxLength: 50
          }
        }
      ],
      displayFields: ['codigo', 'nombre', 'abreviado'],
      searchFields: ['nombre', 'abreviado'],
      sortField: 'codigo',
      sortOrder: 'asc'
    }
  },

  tipo_impuesto: {
    id: 'tipo_impuesto',
    name: 'tipo_impuesto',
    title: 'Tipos de Impuesto',
    description: 'Gestión de tipos de impuestos del sistema',
    tableName: 'tipo_impuesto',
    permissions: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    schema: {
      tableName: 'tipo_impuesto',
      primaryKey: 'codigo',
      fields: [
        {
          name: 'codigo',
          type: 'number',
          label: 'Código',
          required: true,
          validation: {
            min: 1
          }
        },
        {
          name: 'nombre',
          type: 'text',
          label: 'Nombre',
          required: true,
          validation: {
            maxLength: 255,
            minLength: 2
          }
        },
        {
          name: 'code',
          type: 'text',
          label: 'Code',
          required: true,
          validation: {
            maxLength: 50,
            minLength: 1
          }
        }
      ],
      displayFields: ['codigo', 'nombre', 'code'],
      searchFields: ['nombre', 'code'],
      sortField: 'codigo',
      sortOrder: 'asc'
    }
  }
};

export function getDynamicTableConfig(tableId: string): DynamicTableConfig | undefined {
  return dynamicTablesConfig[tableId];
}

export function getAllDynamicTables(): DynamicTableConfig[] {
  return Object.values(dynamicTablesConfig);
}

export function getDynamicTablesList(): Array<{ id: string; title: string; description?: string }> {
  return Object.values(dynamicTablesConfig).map(config => ({
    id: config.id,
    title: config.title,
    description: config.description
  }));
}