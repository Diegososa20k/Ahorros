angular.module('ahorrosApp')

.controller('controlDeudaCtrl', function($scope, controlDeudaFactory, $uibModal, propietarioUnicoFactory, Alertas) {

    $scope.deuda = {};
    $scope.deudas = [];
    $scope.propietarios = [];

    // Cargar todas las deudas
    $scope.cargarDeudas = function() {
        controlDeudaFactory.query().$promise.then(function(response) {
            $scope.deudas = response; // el backend devuelve lista directa

             // Inicializar acordeón cerrado para cada deuda
        $scope.deudas.forEach(d => d._abierto = false);
        });
    };

    $scope.cargarDeudas(); // carga al entrar




    // Cargar propietarios
    $scope.cargarPropietarios = function() {
        propietarioUnicoFactory.query().$promise.then(function(response) {
            $scope.propietarios = response;
        });
    };
    $scope.cargarPropietarios();

    // Guardar nueva deuda
    $scope.guardarDeuda = function() {

        // Validación básica (si deseas agregar más, dime y lo hago)
    

        controlDeudaFactory.save($scope.deuda).$promise
            .then(response => {

            if (!response || !response.success) {
                return Alertas.error(
                "Error",
                response.message || "No se pudo guardar la deuda."
                );
            }

            Alertas.success(
                "Guardado",
                "La deuda fue registrada correctamente."
            );

            $scope.deuda = {};      // limpiar formulario
            $scope.cargarDeudas();  // refrescar tabla
            })
            .catch(err => {
            console.error("Error al guardar deuda:", err);

            Alertas.error(
                "Error",
                "Ocurrió un error al intentar guardar la deuda."
            );
            });
    };




    // Filtros por columna
    $scope.filtroDeuda = {
        propietario: "",
        nombre: "",
        descripcion: ""
    };

    // Función para filtrar
    $scope.filtrarDeudas = function (d) {

        // 📌 Propietario (usa el propietario de la PRIMER mensualidad)
        if ($scope.filtroDeuda.propietario &&
            !d.control_mensualidad[0].propietario_nombre.toLowerCase()
                .includes($scope.filtroDeuda.propietario.toLowerCase())) {
            return false;
        }

        // 📌 Nombre
        if ($scope.filtroDeuda.nombre &&
            !d.nombre.toLowerCase().includes($scope.filtroDeuda.nombre.toLowerCase())) {
            return false;
        }

        // 📌 Descripción
        if ($scope.filtroDeuda.descripcion &&
            !d.descripcion.toLowerCase().includes($scope.filtroDeuda.descripcion.toLowerCase())) {
            return false;
        }

        return true;
    };

    // Limpiar filtros
    $scope.limpiarFiltros = function() {
        $scope.filtroDeuda = {
            propietario: "",
            nombre: "",
            descripcion: ""
        };
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

        Alertas.confirm(
            "¿Eliminar esta deuda?",
            "Esta acción no se puede deshacer."
        )
        .then(result => {

            if (!result.isConfirmed) return; // Si cancela → no hace nada

            return controlDeudaFactory.delete({ id }).$promise;
        })
        .then(response => {

            if (!response || !response.success) {
            return Alertas.error("Error", "No se pudo eliminar la deuda.");
            }

            Alertas.success("Eliminada", "La deuda fue eliminada correctamente.");
            $scope.cargarDeudas();
        })
        .catch(err => {
            if (!err) return; // cancelación, no mostrar error
            console.error(err);
            Alertas.error("Error", "Ocurrió un error al eliminar la deuda.");
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


    $scope.cancelar = () => $uibModalInstance.dismiss('cancel');

    $scope.tieneRojo = function (d) {
        return d.control_mensualidad.some(m =>
            !m.pagado_mensualidades &&
            $scope.diasRestantes(m.fecha_pago) <= 5
        );
    };

    $scope.tieneNaranja = function (d) {
        return d.control_mensualidad.some(m =>
            !m.pagado_mensualidades &&
            $scope.diasRestantes(m.fecha_pago) <= 10 &&
            $scope.diasRestantes(m.fecha_pago) > 5
        );
    };



})



.controller('abonoModalCtrl', function($scope, $uibModalInstance, controlDeudaFactory, deuda, mensualidad, Alertas) {

    $scope.abono = "";

    $scope.guardarAbono = function() {

        if ($scope.abono <= 0) {
            return Alertas.warning(
            "Cantidad inválida",
            "La cantidad del abono debe ser mayor a cero."
            );
        }

        controlDeudaFactory.abonar(
            { id: deuda.id },
            { mensualidad: mensualidad.mensualidad, cantidad: $scope.abono }
        ).$promise
            .then(response => {

            if (!response || !response.success) {
                return Alertas.error(
                "Error",
                "No se pudo registrar el abono."
                );
            }

            Alertas.success(
                "Guardado",
                "El abono fue registrado correctamente."
            );

            $uibModalInstance.close(true);
            })
            .catch(err => {
            console.error("Error al registrar abono:", err);

            Alertas.error(
                "Error",
                "Ocurrió un problema al guardar el abono."
            );
            });
    };


    $scope.cancelar = function() {
        $uibModalInstance.dismiss('cancel');
    };

});
