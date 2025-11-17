'use strict';

angular.module('ahorrosApp')

.factory('categoriaFactory', function($resource, API_URL) {
  return $resource(`${API_URL}/categoria/:id`, { id: '@id' }, 
    { update: { method: 'PUT' } });
});