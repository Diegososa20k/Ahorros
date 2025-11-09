// services/propietarioFactory.js
'use strict';

angular.module('ahorrosApp')
.factory('propietarioFactory', function($resource) {
  return $resource('http://localhost:5001/api/propietario/:id', { id: '@id' }, 
    { 'update': { method: 'PUT' },
      'delete': { method: 'DELETE' }
    });
});
