'use strict';

angular.module('ahorrosApp')

.factory('ubicacionDineroFactory', function($resource) {
  return $resource('http://localhost:5001/api/ubicacion_dinero/:id', { id: '@id' }, { update: { method: 'PUT' } });
});
