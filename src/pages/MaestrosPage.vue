<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md">
      <div class="col">
        <h4 class="q-my-none">Maestros</h4>
        <p class="text-grey-6">Gestión de datos maestros del sistema</p>
      </div>
    </div>

    <div class="row q-gutter-md">
      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="cursor-pointer" @click="goToEstratos">
          <q-card-section class="text-center">
            <q-icon name="layers" size="3rem" color="primary" class="q-mb-md" />
            <div class="text-h6">Estratos</div>
            <div class="text-grey-6">Gestión de estratos socioeconómicos</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="cursor-pointer" @click="goToMarcasMedidor">
          <q-card-section class="text-center">
            <q-icon name="speed" size="3rem" color="primary" class="q-mb-md" />
            <div class="text-h6">Marcas Medidor</div>
            <div class="text-grey-6">Gestión de marcas de medidores</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="cursor-pointer" @click="goToProfesiones">
          <q-card-section class="text-center">
            <q-icon name="work" size="3rem" color="primary" class="q-mb-md" />
            <div class="text-h6">Profesiones</div>
            <div class="text-grey-6">Gestión de profesiones</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="cursor-pointer" @click="goToSectores">
          <q-card-section class="text-center">
            <q-icon name="location_city" size="3rem" color="primary" class="q-mb-md" />
            <div class="text-h6">Sectores</div>
            <div class="text-grey-6">Gestión de sectores</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="cursor-pointer" @click="goToTipoPersona">
          <q-card-section class="text-center">
            <q-icon name="person" size="3rem" color="primary" class="q-mb-md" />
            <div class="text-h6">Tipo Persona</div>
            <div class="text-grey-6">Gestión de tipos de persona</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="cursor-pointer opacity-50">
          <q-card-section class="text-center">
            <q-icon name="attach_money" size="3rem" color="grey" class="q-mb-md" />
            <div class="text-h6 text-grey">Tarifas</div>
            <div class="text-grey-6">Próximamente</div>
          </q-card-section>
        </q-card>
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

<style scoped>
.cursor-pointer {
  cursor: pointer;
  transition: transform 0.2s;
}

.cursor-pointer:hover {
  transform: translateY(-2px);
}

.opacity-50 {
  opacity: 0.5;
}
</style>