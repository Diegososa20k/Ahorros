'use strict';

angular.module('ahorrosApp')
.factory('propietarioUnicoUbicacionesFactory', function($resource, API_URL) {

  return {
    ubicaciones: function(propietarioId) {
      return $resource(
        `${API_URL}/propietario_unico/:id/ubicaciones`,
        { id: propietarioId },
        {
          query: { method: 'GET', isArray: false }
        }
      ).query().$promise;
    },

    cajitas: function(propietarioId, ubicacionId) {
      return $resource(
        `${API_URL}/propietario_unico/:propietarioId/ubicaciones/:ubicacionId/cajitas`,
        { propietarioId, ubicacionId },
        {
          query: { method: 'GET', isArray: false }
        }
      ).query().$promise;
    }
  };

});
