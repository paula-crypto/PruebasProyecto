const routes = [
  // Ruta pública de inicio de sesión
  {
    path: '/login',
    component: () => import('@/layouts/LoginLayout.vue'),
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('@/pages/LoginPage.vue'),
        meta: { titulo: 'Iniciar Sesión', publica: true },
      },
    ],
  },

  // Redirección inicial: siempre debe arrancar en el login
  {
    path: '/',
    redirect: '/login',
  },

  {
    path: '/solicitudes',
    redirect: '/app/solicitudes',
  },
  {
    path: '/solicitudes/certificado',
    redirect: (to) => ({ path: '/app/solicitudes/certificado', query: to.query }),
  },
  {
    path: '/certificado',
    redirect: (to) => ({ path: '/app/solicitudes/certificado', query: to.query }),
  },

  // Rutas del aplicativo con MainLayout
  {
    path: '/app',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        redirect: 'solicitudes',
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/pages/DashboardPage.vue'),
        meta: {
          titulo: 'Dashboard',
          roles: ['ADMINISTRADOR', 'SUPERVISOR', 'CONTRATISTA', 'RESPONSABLE_AREA'],
        },
      },
      {
        path: 'usuarios',
        name: 'usuarios',
        component: () => import('@/pages/UsuariosPage.vue'),
        meta: { titulo: 'Usuarios', roles: ['ADMINISTRADOR'] },
      },
      {
        path: 'supervisores',
        name: 'supervisores',
        component: () => import('@/pages/SupervisoresPage.vue'),
        meta: { titulo: 'Supervisores', roles: ['ADMINISTRADOR'] },
      },
      {
        path: 'contratistas',
        name: 'contratistas',
        component: () => import('@/pages/ContratistasPage.vue'),
        meta: { titulo: 'Contratistas', roles: ['ADMINISTRADOR', 'SUPERVISOR'] },
      },
      {
        path: 'dependencias',
        name: 'dependencias',
        component: () => import('@/pages/DependenciasPage.vue'),
        meta: { titulo: 'Dependencias', roles: ['ADMINISTRADOR', 'SUPERVISOR'] },
      },
      {
        path: 'solicitudes',
        name: 'solicitudes',
        component: () => import('@/pages/SolicitudesPage.vue'),
        meta: {
          titulo: 'Solicitudes GCCON-F-088',
          roles: ['ADMINISTRADOR', 'SUPERVISOR', 'CONTRATISTA', 'RESPONSABLE_AREA'],
        },
      },
      {
        path: 'solicitudes/nueva',
        name: 'nueva-solicitud',
        component: () => import('@/pages/NuevaSolicitudPage.vue'),
        meta: {
          titulo: 'Nueva Solicitud GCCON-F-088',
          roles: ['ADMINISTRADOR', 'SUPERVISOR', 'CONTRATISTA'],
        },
      },
      {
        path: 'solicitudes/certificado',
        name: 'certificado-pdf',
        component: () => import('@/pages/CertificadoPdfPage.vue'),
        meta: {
          titulo: 'Certificado GCCON-F-088',
          roles: ['ADMINISTRADOR', 'SUPERVISOR', 'CONTRATISTA', 'RESPONSABLE_AREA'],
        },
      },
      {
        path: 'firmas',
        name: 'firmas',
        component: () => import('@/pages/FirmasPage.vue'),
        meta: {
          titulo: 'Gestionar Firmas',
          roles: ['RESPONSABLE_AREA'],
        },
      },
      {
        path: 'perfil',
        name: 'perfil',
        component: () => import('@/pages/PerfilPage.vue'),
        meta: {
          titulo: 'Perfil',
          roles: ['ADMINISTRADOR', 'SUPERVISOR', 'CONTRATISTA', 'RESPONSABLE_AREA'],
        },
      },
      {
        path: 'reportes',
        name: 'reportes',
        component: () => import('@/pages/ReportesPage.vue'),
        meta: {
          titulo: 'Reportes y Métricas',
          roles: ['ADMINISTRADOR', 'SUPERVISOR'],
        },
      },
      {
        path: 'notificaciones',
        name: 'notificaciones',
        component: () => import('@/pages/NotificacionesPage.vue'),
        meta: {
          titulo: 'Notificaciones',
          roles: ['ADMINISTRADOR', 'SUPERVISOR', 'CONTRATISTA', 'RESPONSABLE_AREA'],
        },
      },
      // Redirecciones seguras para evitar 404 si el navegador tenía la URL anterior
      {
        path: 'auditoria',
        redirect: { name: 'dashboard' },
      },
      {
        path: 'plantilla',
        redirect: { name: 'dashboard' },
      },
    ],
  },

  // Ruta pública para recuperar contraseña
  {
    path: '/recuperar',
    name: 'recuperar',
    component: () => import('@/pages/RecuperarPage.vue'),
    meta: { titulo: 'Recuperar Contraseña', publica: true },
  },

  // Ruta pública para restablecer contraseña con token
  {
    path: '/restablecer',
    name: 'restablecer',
    component: () => import('@/pages/RestablecerPage.vue'),
    meta: { titulo: 'Restablecer Contraseña', publica: true },
  },

  // Captura de rutas no encontradas
  {
    path: '/app/no-permisos',
    name: 'no-permisos',
    component: () => import('@/pages/NoPermisosPage.vue'),
    meta: { titulo: 'Sin permisos' },
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
]

export default routes
