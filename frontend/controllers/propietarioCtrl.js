angular.module('ahorrosApp')
.controller('propietarioCtrl', function($scope, propietarioFactory, ubicacionDineroFactory, $uibModal, propietarioUnicoFactory, Alertas) {
  $scope.propietarios = [];

  $scope.filtroPropietario = {
  nombre: "",
  ubicacion: "",
  categoria: "",
  cajita: ""
};


  $scope.currentPage = 1;
  $scope.pageSize = 10;

  $scope.paginar = function(lista) {
    if (!lista) return [];

    let inicio = ($scope.currentPage - 1) * $scope.pageSize;
    return lista.slice(inicio, inicio + $scope.pageSize);
  };


  $scope.filtrarPropietarios = function(item) {

    // Propietario
    if ($scope.filtroPropietario.nombre &&
        !item.propietario_unico.nombre.toLowerCase()
          .includes($scope.filtroPropietario.nombre.toLowerCase())) {
      return false;
    }

    // Ubicación
    if ($scope.filtroPropietario.ubicacion &&
        !item.ubicacion.nombre.toLowerCase()
          .includes($scope.filtroPropietario.ubicacion.toLowerCase())) {
      return false;
    }

    // Categoría
    if ($scope.filtroPropietario.categoria &&
        !item.ubicacion.categoria.nombre.toLowerCase()
          .includes($scope.filtroPropietario.categoria.toLowerCase())) {
      return false;
    }

    // Cajita / Subcuenta
    if ($scope.filtroPropietario.cajita &&
        !(item.nombre_cajita_subcuenta || "")
          .toLowerCase()
          .includes($scope.filtroPropietario.cajita.toLowerCase())) {
      return false;
    }

    return true;
  };



  $scope.limpiarFiltros = function () {
    $scope.filtroPropietario = {
      nombre: '',
      ubicacion: '',
      categoria: '',
      cajita: ''
    };

    $scope.currentPage = 1; // reinicia paginación opcional
  };

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
        return Alertas.warning(
          "Falta información",
          "Debes seleccionar un propietario y una ubicación."
        );
      }

      const data = {
        propietario_id: $scope.nuevo.propietario_id,
        ubicacion_id: $scope.nuevo.ubicacion_id,
        tieneCajitas: $scope.nuevo.tieneCajitas === 'true',
        cajita: $scope.nuevo.cajita || null,
        nombre_cajita_subcuenta: $scope.nuevo.nombre_cajita_subcuenta || null
      };

      propietarioFactory.save(data).$promise
        .then(() => {

          Alertas.success(
            "Guardado",
            "El propietario fue registrado correctamente."
          );

          $scope.nuevo = {
            propietario_id: '',
            ubicacion_id: '',
            tieneCajitas: false,
            nombre_cajita_subcuenta: ''
          };

          $scope.cargarListaPropietarios();
        })
        .catch(err => {
          console.error('Error al guardar propietario:', err);

          Alertas.error(
            "Error",
            "No se pudo guardar el propietario."
          );
        });
    };


  $scope.eliminarPropietario = function(id) {

  Alertas.confirm(
    "¿Eliminar propietario?",
    "Esta acción no se puede deshacer."
  )
  .then(result => {

    if (!result.isConfirmed) throw null; // detener si cancela

    return propietarioFactory.delete({ id }).$promise;
  })
  .then(() => {

    Alertas.success(
      "Eliminado",
      "El propietario fue eliminado correctamente."
    );

    $scope.cargarListaPropietarios();
  })
  .catch(err => {
    if (err === null) return; // cancelado

    console.error(err);

    Alertas.error(
      "Error",
      "No se pudo eliminar el propietario."
    );
  });
};



   // 🔹 Abrir modal para crear propietario único
  $scope.abrirModalPropietario = function() {
    var modalInstance = $uibModal.open({
      templateUrl: 'views/propietario/modal/propietario.html',
      controller: 'ModalPropietarioUnicoCtrl',
      size: 'md',
      backdrop: 'static',
      keyboard: false 
    });

    modalInstance.result.then(function(huboCambios) {

      if (huboCambios) {
        // 🔄 ACTUALIZA TODO
        $scope.cargarPropietarios();        // selects
        $scope.cargarListaPropietarios();   // tabla principal
      }

    });
  };



  // Cargar todo al iniciar
  $scope.cargarPropietarios();
  $scope.cargarUbicaciones();
  $scope.cargarListaPropietarios();
})


.controller('ModalPropietarioUnicoCtrl', function (
  $scope,
  $uibModalInstance,
  propietarioUnicoFactory,
  Alertas
) {

  $scope.propietarios = [];
  $scope.form = {};
  $scope.editando = false;
  $scope.huboCambios = false;

  // 🔹 Cargar lista
  function cargar() {
    propietarioUnicoFactory.query().$promise
      .then(data => $scope.propietarios = data)
      .catch(err => console.error(err));
  }

  // 🔹 Guardar / Editar
  $scope.guardar = function () {

    if (!$scope.form.nombre) {
      return Alertas.warning(
        "Falta información",
        "El nombre del propietario es obligatorio."
      );
    }

    // EDITAR
    if ($scope.editando) {
      propietarioUnicoFactory.update(
        { id: $scope.form.id },
        $scope.form
      ).$promise
        .then(() => {
          Alertas.success("Actualizado", "Propietario actualizado correctamente");
          $scope.huboCambios = true;
          limpiar();
          cargar();
        })
        .catch(err => {
          console.error(err);
          Alertas.error("Error", "No se pudo actualizar el propietario.");
        });

    // CREAR
    } else {
      propietarioUnicoFactory.save($scope.form).$promise
        .then(() => {
          Alertas.success("Guardado", "Propietario creado correctamente");
          $scope.huboCambios = true
          limpiar();
          cargar();
        })
        .catch(err => {
          console.error(err);
          Alertas.error("Error", "No se pudo guardar el propietario.");
        });
    }
  };

  // 🔹 Editar
  $scope.editar = function (p) {
    $scope.form = angular.copy(p);
    $scope.editando = true;
  };

  // 🔹 Eliminar
  $scope.eliminar = function (id) {

    Alertas.confirm(
      '¿Eliminar propietario?',
      'Esta acción no se puede deshacer.'
    ).then(result => {

      if (!result.isConfirmed) return;

      propietarioUnicoFactory.delete({ id }).$promise
        .then(() => {
          Alertas.success("Eliminado", "Propietario eliminado correctamente");
          cargar();
        })
        .catch(err => {
          console.error(err);
          Alertas.error("Error", "No se pudo eliminar el propietario.");
        });
    });
  };

  function limpiar() {
    $scope.form = {};
    $scope.editando = false;
  }

  $scope.cancelar = function () {
    $uibModalInstance.close(true);
  };

  // INIT
  cargar();
});

