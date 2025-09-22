import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useTabsStore } from '../stores/tabs';

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: () => import('../pages/LoginPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    component: () => import('../pages/DashboardPage.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        component: () => import('../components/DashboardHome.vue')
      },
      {
        path: '/consumptions',
        component: () => import('../pages/ConsumptionsPage.vue')
      },
      {
        path: '/consumptions/new',
        component: () => import('../pages/NewConsumptionPage.vue')
      },
      {
        path: '/consumptions/edit/:id',
        name: 'edit-consumption',
        component: () => import('../pages/EditConsumptionPage.vue'),
        props: true
      },
      {
        path: '/monthly-readings',
        component: () => import('../pages/MonthlyReadingsPage.vue')
      },
      {
        path: '/sync-data',
        component: () => import('../pages/SyncDataPage.vue')
      },
      {
        path: '/subsidies',
        component: () => import('../pages/SubsidiesPage.vue')
      },
      {
        path: '/sectores',
        component: () => import('../pages/generic-capture/SectorsPage.vue')
      },
      {
        path: '/tarifas',
        component: () => import('../pages/generic-capture/TarifasPage.vue')
      },
      {
        path: '/estratos',
        component: () => import('../pages/generic-capture/EstratosPage.vue')
      },
      {
        path: '/empresas',
        component: () => import('../pages/EmpresasPage.vue')
      },
      {
        path: '/empresas/nueva',
        component: () => import('../pages/NuevaEmpresaPage.vue')
      },
      {
        path: '/empresas/editar/:id',
        name: 'edit-empresa',
        component: () => import('../pages/EditarEmpresaPage.vue'),
        props: true
      },
      {
        path: '/maestros',
        component: () => import('../pages/MaestrosPage.vue')
      },
      {
        path: '/maestros/estratos',
        component: () => import('../pages/GenericMaestroPage.vue')
      },
      {
        path: '/maestros/marcas-medidor',
        component: () => import('../pages/GenericMaestroPage.vue')
      },
      {
        path: '/maestros/profesiones',
        component: () => import('../pages/GenericMaestroPage.vue')
      },
      {
        path: '/maestros/sectores',
        component: () => import('../pages/GenericMaestroPage.vue')
      },
      {
        path: '/maestros/tipo-persona',
        component: () => import('../pages/GenericMaestroPage.vue')
      },
      // Nuevas rutas para tablas dinámicas
      {
        path: '/dynamic-tables',
        component: () => import('../pages/DynamicTablesIndexPage.vue')
      },
      {
        path: '/dynamic-tables/:tableId',
        name: 'dynamic-table',
        component: () => import('../pages/DynamicTablePage.vue'),
        props: true
      },
      {
        path: '/diferidos/cuotas-conexion',
        component: () => import('../pages/CuotasConexionPage.vue')
      },
      {
        path: '/cuotas-conexion/nuevo',
        component: () => import('../pages/NewCuotaConexionPage.vue')
      },
      {
        path: '/diferidos/cuotas-medidor',
        component: () => import('../pages/CuotasMedidorPage.vue')
      },
      {
        path: '/diferidos/cuotas-medidor/nuevo',
        component: () => import('../pages/NewCuotasMedidorPage.vue')
      },
      {
        path: '/diferidos/cuotas-diferidos',
        component: () => import('../pages/CuotasDiferidosPage.vue')
      },
      {
        path: '/diferidos/cuotas-diferidos/nuevo',
        component: () => import('../pages/NewCuotasDiferidosPage.vue')
      },
      {
        path: '/diferidos/acuerdos-pago',
        component: () => import('../pages/AcuerdosPagoPage.vue')
      },
      {
        path: '/facturas/facturar',
        component: () => import('../pages/FacturarPage.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const tabsStore = useTabsStore();
  const isAuthenticated = authStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
    return;
  }

  if (to.path === '/login' && isAuthenticated) {
    next('/dashboard');
    return;
  }

  // Add tab when navigating to a route
  if (to.path !== '/login' && to.path !== '/dashboard' && to.path !== '/') {
    const routeConfig = routes[2].children?.find(route => route.path === to.path);
    if (routeConfig) {
      // Get the menu item that corresponds to this route
      const menuItems = [
        { icon: 'dashboard', label: 'Dashboard', route: '/dashboard', closable: false },
        { icon: 'show_chart', label: 'Consumos', route: '/consumptions', closable: true },
        { icon: 'list_alt', label: 'Lecturas Mes', route: '/monthly-readings', closable: true },
        { icon: 'storage', label: 'Datos Sincronizados', route: '/sync-data', closable: true },
        { icon: 'request_quote', label: 'Subsidios', route: '/subsidies', closable: true },
        { icon: 'location_city', label: 'Sectores', route: '/sectores', closable: true },
        { icon: 'payments', label: 'Tarifas', route: '/tarifas', closable: true },
        { icon: 'group_work', label: 'Estratos', route: '/estratos', closable: true },
        { icon: 'business', label: 'Empresas', route: '/empresas', closable: true },
        { icon: 'electrical_services', label: 'Cuotas conexión', route: '/diferidos/cuotas-conexion', closable: true },
        { icon: 'speed', label: 'Cuotas medidor', route: '/diferidos/cuotas-medidor', closable: true },
        { icon: 'handshake', label: 'Acuerdos de Pago', route: '/diferidos/acuerdos-pago', closable: true }
      ];
      
      const menuItem = menuItems.find(item => item.route === to.path);
      
      if (menuItem) {
        tabsStore.addTab({
          name: menuItem.label,
          route: menuItem.route,
          icon: menuItem.icon,
          closable: menuItem.closable
        });
      }
    }
  }

  next();
});

export default router;
