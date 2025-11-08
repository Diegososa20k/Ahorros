angular.module('ahorrosApp')
.controller('ubicacionDineroCtrl', function($scope, ubicacionDineroFactory, categoriaFactory, $uibModal) {  // <- cambio $modal por $uibModal
  $scope.ubicaciones = [];
  $scope.categorias = [];
  $scope.nueva = { nombre: '', categoria_id: '' };
  $scope.busqueda = '';

  $scope.cargar = function() {
    ubicacionDineroFactory.query().$promise
      .then(function(data) { $scope.ubicaciones = data; })
      .catch(function(err){ console.error(err); });
  };

  $scope.cargarCategorias = function() {
    categoriaFactory.query().$promise
      .then(function(data) { $scope.categorias = data; })
      .catch(function(err){ console.error(err); });
  };

  $scope.guardar = function() {
    ubicacionDineroFactory.save($scope.nueva).$promise
      .then(function() {
        $scope.nueva = { nombre: '', categoria_id: '' };
        $scope.cargar();
      })
      .catch(function(err) { console.error(err); });
  };

  // 🔹 Abrir modal con $uibModal.open
  $scope.abrirModalCategoria = function() {
    var modalInstance = $uibModal.open({   // <- cambio aquí
      templateUrl: 'views/ubicacion_dinero/modal/categoria.html',
      controller: 'ModalCategoriaCtrl',
      size: 'md',
      backdrop: 'static',
      keyboard: false,
      resolve: {
        categorias: function() {
          return $scope.categorias;
        }
      }
    });

    modalInstance.result.then(function(nuevaCat) {
      if (nuevaCat) {
        $scope.cargarCategorias();
      }
    });
  };

  $scope.filtrar = function(item) {
    if (!$scope.busqueda) return true;
    const q = $scope.busqueda.toLowerCase();
    return (item.nombre && item.nombre.toLowerCase().indexOf(q) !== -1) ||
           (item.categoria && item.categoria.nombre && item.categoria.nombre.toLowerCase().indexOf(q) !== -1);
  };

  $scope.cargar();
  $scope.cargarCategorias();
})

.controller('ModalCategoriaCtrl', function($scope, $uibModalInstance, categorias, categoriaFactory) {
  $scope.nuevaCategoria = {};
  $scope.categorias = categorias;

  $scope.guardarCategoria = function() {
    if (!$scope.nuevaCategoria.nombre) return;
    categoriaFactory.save($scope.nuevaCategoria).$promise
      .then(function() {
        $uibModalInstance.close($scope.nuevaCategoria);
      })
      .catch(function(err){ console.error(err); });
  };

  $scope.cancelar = function() {
    $uibModalInstance.dismiss('cancel');
  };
});

