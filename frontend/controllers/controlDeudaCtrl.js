angular.module('ahorrosApp')

.controller('controlDeudaCtrl', function($scope, controlDeudaFactory, $uibModal) {

    $scope.deuda = {};
    $scope.deudas = [];

    // Cargar todas las deudas
    $scope.cargarDeudas = function() {
        controlDeudaFactory.query().$promise.then(function(response) {
            $scope.deudas = response; // el backend devuelve lista directa

             // Inicializar acordeón cerrado para cada deuda
        $scope.deudas.forEach(d => d._abierto = false);
        });
    };

    $scope.cargarDeudas(); // carga al entrar

    // Guardar nueva deuda
    $scope.guardarDeuda = function() {

        controlDeudaFactory.save($scope.deuda).$promise.then(function(response) {
            if (response.success) {
                alert("Deuda guardada correctamente");
                $scope.deuda = {};
                $scope.cargarDeudas(); // recargar tabla
            } else {
                alert("Error: " + response.message);
            }
        });
    };

//     $scope.marcarPagado = function(d) {
//     controlDeudaFactory.pagar({ id: d.id }, { pagado: d.pagado }).$promise.then(function() {
//         $scope.cargarDeudas();
//     });
// };




$scope.marcarMensualidadPagada = function(deuda, mensualidad) {

    controlDeudaFactory.pagarMensualidad(
        { id: deuda.id },
        {
            mensualidad: mensualidad.mensualidad,
            pagado: mensualidad.pagado_mensualidades
        }
    ).$promise.then(function(response) {

        if (!response.success) {
            alert("Error al actualizar mensualidad");
            return;
        }

        const nuevaDeuda = response.data;

        // Buscar la mensualidad actualizada en la respuesta
        const mensualidadActualizada = nuevaDeuda.control_mensualidad.find(
            m => m.mensualidad == mensualidad.mensualidad
        );

        if (mensualidadActualizada) {
            // Actualizar localmente para reflejar el cambio sin recargar
            mensualidad.pagado_mensualidades = mensualidadActualizada.pagado_mensualidades;
        }

        // Si TODAS las mensualidades están pagadas → marcar deuda como pagada
        deuda.pagado = nuevaDeuda.pagado;

    });
};




$scope.eliminarDeuda = function(id) {
    if (!confirm("¿Seguro que deseas eliminar esta deuda?")) return;

    controlDeudaFactory.delete({ id: id }).$promise.then(function(response) {
        if (response.success) {
            $scope.cargarDeudas();
        } else {
            alert("Error al eliminar");
        }
    });
};






$scope.abrirModalAbono = function(deuda, mensualidad) {

    var modalInstance = $uibModal.open({
        templateUrl: '/frontend/views/control_deuda/modal/abono.html',
        controller: 'abonoModalCtrl',
        size: 'sm',
        resolve: {
            deuda: () => deuda,
            mensualidad: () => mensualidad
        }
    });

    modalInstance.result.then(function(recargado) {
        if (recargado) {
            $scope.cargarDeudas();
        }
    });
};


$scope.diasRestantes = function(fechaPago) {
    if (!fechaPago) return 9999;

    const hoy = new Date();
    const fecha = new Date(fechaPago);

    // Diferencia en milisegundos
    const diffTime = fecha - hoy;

    // Convertir a días
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
};


})



.controller('abonoModalCtrl', function($scope, $uibModalInstance, controlDeudaFactory, deuda, mensualidad) {

    $scope.abono = 0;

    $scope.guardarAbono = function() {

        if ($scope.abono <= 0) {
            alert("Cantidad inválida");
            return;
        }

        controlDeudaFactory.abonar(
            { id: deuda.id },
            { mensualidad: mensualidad.mensualidad, cantidad: $scope.abono }
        ).$promise.then(function(response) {
            if (response.success) {
                alert("Abono registrado correctamente");
                $uibModalInstance.close(true);
            } else {
                alert("Error al abonar");
            }
        });
    };

    $scope.cancelar = function() {
        $uibModalInstance.dismiss('cancel');
    };

});
