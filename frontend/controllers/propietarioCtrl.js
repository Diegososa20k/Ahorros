angular.module('ahorrosApp')
.controller('propietarioCtrl', function($scope, propietarioFactory, ubicacionDineroFactory, $uibModal, propietarioUnicoFactory) {
  $scope.propietarios = [];
  $scope.ubicaciones = [];
  $scope.listaPropietarios = [];
  $scope.nuevo = { propietario_id: '', ubicacion_id: '', tieneCajitas: false, cajita: '', nombre_cajita_subcuenta: '' };

  $scope.cargarPropietarios = function() {
    propietarioUnicoFactory.query().$promise
      .then(data => { $scope.propietarios = data; })
      .catch(err => console.error(err));
  };

  $scope.cargarUbicaciones = function() {
    ubicacionDineroFactory.query().$promise
      .then(data => { $scope.ubicaciones = data; })
      .catch(err => console.error(err));
  };

  // 🔹 Cargar lista completa de propietarios guardados
  $scope.cargarListaPropietarios = function() {
    propietarioFactory.query().$promise
      .then(data => { $scope.listaPropietarios = data; })
      .catch(err => console.error(err));
  };

  $scope.guardarPropietario = function() {
    if (!$scope.nuevo.propietario_id || !$scope.nuevo.ubicacion_id) {
      alert('Selecciona un propietario y una ubicación');
      return;
    }

    const data = {
      propietario_id: $scope.nuevo.propietario_id,
      ubicacion_id: $scope.nuevo.ubicacion_id,
      tieneCajitas: $scope.nuevo.tieneCajitas === 'true',
      cajita: $scope.nuevo.cajita || null,
      nombre_cajita_subcuenta: $scope.nuevo.nombre_cajita_subcuenta || null // 🔹 nuevo
    };

    propietarioFactory.save(data).$promise
      .then(() => {
        alert('Propietario guardado correctamente');
        $scope.nuevo = { propietario_id: '', ubicacion_id: '', tieneCajitas: false, nombre_cajita_subcuenta: '' };
        $scope.cargarListaPropietarios(); // 👈 refrescar tabla
      })
      .catch(err => {
        console.error('Error al guardar propietario:', err);
        alert('Error al guardar el propietario');
      });
  };

  $scope.eliminarPropietario = function(id) {
    if (confirm('¿Seguro que deseas eliminar este propietario?')) {
      propietarioFactory.delete({ id: id }).$promise
        .then(() => $scope.cargarListaPropietarios())
        .catch(err => console.error(err));
    }
  };


   // 🔹 Abrir modal para crear propietario único
  $scope.abrirModalPropietario = function() {
    var modalInstance = $uibModal.open({
      templateUrl: 'views/propietario/modal/propietario.html',
      controller: 'ModalPropietarioUnicoCtrl',
      size: 'md'
    });

    modalInstance.result.then(function(nuevoProp) {
      if (nuevoProp) {
        propietarioUnicoFactory.save(nuevoProp).$promise
          .then(() => $scope.cargarPropietarios())
          .catch(err => console.error(err));
      }
    });
  };


  // Cargar todo al iniciar
  $scope.cargarPropietarios();
  $scope.cargarUbicaciones();
  $scope.cargarListaPropietarios();
})


.controller('ModalPropietarioUnicoCtrl', function($scope, $uibModalInstance) {
  $scope.nuevo = { nombre: '' };

  $scope.guardar = function() {
    if (!$scope.nuevo.nombre) return;
    $uibModalInstance.close($scope.nuevo);
  };

  $scope.cancelar = function() {
    $uibModalInstance.dismiss('cancel');
  };
});

