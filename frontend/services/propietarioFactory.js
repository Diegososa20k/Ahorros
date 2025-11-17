// services/propietarioFactory.js
'use strict';

angular.module('ahorrosApp')
.factory('propietarioFactory', function($resource, API_URL) {
  return $resource(`${API_URL}/propietario/:id`, { id: '@id' }, 
    { 'update': { method: 'PUT' },
      'delete': { method: 'DELETE' }
    });
});
