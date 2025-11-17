'use strict';

angular.module('ahorrosApp')
.factory('dondeAhorrarFactory', function($resource, API_URL) {
  return $resource(`${API_URL}/donde_ahorrar/:id`, { id: '@id' }, 
    { 'update': { method: 'PUT' },
      'delete': { method: 'DELETE' }
    });
});
