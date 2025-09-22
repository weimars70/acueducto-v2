import type { FieldConfig, TableSchema } from '../types/dynamic-maestros';

export interface MaestroConfig {
  title: string;
  singular: string;
  plural: string;
  table: string;
  icon: string;
  description: string;
  schema?: TableSchema;
}

export const maestrosConfig: Record<string, MaestroConfig> = {
  estratos: {
    title: 'Estratos',
    singular: 'Estrato',
    plural: 'Estratos',
    table: 'estratos',
    icon: 'layers',
    description: 'Gestión de estratos socioeconómicos',
    schema: {
      table: 'estratos',
      title: 'Estratos',
      singular: 'Estrato',
      plural: 'Estratos',
      icon: 'layers',
      description: 'Gestión de estratos socioeconómicos',
      primaryKey: 'id',
      fields: [
        {
          name: 'id',
          type: 'number',
          label: 'ID',
          required: false,
          disabled: true
        },
        {
          name: 'nombre',
          type: 'text',
          label: 'Nombre',
          required: true,
          placeholder: 'Ingrese el nombre del estrato',
          validation: {
            maxLength: 100
          }
        },
        {
          name: 'descripcion',
          type: 'textarea',
          label: 'Descripción',
          required: false,
          placeholder: 'Descripción del estrato'
        }
      ],
      displayFields: ['id', 'nombre', 'descripcion'],
      searchFields: ['nombre', 'descripcion']
    }
  },
  marcas_medidor: {
    title: 'Marcas Medidor',
    singular: 'Marca de Medidor',
    plural: 'Marcas de Medidor',
    table: 'marcas_medidor',
    icon: 'speed',
    description: 'Gestión de marcas de medidores',
    schema: {
      table: 'marcas_medidor',
      title: 'Marcas Medidor',
      singular: 'Marca de Medidor',
      plural: 'Marcas de Medidor',
      icon: 'speed',
      description: 'Gestión de marcas de medidores',
      primaryKey: 'id',
      fields: [
        {
          name: 'id',
          type: 'number',
          label: 'ID',
          required: false,
          disabled: true
        },
        {
          name: 'nombre',
          type: 'text',
          label: 'Nombre',
          required: true,
          placeholder: 'Ingrese el nombre de la marca',
          validation: {
            maxLength: 100
          }
        },
        {
          name: 'descripcion',
          type: 'textarea',
          label: 'Descripción',
          required: false,
          placeholder: 'Descripción de la marca'
        }
      ],
      displayFields: ['id', 'nombre', 'descripcion'],
      searchFields: ['nombre', 'descripcion']
    }
  },
  profesiones: {
    title: 'Profesiones',
    singular: 'Profesión',
    plural: 'Profesiones',
    table: 'profesiones',
    icon: 'work',
    description: 'Gestión de profesiones',
    schema: {
      table: 'profesiones',
      title: 'Profesiones',
      singular: 'Profesión',
      plural: 'Profesiones',
      icon: 'work',
      description: 'Gestión de profesiones',
      primaryKey: 'id',
      fields: [
        {
          name: 'id',
          type: 'number',
          label: 'ID',
          required: false,
          disabled: true
        },
        {
          name: 'nombre',
          type: 'text',
          label: 'Nombre',
          required: true,
          placeholder: 'Ingrese el nombre de la profesión',
          validation: {
            maxLength: 100
          }
        },
        {
          name: 'descripcion',
          type: 'textarea',
          label: 'Descripción',
          required: false,
          placeholder: 'Descripción de la profesión'
        }
      ],
      displayFields: ['id', 'nombre', 'descripcion'],
      searchFields: ['nombre', 'descripcion']
    }
  },
  sectores: {
    title: 'Sectores',
    singular: 'Sector',
    plural: 'Sectores',
    table: 'sector',
    icon: 'location_city',
    description: 'Gestión de sectores',
    schema: {
      table: 'sector',
      title: 'Sectores',
      singular: 'Sector',
      plural: 'Sectores',
      icon: 'location_city',
      description: 'Gestión de sectores',
      primaryKey: 'id',
      fields: [
        {
          name: 'id',
          type: 'number',
          label: 'ID',
          required: false,
          disabled: true
        },
        {
          name: 'nombre',
          type: 'text',
          label: 'Nombre',
          required: true,
          placeholder: 'Ingrese el nombre del sector',
          validation: {
            maxLength: 100
          }
        },
        {
          name: 'descripcion',
          type: 'textarea',
          label: 'Descripción',
          required: false,
          placeholder: 'Descripción del sector'
        }
      ],
      displayFields: ['id', 'nombre', 'descripcion'],
      searchFields: ['nombre', 'descripcion']
    }
  },
  tipo_persona: {
    title: 'Tipo Persona',
    singular: 'Tipo de Persona',
    plural: 'Tipos de Persona',
    table: 'tipo_persona',
    icon: 'person',
    description: 'Gestión de tipos de persona',
    schema: {
      table: 'tipo_persona',
      title: 'Tipo Persona',
      singular: 'Tipo de Persona',
      plural: 'Tipos de Persona',
      icon: 'person',
      description: 'Gestión de tipos de persona',
      primaryKey: 'id',
      fields: [
        {
          name: 'id',
          type: 'number',
          label: 'ID',
          required: false,
          disabled: true
        },
        {
          name: 'nombre',
          type: 'text',
          label: 'Nombre',
          required: true,
          placeholder: 'Ingrese el tipo de persona',
          validation: {
            maxLength: 100
          }
        },
        {
          name: 'descripcion',
          type: 'textarea',
          label: 'Descripción',
          required: false,
          placeholder: 'Descripción del tipo de persona'
        }
      ],
      displayFields: ['id', 'nombre', 'descripcion'],
      searchFields: ['nombre', 'descripcion']
    }
  }
};

export const getMaestroConfig = (key: string): MaestroConfig => {
  const config = maestrosConfig[key];
  if (!config) {
    throw new Error(`Configuración no encontrada para el maestro: ${key}`);
  }
  return config;
};