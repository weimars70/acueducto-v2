<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import NewConsumptionForm from '../components/forms/NewConsumptionForm.vue';

const router = useRouter();
const formRef = ref(null);

const handleBackToList = () => {
  router.push('/consumptions');
};
</script>

<template>
  <q-page class="modern-page">
    <div class="new-consumption-page">
      <!-- Header con título y navegación -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-navigation">
            <q-btn
              class="back-btn"
              icon="arrow_back"
              label="Volver al listado"
              @click="handleBackToList"
              flat
              no-caps
            />
          </div>
          
          <div class="header-text">
            <h1 class="page-title">
              <q-icon name="add_circle" class="title-icon" />
              Nuevo Consumo
            </h1>
            <p class="page-subtitle">Registra una nueva lectura de consumo de agua</p>
          </div>
          
          <!-- Indicador de progreso -->
          <div class="progress-indicator">
            <div class="progress-step active">
              <q-icon name="edit" />
              <span>Datos</span>
            </div>
            <div class="progress-step">
              <q-icon name="save" />
              <span>Guardar</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido del formulario -->
      <div class="form-section">
        <NewConsumptionForm ref="formRef" />
      </div>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --color-dark-teal: #004D40;
  --color-jade-green: #00796B;
  --color-light-green: #4DB6AC;
  --color-petroleum-blue: #01579B;
  --color-sky-blue: #4FC3F7;
  --color-pure-white: #FFFFFF;
  --color-light-gray: #F5F5F5;
  --color-charcoal-gray: #212121;
  --color-medium-gray: #757575;
  --color-golden: #FFD54F;
}

.modern-page {
  background: var(--color-light-gray);
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
}

.new-consumption-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 16px;
  }
}

// Header Section
.page-header {
  margin-bottom: 32px;
  background: var(--color-pure-white);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
    margin-bottom: 24px;
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
}

.header-navigation {
  flex-shrink: 0;
}

.back-btn {
  color: var(--color-petroleum-blue);
  border-radius: 12px;
  padding: 8px 16px;
  transition: all 0.2s ease;
  font-weight: 500;

  &:hover {
    background-color: rgba(1, 87, 155, 0.1);
    color: var(--color-dark-teal);
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
  }
}

.header-text {
  flex: 1;
  text-align: center;

  @media (max-width: 768px) {
    text-align: left;
  }
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-charcoal-gray);
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 24px;
    justify-content: flex-start;
  }
}

.title-icon {
  color: var(--color-jade-green);
  font-size: 32px;

  @media (max-width: 768px) {
    font-size: 28px;
  }
}

.page-subtitle {
  font-size: 16px;
  color: var(--color-medium-gray);
  margin: 0;
  font-weight: 400;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 14px;
  }
}

.progress-indicator {
  display: flex;
  gap: 16px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.2s ease;
  min-width: 80px;

  &.active {
    background: linear-gradient(135deg, var(--color-jade-green), var(--color-light-green));
    color: var(--color-pure-white);
    box-shadow: 0 4px 12px rgba(0, 121, 107, 0.3);
  }

  &:not(.active) {
    background: var(--color-light-gray);
    color: var(--color-medium-gray);
  }

  i {
    font-size: 20px;
  }

  span {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  @media (max-width: 768px) {
    min-width: 60px;
    padding: 8px;

    i {
      font-size: 18px;
    }

    span {
      font-size: 10px;
    }
  }
}

// Form Section
.form-section {
  // El formulario ya tiene sus propios estilos, solo necesitamos asegurar el espaciado
  :deep(.consumption-form-container) {
    padding: 0;
  }

  :deep(.consumption-form-card) {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(0, 77, 64, 0.1);

    &:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }
  }

  // Actualizar colores del header del formulario para que coincida con el diseño
  :deep(.form-header) {
    background: linear-gradient(135deg, var(--color-dark-teal), var(--color-jade-green));
  }

  // Actualizar colores de los botones
  :deep(.form-actions) {
    background: linear-gradient(135deg, var(--color-dark-teal), var(--color-jade-green));

    .q-btn {
      &[color="green"] {
        background: linear-gradient(135deg, var(--color-jade-green), var(--color-light-green));
        color: var(--color-pure-white);
        border: none;

        &:hover {
          background: linear-gradient(135deg, var(--color-light-green), var(--color-jade-green));
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 121, 107, 0.3);
        }
      }

      &[color="red"] {
        background: rgba(244, 67, 54, 0.1);
        color: #d32f2f;
        border: 2px solid rgba(244, 67, 54, 0.3);

        &:hover {
          background: rgba(244, 67, 54, 0.2);
          border-color: rgba(244, 67, 54, 0.5);
          transform: translateY(-1px);
        }
      }
    }
  }
}

// Responsive adjustments
@media (max-width: 480px) {
  .new-consumption-page {
    padding: 12px;
  }

  .page-header {
    padding: 12px;
  }

  .page-title {
    font-size: 20px;
  }

  .page-subtitle {
    font-size: 13px;
  }

  .progress-step {
    min-width: 50px;
    padding: 6px;

    span {
      font-size: 9px;
    }
  }
}
</style>