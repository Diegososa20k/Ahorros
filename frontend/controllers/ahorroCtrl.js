angular.module('ahorrosApp')
.controller('ahorroCtrl', function($scope, ahorroFactory, propietarioFactory, $http) {

  $scope.ahorros = [];
  $scope.propietarios = [];
  $scope.ubicacionesFiltradas = [];
  $scope.cajitasPropietario = [];
  $scope.mostrarCajitas = false;
  $scope.nuevoAhorro = {};

  // 🔹 Cargar lista de ahorros
  $scope.cargarAhorros = function() {
    ahorroFactory.query().$promise
      .then(function(resp) {
        $scope.ahorros = resp.data || resp;
      })
      .catch(function(err) {
        console.error('Error al cargar ahorros:', err);
      });
  };

  // 🔹 Cargar lista de propietarios
 $scope.cargarPropietarios = function() {
  propietarioFactory.query().$promise
    .then(function(data) {
      // 🔹 Filtrar propietarios únicos por propietario_id
      const unicos = [];
      const ids = new Set();

      data.forEach(p => {
        if (!ids.has(p.propietario_id)) {
          ids.add(p.propietario_id);
          unicos.push(p);
        }
      });

      $scope.propietarios = unicos;
    })
    .catch(function(err) {
      console.error('Error al cargar propietarios:', err);
    });
};


  // 🔹 Cargar ubicaciones y cajitas según propietario
  $scope.cargarDatosPropietario = function(propietarioId) {
    if (!propietarioId) return;

    const propietarioSeleccionado = $scope.propietarios.find(p => p.id === propietarioId);

    if (propietarioSeleccionado) {
      // Si el propietario tiene ubicaciones y cajitas
      $scope.ubicacionesFiltradas = propietarioSeleccionado.ubicaciones || [];
      $scope.cajitasPropietario = propietarioSeleccionado.cajitas || [];

      $scope.mostrarCajitas = $scope.cajitasPropietario.length > 0;
    }
  };

  // 🔹 Guardar ahorro
  $scope.guardarAhorro = function() {
    if ($scope.formAhorro.$invalid) return;

    ahorroFactory.save($scope.nuevoAhorro).$promise
      .then(() => {
        alert('Ahorro guardado correctamente');
        $scope.cargarAhorros();
        $scope.nuevoAhorro = {};
        $scope.formAhorro.$setPristine();
      })
      .catch(err => console.error('Error al guardar ahorro:', err));
  };

  // 🔹 Eliminar ahorro
  $scope.eliminarAhorro = function(id) {
    if (confirm('¿Seguro que deseas eliminar este ahorro?')) {
      ahorroFactory.delete({ id }).$promise
        .then(() => $scope.cargarAhorros())
        .catch(err => console.error('Error al eliminar ahorro:', err));
    }
  };


// 🔹 Cuando cambia el propietario
$scope.$watch('nuevoAhorro.propietario_id', function(nuevoValor) {
  if (nuevoValor) {
    $http.get(`http://localhost:5001/api/propietario_unico/${nuevoValor}/ubicaciones`)
      .then(resp => {
        $scope.ubicacionesFiltradas = resp.data.data;
        $scope.nuevoAhorro.ubicacion_id = '';
        $scope.cajitasPropietario = [];
        $scope.mostrarCajitas = false;
      })
      .catch(err => console.error('Error cargando ubicaciones:', err));
  }
});

// 🔹 Cuando cambia la ubicación
$scope.$watch('nuevoAhorro.ubicacion_id', function(ubicacionId) {
  const propietarioId = $scope.nuevoAhorro.propietario_id;
  if (ubicacionId && propietarioId) {
    $http.get(`http://localhost:5001/api/propietario_unico/${propietarioId}/ubicaciones/${ubicacionId}/cajitas`)
      .then(resp => {
        $scope.cajitasPropietario = resp.data.data;
        $scope.mostrarCajitas = true;
      })
      .catch(err => console.error('Error cargando cajitas:', err));
  }
});


  // 🔹 Inicial
  $scope.cargarAhorros();
  $scope.cargarPropietarios();
});
