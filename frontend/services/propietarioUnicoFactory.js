'use strict';

angular.module('ahorrosApp')
.factory('propietarioUnicoFactory', function($resource) {
  return $resource('http://localhost:5001/api/propietario_unico/:id', { id: '@id' }, {
    update: { method: 'PUT' }
  });
});
