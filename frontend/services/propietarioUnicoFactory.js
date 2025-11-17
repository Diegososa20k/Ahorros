'use strict';

angular.module('ahorrosApp')
.factory('propietarioUnicoFactory', function($resource, API_URL) {
  return $resource(`${API_URL}/propietario_unico/:id`, { id: '@id' }, {
    update: { method: 'PUT' }
  });
});
