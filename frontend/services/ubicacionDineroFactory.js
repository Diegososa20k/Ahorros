'use strict';

angular.module('ahorrosApp')

.factory('ubicacionDineroFactory', function($resource, API_URL) {
  return $resource(`${API_URL}/ubicacion_dinero/:id`, { id: '@id' }, 
    { update: { method: 'PUT' },
      delete: { method: 'DELETE' }
    });
    
});
