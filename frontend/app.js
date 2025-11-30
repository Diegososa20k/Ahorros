var app = angular.module('ahorrosApp', ['ui.router', 'ngResource', 'ui.bootstrap']);

app.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/principal');

  $stateProvider
    .state('principal', {
      url: '/principal',
      templateUrl: 'views/principal.html',
      controller: 'principalCtrl'
    })
    .state('trabajo', {
      url: '/trabajo',
      templateUrl: 'views/trabajo/index.html'
    })
    .state('ubicacion_dinero', {
      url: '/ubicacion_dinero',
      templateUrl: 'views/ubicacion_dinero/index.html',
      controller: 'ubicacionDineroCtrl'
    })
    .state('propietario', {
      url: '/propietario',
      templateUrl: 'views/propietario/index.html',
      controller: 'propietarioCtrl'
    })

    .state('ahorro', {
      url: '/ahorro',
      templateUrl: 'views/ahorro/index.html',
      controller: 'ahorroCtrl'
    })

    .state('control_deuda', {
      url: '/control_deuda',
      templateUrl: 'views/control_deuda/index.html',
      controller: 'controlDeudaCtrl'
    });
    
});
