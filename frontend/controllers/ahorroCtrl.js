angular.module('ahorrosApp')
.controller('ahorroCtrl', function($scope, ahorroFactory, propietarioFactory, $http, API_URL) {

  $scope.ahorros = [];
  $scope.propietarios = [];
  $scope.ubicacionesFiltradas = [];
  $scope.cajitasPropietario = [];
  $scope.mostrarCajitas = false;
  $scope.nuevoAhorro = {fecha_ahorro: new Date()};

  // Total seleccionado (para mostrar en barra superior)
  $scope.totalSeleccionado = 0;

  // 🔹 Cargar lista de ahorros (devuelve promise)
  $scope.cargarAhorros = function() {
    return ahorroFactory.query().$promise
      .then(function(resp) {
        // tu API devuelve { success:true, data: [...] }
        $scope.ahorros = (resp && resp.data) ? resp.data : resp;
        return $scope.ahorros;
      })
      .catch(function(err) {
        console.error('Error al cargar ahorros:', err);
      });
  };

  // 🔹 Generar estructura de cards (agrupa por ubicacion -> cajita y suma)
  $scope.generarCards = function() {
    const mapUbic = {}; // clave = ubicacion_id

    ($scope.ahorros || []).forEach(a => {
      if (!a.ubicacion_id) return;

      const uid = a.ubicacion_id;
      const nombreUbic = (a.ubicacion && a.ubicacion.nombre) ? a.ubicacion.nombre : 'Sin ubicación';
      const nombreCaja = a.cajita_subcuenta ? a.cajita_subcuenta : 'No tiene';
      const nombreProp = (a.propietario && a.propietario.nombre)
        ? a.propietario.nombre
        : 'Sin propietario';

      // Crear ubicación si no existe
      if (!mapUbic[uid]) {
        mapUbic[uid] = {
          id: uid,
          nombre: nombreUbic,
          propietario: nombreProp,
          cajitas: {},
          total: 0,
          checked: false
        };
      }

      const ubic = mapUbic[uid];
      const cantidad = parseFloat(a.cantidad_ahorro) || 0;

      // Sumar al total de la ubicación
      ubic.total = parseFloat((ubic.total + cantidad).toFixed(2));

      // Crear cajita si no existe
      if (!ubic.cajitas[nombreCaja]) {
        ubic.cajitas[nombreCaja] = {
          nombre: nombreCaja,
          total: 0,
          count: 0,
          checked: false
        };
      }

      // Sumar al total de esta cajita
      ubic.cajitas[nombreCaja].total = parseFloat(
        (ubic.cajitas[nombreCaja].total + cantidad).toFixed(2)
      );

      // Contador de registros
      ubic.cajitas[nombreCaja].count += 1;
    });

    // Convertir el mapa en array usable por Angular
    $scope.ubicacionesConAhorros = Object.values(mapUbic).map(u => {
      return {
        id: u.id,
        nombre: u.nombre,
        propietario: u.propietario,
        total: u.total,
        checked: u.checked,
        cajitas: Object.values(u.cajitas)
          .sort((a, b) => b.total - a.total)
      };
    }).sort((a, b) => b.total - a.total);

    // recalcular selección por si algo permanece seleccionado
    $scope.recalcularSeleccion();
  };


  // 🔹 Guardar ahorro
  $scope.guardarAhorro = function() {
    if ($scope.formAhorro && $scope.formAhorro.$invalid) return;

    ahorroFactory.save($scope.nuevoAhorro).$promise
      .then(() => {
        alert('Ahorro guardado correctamente');
        $scope.nuevoAhorro = {
          fecha_ahorro: new Date()
        };
        if ($scope.formAhorro) $scope.formAhorro.$setPristine();
        return $scope.cargarAhorros();
      })
      .then(() => $scope.generarCards())
      .catch(err => console.error('Error al guardar ahorro:', err));
  };

  // 🔹 Eliminar ahorro
  $scope.eliminarAhorro = function(id) {
    if (!confirm('¿Seguro que deseas eliminar este ahorro?')) return;
    ahorroFactory.delete({ id }).$promise
      .then(() => $scope.cargarAhorros())
      .then(() => $scope.generarCards())
      .catch(err => console.error('Error al eliminar ahorro:', err));
  };

  // 🔹 Cargar lista de propietarios (filtrar únicos si usas esa lógica)
  $scope.cargarPropietarios = function() {
    propietarioFactory.query().$promise
      .then(function(data) {
        // Si tu API devuelve los registros de "propietarios" (vinculados), filtra únicos por propietario_id
        const unicos = [];
        const ids = new Set();
        data.forEach(p => {
          const idKey = p.propietario_id || p.id; // adapta según la forma
          if (!ids.has(idKey)) {
            ids.add(idKey);
            unicos.push(p);
          }
        });
        $scope.propietarios = unicos;
      })
      .catch(function(err) {
        console.error('Error al cargar propietarios:', err);
      });
  };

  // 🔹 Cuando cambia el propietario -> traer ubicaciones para ese propietario
  $scope.$watch('nuevoAhorro.propietario_id', function(nuevoValor) {
    if (nuevoValor) {
      $http.get(`${API_URL}/propietario_unico/${nuevoValor}/ubicaciones`)
        .then(resp => {
          $scope.ubicacionesFiltradas = resp.data.data || [];
          $scope.nuevoAhorro.ubicacion_id = '';
          $scope.cajitasPropietario = [];
          $scope.mostrarCajitas = false;
        })
        .catch(err => console.error('Error cargando ubicaciones:', err));
    } else {
      $scope.ubicacionesFiltradas = [];
      $scope.cajitasPropietario = [];
      $scope.mostrarCajitas = false;
    }
  });

  // 🔹 Cuando cambia la ubicación -> traer cajitas de ese propietario+ubicacion
  $scope.$watch('nuevoAhorro.ubicacion_id', function(ubicacionId) {
    const propietarioId = $scope.nuevoAhorro.propietario_id;
    if (ubicacionId && propietarioId) {
      $http.get(`${API_URL}/propietario_unico/${propietarioId}/ubicaciones/${ubicacionId}/cajitas`)
        .then(resp => {
          $scope.cajitasPropietario = resp.data.data || [];
          $scope.mostrarCajitas = true;
        })
        .catch(err => console.error('Error cargando cajitas:', err));
    } else {
      $scope.cajitasPropietario = [];
      $scope.mostrarCajitas = false;
    }
  });

  // Alternar selección de un padre
  $scope.togglePadre = function(ubic) {
    if (!ubic || !ubic.cajitas) return;
    ubic.cajitas.forEach(c => c.checked = !!ubic.checked);
    $scope.recalcularSeleccion();
  };

  // Alternar selección de un hijo
  $scope.toggleHijo = function(ubic) {
    if (!ubic || !ubic.cajitas) return;
    ubic.checked = ubic.cajitas.every(c => c.checked);
    $scope.recalcularSeleccion();
  };

  // Recalcular suma total de seleccionados
  $scope.recalcularSeleccion = function() {
    let total = 0;
    ($scope.ubicacionesConAhorros || []).forEach(ubic => {
      ubic.cajitas.forEach(c => {
        if (c.checked) total += parseFloat(c.total) || 0;
      });
    });
    $scope.totalSeleccionado = parseFloat(total.toFixed(2));
  };

  // Inicial: cargar ahorros y luego generar cards; cargar propietarios
  $scope.cargarAhorros()
    .then(() => $scope.generarCards())
    .catch(() => $scope.generarCards());

  $scope.cargarPropietarios();
});
