
angular.module('ahorrosApp')

.controller("principalCtrl", function($scope, $http, API_URL, ahorroFactory) {

    $scope.periodoSeleccionado = "anio"; // por defecto
    $scope.anioSeleccionado = null;      // se ajusta después de cargar datos
    let grafica = null;

    // Datos originales de backend (SIN modificar)
    $scope.listaOriginal = [];

    // Datos para tabla/movimientos
    $scope.ultimosMovimientos = [];

    $scope.resumen = {
        totalIngresos: 0,
        totalGastos: 0,
        balance: 0
    };

    // años disponibles (para el select)
    $scope.aniosDisponibles = [];

    // ---- Cargar datos ----
    function cargarDatos() {
        ahorroFactory.query().$promise
        .then(function(resp) {

            const lista = resp.data || [];

            // Guardamos la lista original
            $scope.listaOriginal = lista;

            // construir datos transformados (asegurando numbers)
            // NOTA: incluimos es_transferencia para poder usarlo luego
            $scope.datosGrafica = lista.map(a => ({
                cantidad: Number(a.cantidad_ahorro),
                fecha: a.fecha_ahorro,
                descripcion: a.descripcion || "",
                tipo: Number(a.cantidad_ahorro) >= 0 ? "Ingreso" : "Gasto",
                es_transferencia: !!a.es_transferencia
            }));

            // Mostrar últimos movimientos (los 10 más recientes) -> dejamos transferencias visibles
            $scope.ultimosMovimientos = $scope.datosGrafica
                .slice()
                .sort((a,b) => new Date(b.fecha) - new Date(a.fecha)) // ordenar descendente por fecha
                .slice(0, 10);

            // poblar selector de años (orden descendente)
            const setAnios = new Set();
            lista.forEach(x => {
                const y = new Date(x.fecha_ahorro).getFullYear();
                setAnios.add(y);
            });
            $scope.aniosDisponibles = Array.from(setAnios).sort((a,b) => b - a);

            // si no hay año seleccionado, usa el más reciente (o el actual)
            if (!$scope.anioSeleccionado) {
                $scope.anioSeleccionado = ($scope.aniosDisponibles.length ? $scope.aniosDisponibles[0] : (new Date()).getFullYear());
            }

            // Calcular totales usando TODOS los registros (pero IGNORANDO transferencias)
            procesarResumen(lista);

            // Crear gráfica (usa listaOriginal)
            procesarGrafica($scope.listaOriginal);
        })
        .catch(err => {
            console.error("Error cargando ahorros:", err);
        });
    }

    // ---- Calcular totales ----
    function procesarResumen(lista) {
        let ingresos = 0;
        let gastos = 0;

        lista.forEach(x => {

            // Ignorar si es transferencia
            if (x.es_transferencia) return;

            const cantidad = Number(x.cantidad_ahorro) || 0;
            if (cantidad > 0) ingresos += cantidad;
            else gastos += Math.abs(cantidad);
        });

        $scope.resumen.totalIngresos = ingresos;
        $scope.resumen.totalGastos = gastos;
        $scope.resumen.balance = ingresos - gastos;
    }

    // ---- Filtro por periodo (usa el año seleccionado cuando corresponda) ----
    function filtrarPorPeriodo(lista) {
        const periodo = $scope.periodoSeleccionado;
        const anioSel = Number($scope.anioSeleccionado);
        const hoy = new Date();
        const mesActual = hoy.getMonth();

        if (periodo === "anio") {
            // solo el año seleccionado
            return lista.filter(x => new Date(x.fecha_ahorro).getFullYear() === anioSel);
        }

        if (periodo === "mes") {
            return lista.filter(x => {
                const f = new Date(x.fecha_ahorro);
                return f.getFullYear() === anioSel && f.getMonth() === mesActual;
            });
        }

        if (periodo === "semana") {
            const hoyFecha = new Date();
            const inicioSemana = new Date(hoyFecha);
            inicioSemana.setDate(hoyFecha.getDate() - hoyFecha.getDay() + 1); // lunes
            const finSemana = new Date(inicioSemana);
            finSemana.setDate(inicioSemana.getDate() + 6);

            return lista.filter(x => {
                const f = new Date(x.fecha_ahorro);
                return f.getFullYear() === anioSel && f >= inicioSemana && f <= finSemana;
            });
        }

        // todos
        return lista;
    }

    // ---- Procesar gráfica dinámicamente según periodo y año seleccionado ----
    function procesarGrafica(listaOriginal) {

        const lista = filtrarPorPeriodo(listaOriginal);
        const periodo = $scope.periodoSeleccionado;
        const anioSel = Number($scope.anioSeleccionado);
        let labels = [];
        let ingresos = [];
        let gastos = [];

        // AÑO -> meses (usa año seleccionado)
        if (periodo === "anio" || periodo === "todos") {
            labels = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
            ingresos = Array(12).fill(0);
            gastos = Array(12).fill(0);

            lista.forEach(x => {
                // ignorar transferencias
                if (x.es_transferencia) return;

                const f = new Date(x.fecha_ahorro);
                const mes = f.getMonth();
                const cantidad = Number(x.cantidad_ahorro) || 0;
                if (cantidad > 0) ingresos[mes] += cantidad;
                else gastos[mes] += Math.abs(cantidad);
            });
        }

        // MES -> semanas del mes seleccionado (semana 1..5)
        else if (periodo === "mes") {
            labels = ["Semana 1","Semana 2","Semana 3","Semana 4","Semana 5"];
            ingresos = Array(5).fill(0);
            gastos = Array(5).fill(0);

            lista.forEach(x => {
                // ignorar transferencias
                if (x.es_transferencia) return;

                const f = new Date(x.fecha_ahorro);
                const dia = f.getDate(); // 1..31
                const semanaIndex = Math.min(4, Math.floor((dia - 1) / 7)); // 0..4
                const cantidad = Number(x.cantidad_ahorro) || 0;
                if (cantidad > 0) ingresos[semanaIndex] += cantidad;
                else gastos[semanaIndex] += Math.abs(cantidad);
            });
        }

        // SEMANA -> dias Lun..Dom
        else if (periodo === "semana") {
            labels = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
            ingresos = Array(7).fill(0);
            gastos = Array(7).fill(0);

            const hoy = new Date();
            const inicioSemana = new Date(hoy);
            inicioSemana.setDate(hoy.getDate() - (hoy.getDay() === 0 ? 6 : hoy.getDay() - 1)); // lunes
            const finSemana = new Date(inicioSemana);
            finSemana.setDate(inicioSemana.getDate() + 6);

            lista.forEach(x => {
                // ignorar transferencias
                if (x.es_transferencia) return;

                const f = new Date(x.fecha_ahorro);
                if (f < inicioSemana || f > finSemana) return;
                if (f.getFullYear() !== anioSel) return;

                const dia = f.getDay(); // 0 dom .. 6 sab
                const index = dia === 0 ? 6 : dia - 1; // lunes=0
                const cantidad = Number(x.cantidad_ahorro) || 0;
                if (cantidad > 0) ingresos[index] += cantidad;
                else gastos[index] += Math.abs(cantidad);
            });
        }

        // renderizar
        const ctx = document.getElementById('graficaIngresosGastos');
        if (grafica) grafica.destroy();

        grafica = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Ingresos', data: ingresos, backgroundColor: "rgba(40,167,69,0.6)" },
                    { label: 'Gastos', data: gastos, backgroundColor: "rgba(220,53,69,0.6)" }
                ]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true } }
            }
        });
    }

    // ---- Evento del select ----
    $scope.actualizarGrafica = function() {
        procesarGrafica($scope.listaOriginal);
    };

    // ---- Ejecutar al iniciar ----
    cargarDatos();

});

