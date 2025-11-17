'use strict';

angular.module('ahorrosApp')

.factory('ahorroFactory', function($resource, API_URL) {
  return $resource(`${API_URL}/ahorro/:id`, { id: '@id' }, {
    query: {
      method: 'GET',
      isArray: false // 👈 agrega esto
    },
    update: { method: 'PUT' },
    delete: { method: 'DELETE' }
  });
});
