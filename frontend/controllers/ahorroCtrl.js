angular.module('ahorrosApp')
.controller('ahorroCtrl', function($scope, ahorroFactory, propietarioFactory, $http, API_URL, $uibModal, propietarioUnicoUbicacionesFactory) {

  $scope.ahorros = [];
  $scope.propietarios = [];
  $scope.ubicacionesFiltradas = [];
  $scope.cajitasPropietario = [];
  $scope.mostrarCajitas = false;
  $scope.nuevoAhorro = {fecha_ahorro: new Date()};
  $scope.pestanaActiva = "ahorros";
  
$scope.filtro = {
  ubicacion: "",
  propietario: "",
  cajita: ""
};

$scope.filtrarTabla = function(item) {
  // Ubicación
  if ($scope.filtro.ubicacion &&
      !item.ubicacion.nombre.toLowerCase().includes($scope.filtro.ubicacion.toLowerCase())) {
    return false;
  }

  // Propietario
  if ($scope.filtro.propietario &&
      !item.propietario.nombre.toLowerCase().includes($scope.filtro.propietario.toLowerCase())) {
    return false;
  }

  // Cajita
  if ($scope.filtro.cajita &&
      !(item.cajita_subcuenta || "").toLowerCase().includes($scope.filtro.cajita.toLowerCase())) {
    return false;
  }

  return true;
};


  $scope.ahorrosPositivos = function () {
  return $scope.ahorros.filter(a => a.cantidad_ahorro > 0);
};

$scope.ahorrosNegativos = function () {
  return $scope.ahorros.filter(a => a.cantidad_ahorro < 0);
};


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
    propietarioUnicoUbicacionesFactory
      .ubicaciones(nuevoValor)
      .then(resp => {
        $scope.ubicacionesFiltradas = resp.data || resp; 
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
    propietarioUnicoUbicacionesFactory
      .cajitas(propietarioId, ubicacionId)
      .then(resp => {
        $scope.cajitasPropietario = resp.data || resp;
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

$scope.abrirModalGasto = function() {

  var modalInstance = $uibModal.open({
    templateUrl: '/frontend/views/ahorro/modal/gastos.html',
    controller: 'gastoModalCtrl',
    size: 'md',
    resolve: {
      propietarios: () => $scope.propietarios
    }
  });

  modalInstance.result.then(function() {
    $scope.cargarAhorros().then($scope.generarCards);
  });
};

$scope.abrirModalTransferencia = function () {

  var modalInstance = $uibModal.open({
    templateUrl: '/frontend/views/ahorro/modal/transferencia_cuentas_propia.html',
    controller: 'transferenciaModalCtrl',
    size: 'lg'
  });

  modalInstance.result.then(function () {
    $scope.cargarAhorros().then($scope.generarCards);
  });

};


})


.controller('gastoModalCtrl', function(
  $scope, $http, API_URL,
  $uibModalInstance, propietarios, propietarioUnicoUbicacionesFactory, ahorroFactory
) {

  $scope.propietarios = propietarios;
  $scope.ubicacionesFiltradas = [];
  $scope.cajitasPropietarioGasto = [];
  $scope.mostrarCajitasGasto = false;

  $scope.nuevoGasto = {
    fecha_gasto: new Date()
  };

  // Cambia propietario → cargar ubicaciones
$scope.$watch('nuevoGasto.propietario_id', function(id) {
  if (!id) return;

  propietarioUnicoUbicacionesFactory
    .ubicaciones(id)
    .then(resp => {
      $scope.ubicacionesFiltradas = resp.data;
      $scope.nuevoGasto.ubicacion_id = '';
      $scope.mostrarCajitasGasto = false;
    });
});


  // Cambia ubicación → cargar cajitas
  $scope.$watch('nuevoGasto.ubicacion_id', function(u) {
    if (!u || !$scope.nuevoGasto.propietario_id) return;

    propietarioUnicoUbicacionesFactory
  .cajitas($scope.nuevoGasto.propietario_id, u)
  .then(resp => {
    $scope.cajitasPropietarioGasto = resp.data || resp;
    $scope.mostrarCajitasGasto = true;
  })
  });

  // Guardar gasto
  $scope.guardarGasto = function() {
    const data = {
        cantidad_ahorro: $scope.nuevoGasto.cantidad_gasto * -1,
        fecha_ahorro: $scope.nuevoGasto.fecha_gasto,
        descripcion: $scope.nuevoGasto.descripcion,
        ubicacion_id: $scope.nuevoGasto.ubicacion_id,
        propietario_id: $scope.nuevoGasto.propietario_id,
        cajita_subcuenta: $scope.nuevoGasto.cajita_subcuenta
    };

    ahorroFactory.save(data).$promise
  .then(() => {

        alert("Gasto registrado correctamente");
        $uibModalInstance.close();
      });
};





  $scope.cancelar = () => $uibModalInstance.dismiss('cancel');
})


.controller('transferenciaModalCtrl', function(
  $scope, $uibModalInstance,
  propietarioFactory,
  propietarioUnicoUbicacionesFactory,
  ahorroFactory
) {

  // ============================
  //   MODELO
  // ============================
  $scope.data = {
    origen: {
      propietario_id: "",
      ubicacion_id: "",
      cajita: "",
      descripcion: "",
      cantidad: null
    },
    destino: {
      propietario_id: "",
      ubicacion_id: "",
      cajita: ""
    }
  };

  $scope.propietarios = [];
  $scope.ubicacionesOrigen = [];
  $scope.ubicacionesDestino = [];
  $scope.cajitasOrigen = [];
  $scope.cajitasDestino = [];

  // ============================
  //   CARGAR PROPIETARIOS
  // ============================
  propietarioFactory.query().$promise.then(function(data) {

    const owners = [];
    const ids = new Set();

    data.forEach(item => {
      const ownerId = item.propietario_id;
      const ownerName = item.propietario_unico?.nombre;

      if (!ids.has(ownerId)) {
        ids.add(ownerId);
        owners.push({
          id: ownerId,
          nombre: ownerName
        });
      }
    });

    $scope.propietarios = owners;
  });


  // ============================
  //   WATCH ORIGEN → PROPIETARIO
  // ============================
  $scope.$watch('data.origen.propietario_id', function(id) {
    if (!id) return;

    propietarioUnicoUbicacionesFactory.ubicaciones(id)
      .then(resp => {
        $scope.ubicacionesOrigen = resp.data || resp;
        $scope.data.origen.ubicacion_id = "";
        $scope.cajitasOrigen = [];
        $scope.saldoOrigen = 0;   // limpiar saldo
      });
  });

  // ============================
  //   WATCH ORIGEN → UBICACION
  // ============================
  $scope.$watch('data.origen.ubicacion_id', function(uid) {
    if (!uid || !$scope.data.origen.propietario_id) return;

    // 1️⃣ Cargar cajitas
    propietarioUnicoUbicacionesFactory.cajitas(
      $scope.data.origen.propietario_id,
      uid
    ).then(resp => {
      $scope.cajitasOrigen = resp.data || resp;
      $scope.data.origen.cajita = "";
    });

    // 2️⃣ Cargar TODOS los movimientos de esa ubicacion
    ahorroFactory.query({
      propietario_id: $scope.data.origen.propietario_id,
      ubicacion_id: uid
    }).$promise.then(function(resp) {

      const all = resp.data || resp;

      // 3️⃣ Filtrar por propietario y ubicacion (por si el backend devuelve más)
      const filtrados = all.filter(x =>
        x.propietario_id == $scope.data.origen.propietario_id &&
        x.ubicacion_id == uid
      );

      $scope.ahorrosOrigen = filtrados;

      // 4️⃣ Calcular saldo total
      $scope.saldoOrigenUbicacion = filtrados.reduce(
  (sum, item) => sum + parseFloat(item.cantidad_ahorro),
  0
);

// limpiar saldo de cajita
$scope.saldoOrigenCajita = undefined;

    });
  });

  // ============================
  //   WATCH ORIGEN → CAJITA
  //     (Para mostrar saldo solo de esa cajita)
  // ============================
  $scope.$watch('data.origen.cajita', function(cajita) {
  if (!cajita || !$scope.ahorrosOrigen) {
    $scope.saldoOrigenCajita = undefined;
    return;
  }

  const filtrados = $scope.ahorrosOrigen.filter(x =>
    x.cajita_subcuenta === cajita
  );

  $scope.saldoOrigenCajita = filtrados.reduce(
    (sum, item) => sum + parseFloat(item.cantidad_ahorro),
    0
  );
});



  // ============================
  //   WATCH DESTINO
  // ============================
// ============================
//   WATCH DESTINO → PROPIETARIO
// ============================
$scope.$watch('data.destino.propietario_id', function(id) {
  if (!id) return;

  propietarioUnicoUbicacionesFactory.ubicaciones(id)
    .then(resp => {
      $scope.ubicacionesDestino = resp.data || resp;
      $scope.data.destino.ubicacion_id = "";
      $scope.cajitasDestino = [];
      $scope.saldoDestinoUbicacion = 0;
      $scope.saldoDestinoCajita = undefined;
    });
});

// ============================
//   WATCH DESTINO → UBICACION
// ============================
$scope.$watch('data.destino.ubicacion_id', function(uid) {
  if (!uid || !$scope.data.destino.propietario_id) return;

  // 1️⃣ Cargar cajitas
  propietarioUnicoUbicacionesFactory.cajitas(
    $scope.data.destino.propietario_id,
    uid
  ).then(resp => {
    $scope.cajitasDestino = resp.data || resp;
    $scope.data.destino.cajita = "";
  });

  // 2️⃣ Cargar movimientos de esa ubicación
  ahorroFactory.query({
    propietario_id: $scope.data.destino.propietario_id,
    ubicacion_id: uid
  }).$promise.then(function(resp) {

    const all = resp.data || resp;

    const filtrados = all.filter(x =>
      x.propietario_id == $scope.data.destino.propietario_id &&
      x.ubicacion_id == uid
    );

    $scope.ahorrosDestino = filtrados;

    // 3️⃣ Saldo total de la ubicación
    $scope.saldoDestinoUbicacion = filtrados.reduce(
      (sum, x) => sum + parseFloat(x.cantidad_ahorro),
      0
    );

    // Limpiar saldo de cajita
    $scope.saldoDestinoCajita = undefined;
  });
});

// ============================
//   WATCH DESTINO → CAJITA
// ============================
$scope.$watch('data.destino.cajita', function(cajita) {
  if (!cajita || !$scope.ahorrosDestino) {
    $scope.saldoDestinoCajita = undefined;
    return;
  }

  const filtrados = $scope.ahorrosDestino.filter(x =>
    x.cajita_subcuenta === cajita
  );

  $scope.saldoDestinoCajita = filtrados.reduce(
    (sum, x) => sum + parseFloat(x.cantidad_ahorro),
    0
  );
});





  // ============================
  //   REALIZAR TRANSFERENCIA
  // ============================
  $scope.transferir = function() {

    const cant = parseFloat($scope.data.origen.cantidad);
    if (!cant || cant <= 0) {
      alert("Cantidad inválida");
      return;
    }

    const gasto = {
      cantidad_ahorro: cant * -1,
      fecha_ahorro: new Date(),
      descripcion: $scope.data.origen.descripcion,
      ubicacion_id: $scope.data.origen.ubicacion_id,
      propietario_id: $scope.data.origen.propietario_id,
      cajita_subcuenta: $scope.data.origen.cajita
    };

    const ahorro = {
      cantidad_ahorro: cant,
      fecha_ahorro: new Date(),
      descripcion: "Transferencia desde otra cuenta",
      ubicacion_id: $scope.data.destino.ubicacion_id,
      propietario_id: $scope.data.destino.propietario_id,
      cajita_subcuenta: $scope.data.destino.cajita
    };

    ahorroFactory.save(gasto).$promise
      .then(() => ahorroFactory.save(ahorro).$promise)
      .then(() => {
        alert("Transferencia realizada correctamente");
        $uibModalInstance.close();
      });
  };

  $scope.cancelar = () => $uibModalInstance.dismiss("cancel");
});
