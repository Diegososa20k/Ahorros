var app = angular.module('ahorrosApp', ['ui.router', 'ngResource', 'ui.bootstrap']);

/* ============================
   CONFIG DE RUTAS
============================ */
app.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

  /* ---------------------------
     🔐 INTERCEPTOR DEL TOKEN
  ---------------------------- */
  $httpProvider.interceptors.push(function($window) {
    return {
      request: function(config) {
        const token = $window.localStorage.getItem("token");
        if (token) {
          config.headers["x-access-token"] = token;
        }
        return config;
      }
    };
  });

  // Ruta por defecto
  $urlRouterProvider.otherwise('/principal');

  /* ---------------------------
     📌 DEFINICIÓN DE RUTAS
  ---------------------------- */
  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'views/auth/login.html',
      controller: 'loginCtrl',
    })

      // 🆕 NUEVA RUTA DE REGISTRO
  .state('register', {
    url: '/register',
    templateUrl: 'views/auth/register.html',
    controller: 'registerCtrl',
  })

    .state('principal', {
      url: '/principal',
      templateUrl: 'views/principal.html',
      controller: 'principalCtrl',
      requiresLogin: true
    })

    .state('ubicacion_dinero', {
      url: '/ubicacion_dinero',
      templateUrl: 'views/ubicacion_dinero/index.html',
      controller: 'ubicacionDineroCtrl',
      requiresLogin: true
    })

    .state('propietario', {
      url: '/propietario',
      templateUrl: 'views/propietario/index.html',
      controller: 'propietarioCtrl',
      requiresLogin: true
    })

    .state('ahorro', {
      url: '/ahorro',
      templateUrl: 'views/ahorro/index.html',
      controller: 'ahorroCtrl',
      requiresLogin: true
    })

    .state('control_deuda', {
      url: '/control_deuda',
      templateUrl: 'views/control_deuda/index.html',
      controller: 'controlDeudaCtrl',
      requiresLogin: true
    });
});


app.run(function ($rootScope, $state, $transitions, authService) {
  
  $rootScope.mostrarLayout = authService.estaLogueado();

  $rootScope.logout = function() {
    authService.logout();
    $rootScope.mostrarLayout = false;
    $state.go("login");
  };

  // ✅ Usar $transitions en lugar de $stateChangeStart
  $transitions.onStart({}, function(trans) {
    const toState = trans.to();
    
    // 🔒 Bloquear rutas que requieren login
    if (toState.requiresLogin && !authService.estaLogueado()) {
      $rootScope.mostrarLayout = false;
      return trans.router.stateService.target("login");
    }

    // 🔒 Verificar roles si existen
    if (toState.roles && toState.roles.length > 0) {
      const usuario = authService.obtenerUsuario();
      if (!usuario || !usuario.rol || !toState.roles.includes(usuario.rol)) {
        return trans.router.stateService.target("principal");
      }
    }

    // 🎨 Ocultar layout en login/register
    if (toState.name === "login" || toState.name === "register") {
      $rootScope.mostrarLayout = false;
    } else {
      $rootScope.mostrarLayout = authService.estaLogueado();
    }
  });
});