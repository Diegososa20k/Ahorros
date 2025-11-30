

// services/propietarioFactory.js
'use strict';

angular.module('ahorrosApp')
.factory('controlDeudaFactory', function($resource, API_URL) {
  return $resource(`${API_URL}/control_deuda/:id`, { id: '@id' }, 
    { 'update': { method: 'PUT' },
      'delete': { method: 'DELETE' },
      'post': {method: 'POST'},
      'get': {method: 'GET'},
      pagar: { 
        method: 'PUT',
        url: `${API_URL}/control_deuda/:id/pagar`
      },
      pagarMensualidad: {
        method: 'PUT',
        url: `${API_URL}/control_deuda/:id/pagar_mensualidad`
    },

    abonar: {
          method: 'PUT',
          url: `${API_URL}/control_deuda/:id/abonar`
      }
    });
});
