angular.module('ahorrosApp')
.controller('ubicacionDineroCtrl', function($scope, ubicacionDineroFactory, categoriaFactory, $uibModal, Alertas) {  // <- cambio $modal por $uibModal
  $scope.ubicaciones = [];
  $scope.categorias = [];
  $scope.ubicaciones = [];
  $scope.nueva = { nombre: '', categoria_id: '' };
  $scope.busqueda = '';


  $scope.currentPage = 1;
  $scope.pageSize = 10;

  $scope.paginar = function(lista) {
    if (!lista) return [];

    let inicio = ($scope.currentPage - 1) * $scope.pageSize;
    return lista.slice(inicio, inicio + $scope.pageSize);
  };


      // 🔎 Filtros por columna
  $scope.filtroUbicacion = {
    nombre: "",
    categoria: "",
    fecha: ""
  };

  // 🔎 FUNCIÓN DE FILTRO
  $scope.filtrarUbicaciones = function(item) {

    // Nombre
    if ($scope.filtroUbicacion.nombre &&
        !item.nombre.toLowerCase().includes($scope.filtroUbicacion.nombre.toLowerCase())) {
      return false;
    }

    // Categoría
    if ($scope.filtroUbicacion.categoria &&
        !(item.categoria && item.categoria.nombre.toLowerCase().includes(
            $scope.filtroUbicacion.categoria.toLowerCase()))) {
      return false;
    }

    // Fecha
    if ($scope.filtroUbicacion.fecha &&
        !item.created_at.startsWith($scope.filtroUbicacion.fecha)) {
      return false;
    }

    return true;
  };

   // 🔄 LIMPIAR FILTROS
  $scope.limpiarFiltros = function () {
    $scope.filtroUbicacion = {
      nombre: "",
      categoria: "",
      fecha: ""
    };
  };




  $scope.cargar = function() {
    ubicacionDineroFactory.query().$promise
      .then(data => $scope.ubicaciones = data)
      .catch(err => console.error(err));
  };

  $scope.cargarCategorias = function() {
    categoriaFactory.query().$promise
      .then(data => $scope.categorias = data)
      .catch(err => console.error(err));
  };

  
  $scope.eliminarUbicacion = function(id) {

    Alertas.confirm('¿Eliminar esta ubicación?', 'Esta acción no se puede deshacer.')
      .then(result => {

        if (!result.isConfirmed) throw null; // <-- detener con catch silencioso

        return ubicacionDineroFactory.delete({ id }).$promise;
      })
      .then(() => {

        Alertas.success('Eliminada', 'La ubicación fue eliminada correctamente');
        $scope.cargar();
      })
      .catch(err => {
        if (err === null) return; // cancelado: no mostrar error
        console.error(err);
        Alertas.error('Error', 'No se pudo eliminar la ubicación.');
      });


  };



  $scope.guardar = function() {

    if (!$scope.nueva.nombre) {
      return Alertas.warning("Falta información", "El nombre es obligatorio.");
    }

    if (!$scope.nueva.categoria_id) {
      return Alertas.warning("Falta información", "La categoría es obligatoria.");
    }

    ubicacionDineroFactory.save($scope.nueva).$promise
      .then(() => {

        Alertas.success('Guardado', 'La ubicación fue registrada correctamente');

        $scope.nueva = { nombre: '', categoria_id: '' };
        $scope.cargar();
      })
      .catch(err => {
        console.error(err);
        Alertas.error('Error', 'No se pudo guardar la ubicación.');
      });

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



  // $scope.filtrar = function(item) {
  //   if (!$scope.busqueda) return true;
  //   const q = $scope.busqueda.toLowerCase();
  //   return (item.nombre && item.nombre.toLowerCase().indexOf(q) !== -1) ||
  //          (item.categoria && item.categoria.nombre && item.categoria.nombre.toLowerCase().indexOf(q) !== -1);
  // };

  $scope.cargar();
  $scope.cargarCategorias();
})

.controller('ModalCategoriaCtrl', function($scope, $uibModalInstance, categorias, categoriaFactory, Alertas) {
  $scope.nuevaCategoria = {};
  $scope.categorias = categorias;
  
  $scope.guardarCategoria = function() {

    if (!$scope.nuevaCategoria.nombre) {
      return Alertas.warning("Falta información", "El nombre de la categoría es obligatorio.");
    }

    categoriaFactory.save($scope.nuevaCategoria).$promise
      .then(() => {

        Alertas.success("Guardado", "La categoría fue creada correctamente");

        $uibModalInstance.close($scope.nuevaCategoria);
      })
      .catch(err => {
        console.error(err);
        Alertas.error("Error", "No se pudo guardar la categoría.");
      });
  };


  $scope.cancelar = function() {
    $uibModalInstance.dismiss('cancel');
  };
});

