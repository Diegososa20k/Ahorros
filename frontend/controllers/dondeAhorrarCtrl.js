angular.module('ahorrosApp')
.controller('dondeAhorrarCtrl', function($scope, dondeAhorrarFactory, $uibModal) {

  $scope.listaDondeAhorrar = [];

  // 🔹 Cargar registros
  $scope.cargarDondeAhorrar = function() {
    dondeAhorrarFactory.query().$promise
      .then(function(data) {
        $scope.listaDondeAhorrar = data;
      })
      .catch(function(err) {
        console.error('Error al cargar donde_ahorrar:', err);
      });
  };

  // 🔹 Abrir modal para crear nuevo registro
  $scope.abrirModalCrearDondeAhorrar = function() {
    var modalInstance = $uibModal.open({
      templateUrl: 'views/ahorro/modal/donde_ahorrar_modal.html',
      controller: 'ModalDondeAhorrarCtrl',
      size: 'md'
    });

    modalInstance.result.then(function(nuevoObj) {
      if (nuevoObj && nuevoObj.nombre) {
        dondeAhorrarFactory.save(nuevoObj).$promise
          .then(function() {
            $scope.cargarDondeAhorrar();
          })
          .catch(function(err) {
            console.error('Error al guardar donde_ahorrar:', err);
          });
      }
    }, function() {
      // dismissed
    });
  };

  // 🔹 Eliminar registro
  $scope.eliminarDondeAhorrar = function(id) {
    if (confirm('¿Seguro que deseas eliminar este registro?')) {
      dondeAhorrarFactory.delete({ id: id }).$promise
        .then(function() {
          $scope.cargarDondeAhorrar();
        })
        .catch(function(err) {
          console.error('Error al eliminar donde_ahorrar:', err);
        });
    }
  };

  // 🔹 Inicial
  $scope.cargarDondeAhorrar();
});
