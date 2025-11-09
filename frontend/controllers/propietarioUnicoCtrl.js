angular.module('ahorrosApp')
.controller('propietarioUnicoCtrl', function($scope, propietarioUnicoFactory, $uibModal) {
  $scope.propietariosUnicos = [];

  $scope.cargarPropietariosUnicos = function() {
    propietarioUnicoFactory.query().$promise
      .then(function(data) { $scope.propietariosUnicos = data; })
      .catch(function(err) { console.error(err); });
  };

  // abrir modal para crear nuevo propietario único
  $scope.abrirModalCrearPropietarioUnico = function() {
    var modalInstance = $uibModal.open({
      templateUrl: 'views/propietario/modal/propietario_unico_modal.html',
      controller: 'ModalPropietarioUnicoCtrl',
      size: 'md'
    });

    modalInstance.result.then(function(nuevoObj) {
      // nuevoObj = { nombre: '...' } o null
      if (nuevoObj && nuevoObj.nombre) {
        // guardar en backend
        propietarioUnicoFactory.save(nuevoObj).$promise
          .then(function(res) {
            $scope.cargarPropietariosUnicos();
          })
          .catch(function(err) {
            console.error('Error guardando propietario unico:', err);
          });
      }
    }, function() {
      // dismissed
    });
  };

  // inicial
  $scope.cargarPropietariosUnicos();
});
