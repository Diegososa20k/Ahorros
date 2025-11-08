// controllers/propietarioCtrl.js
angular.module('ahorrosApp')
.controller('propietarioCtrl', function($scope, propietarioFactory, ubicacionDineroFactory, $uibModal) {
  $scope.propietarios = [];
  $scope.ubicaciones = [];
  $scope.nuevo = { nombre: '', ubicacion_id: '', tieneCajitas: false, cajita: '' };

  // cargar propietarios
  $scope.cargarPropietarios = function() {
    propietarioFactory.query().$promise
      .then(function(data) { $scope.propietarios = data; })
      .catch(err => console.error(err));
  };

  // cargar ubicaciones
  $scope.cargarUbicaciones = function() {
    ubicacionDineroFactory.query().$promise
      .then(data => $scope.ubicaciones = data)
      .catch(err => console.error(err));
  };

  // guardar propietario
  $scope.guardarPropietario = function() {
    propietarioFactory.save($scope.nuevo).$promise
      .then(() => {
        $scope.nuevo = { nombre: '', ubicacion_id: '', tieneCajitas: false, cajita: '' };
        $scope.cargarPropietarios();
      })
      .catch(err => console.error(err));
  };

  // abrir modal para crear propietario
  $scope.abrirModalPropietario = function() {
    var modalInstance = $uibModal.open({
      templateUrl: 'views/propietario/modal/propietario.html',
      controller: 'ModalPropietarioCtrl',
      size: 'md'
    });

    modalInstance.result.then(function(nuevoProp) {
      if (nuevoProp) $scope.cargarPropietarios();
    });
  };

  $scope.cargarPropietarios();
  $scope.cargarUbicaciones();
})


.controller('ModalPropietarioCtrl', function($scope, $uibModalInstance) {
  $scope.nuevoPropietario = {};

  $scope.guardar = function() {
    if (!$scope.nuevoPropietario.nombre) return;
    $uibModalInstance.close($scope.nuevoPropietario);
  };

  $scope.cancelar = function() {
    $uibModalInstance.dismiss('cancel');
  };
});
