'use strict';

angular.module('ahorrosApp')

.factory('ahorroFactory', function($resource) {
  return $resource('http://localhost:5001/api/ahorro/:id', { id: '@id' }, {
    query: {
      method: 'GET',
      isArray: false // 👈 agrega esto
    },
    update: { method: 'PUT' },
    delete: { method: 'DELETE' }
  });
});
