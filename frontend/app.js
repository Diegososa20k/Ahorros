var app = angular.module('ahorrosApp', ['ui.router']);

app.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/principal');

  $stateProvider
    .state('principal', {
      url: '/principal',
      templateUrl: 'views/principal.html'
    })
    .state('trabajo', {
      url: '/trabajo',
      templateUrl: 'views/trabajo/index.html'
    });
});
