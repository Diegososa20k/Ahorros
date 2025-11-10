'use strict';

angular.module('ahorrosApp')
.factory('dondeAhorrarFactory', function($resource) {
  return $resource('http://localhost:5001/api/donde_ahorrar/:id', { id: '@id' }, 
    { 'update': { method: 'PUT' },
      'delete': { method: 'DELETE' }
    });
});
