<template>
  <q-page class="page-container">
    <!-- Header moderno -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <div class="title-section">
            <div class="title-icon">
              <q-icon name="settings" size="24px" />
            </div>
            <h1 class="page-title">Maestros</h1>
          </div>
          <p class="page-subtitle">Gestión de datos maestros del sistema</p>
        </div>
      </div>
    </div>

    <!-- Sección de tarjetas -->
    <div class="maestros-section">
      <div class="maestros-header">
        <div class="maestros-title">
          <q-icon name="dashboard" class="maestros-icon" size="20px" />
          <span>Módulos Disponibles</span>
        </div>
      </div>
      
      <div class="maestros-content">
        <div class="cards-grid">
          <q-card class="maestro-card" @click="goToEstratos">
            <q-card-section class="card-content">
              <div class="card-icon-container">
                <q-icon name="layers" class="card-icon" />
              </div>
              <div class="card-info">
                <div class="card-title">Estratos</div>
                <div class="card-description">Gestión de estratos socioeconómicos</div>
              </div>
              <div class="card-arrow">
                <q-icon name="arrow_forward" />
              </div>
            </q-card-section>
          </q-card>

          <q-card class="maestro-card" @click="goToMarcasMedidor">
            <q-card-section class="card-content">
              <div class="card-icon-container">
                <q-icon name="speed" class="card-icon" />
              </div>
              <div class="card-info">
                <div class="card-title">Marcas Medidor</div>
                <div class="card-description">Gestión de marcas de medidores</div>
              </div>
              <div class="card-arrow">
                <q-icon name="arrow_forward" />
              </div>
            </q-card-section>
          </q-card>

          <q-card class="maestro-card" @click="goToProfesiones">
            <q-card-section class="card-content">
              <div class="card-icon-container">
                <q-icon name="work" class="card-icon" />
              </div>
              <div class="card-info">
                <div class="card-title">Profesiones</div>
                <div class="card-description">Gestión de profesiones</div>
              </div>
              <div class="card-arrow">
                <q-icon name="arrow_forward" />
              </div>
            </q-card-section>
          </q-card>

          <q-card class="maestro-card" @click="goToSectores">
            <q-card-section class="card-content">
              <div class="card-icon-container">
                <q-icon name="location_city" class="card-icon" />
              </div>
              <div class="card-info">
                <div class="card-title">Sectores</div>
                <div class="card-description">Gestión de sectores</div>
              </div>
              <div class="card-arrow">
                <q-icon name="arrow_forward" />
              </div>
            </q-card-section>
          </q-card>

          <q-card class="maestro-card" @click="goToTipoPersona">
            <q-card-section class="card-content">
              <div class="card-icon-container">
                <q-icon name="person" class="card-icon" />
              </div>
              <div class="card-info">
                <div class="card-title">Tipo Persona</div>
                <div class="card-description">Gestión de tipos de persona</div>
              </div>
              <div class="card-arrow">
                <q-icon name="arrow_forward" />
              </div>
            </q-card-section>
          </q-card>

          <q-card class="maestro-card disabled-card">
            <q-card-section class="card-content">
              <div class="card-icon-container disabled">
                <q-icon name="attach_money" class="card-icon" />
              </div>
              <div class="card-info">
                <div class="card-title">Tarifas</div>
                <div class="card-description">Próximamente</div>
              </div>
              <div class="card-arrow disabled">
                <q-icon name="schedule" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goToEstratos = () => {
  router.push('/maestros/estratos');
};

const goToMarcasMedidor = () => {
  router.push('/maestros/marcas-medidor');
};

const goToProfesiones = () => {
  router.push('/maestros/profesiones');
};

const goToSectores = () => {
  router.push('/maestros/sectores');
};

const goToTipoPersona = () => {
  router.push('/maestros/tipo-persona');
};
</script>

<style lang="scss" scoped>
.page-container {
  max-width: 1400px;
  margin: 0 auto;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #43e97b 100%);
  min-height: 100vh;
  padding: 20px;
  border-radius: 20px;
}

.page-header {
  margin-bottom: 32px;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
    background: rgba(255, 255, 255, 0.95);
    padding: 24px 32px;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
  }
  
  .header-text {
    flex: 1;
    
    .title-section {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 8px;
      
      .title-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: linear-gradient(135deg, #4facfe, #00f2fe);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 4px 16px rgba(79, 172, 254, 0.3);
      }
      
      .page-title {
        margin: 0;
        background: linear-gradient(135deg, #4facfe, #43e97b);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-weight: 700;
        font-size: 1.8rem;
      }
    }
    
    .page-subtitle {
      margin: 0;
      color: #666;
      font-size: 0.95rem;
    }
  }
}

.maestros-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  overflow: hidden;
  
  .maestros-header {
    padding: 20px 32px;
    background: linear-gradient(135deg, rgba(79, 172, 254, 0.1), rgba(67, 233, 123, 0.1));
    border-bottom: 1px solid rgba(79, 172, 254, 0.2);
    
    .maestros-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 600;
      color: #333;
      font-size: 1.1rem;
      
      .maestros-icon {
        color: #4facfe;
      }
    }
  }
  
  .maestros-content {
    padding: 32px;
    
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;
      
      .maestro-card {
        border-radius: 16px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        border: 2px solid transparent;
        cursor: pointer;
        
        &:hover:not(.disabled-card) {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          border-color: rgba(79, 172, 254, 0.3);
          
          .card-icon-container {
            background: linear-gradient(135deg, #4facfe, #00f2fe);
            
            .card-icon {
              color: white;
              transform: scale(1.1);
            }
          }
          
          .card-arrow {
            transform: translateX(4px);
            color: #4facfe;
          }
        }
        
        &.disabled-card {
          opacity: 0.6;
          cursor: not-allowed;
          
          .card-icon-container.disabled {
            background: #f5f5f5;
            
            .card-icon {
              color: #999;
            }
          }
          
          .card-title {
            color: #999;
          }
          
          .card-arrow.disabled {
            color: #999;
          }
        }
        
        .card-content {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px;
          
          .card-icon-container {
            width: 60px;
            height: 60px;
            border-radius: 12px;
            background: rgba(79, 172, 254, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            flex-shrink: 0;
            
            .card-icon {
              font-size: 28px;
              color: #4facfe;
              transition: all 0.3s ease;
            }
          }
          
          .card-info {
            flex: 1;
            
            .card-title {
              font-size: 1.2rem;
              font-weight: 600;
              color: #333;
              margin-bottom: 4px;
              transition: color 0.3s ease;
            }
            
            .card-description {
              color: #666;
              font-size: 0.9rem;
              line-height: 1.4;
            }
          }
          
          .card-arrow {
            color: #ccc;
            font-size: 20px;
            transition: all 0.3s ease;
            flex-shrink: 0;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 12px;
    border-radius: 12px;
  }
  
  .page-header {
    .header-content {
      padding: 20px;
    }
  }
  
  .maestros-section {
    .maestros-header {
      padding: 16px 20px;
    }
    
    .maestros-content {
      padding: 20px;
      
      .cards-grid {
        grid-template-columns: 1fr;
        gap: 16px;
        
        .maestro-card {
          .card-content {
            padding: 20px;
            gap: 16px;
            
            .card-icon-container {
              width: 50px;
              height: 50px;
              
              .card-icon {
                font-size: 24px;
              }
            }
            
            .card-info {
              .card-title {
                font-size: 1.1rem;
              }
              
              .card-description {
                font-size: 0.85rem;
              }
            }
          }
        }
      }
    }
  }
}
</style>