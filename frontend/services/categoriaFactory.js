'use strict';

angular.module('ahorrosApp')

.factory('categoriaFactory', function($resource) {
  return $resource('http://localhost:5001/api/categoria/:id', { id: '@id' }, { update: { method: 'PUT' } });
});