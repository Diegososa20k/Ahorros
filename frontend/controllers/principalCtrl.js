angular.module('ahorrosApp')

.controller("principalCtrl", function($scope, $http, API_URL, ahorroFactory) {

    $scope.periodoSeleccionado = "anio";
    $scope.anioSeleccionado = null;
    let grafica = null;

    $scope.listaOriginal = [];
    $scope.ultimosMovimientos = [];

    $scope.resumen = {
        totalIngresos: 0,
        totalGastos: 0,
        balance: 0
    };

    $scope.aniosDisponibles = [];

    // ---- Cargar datos ----
    function cargarDatos() {
        ahorroFactory.query().$promise
        .then(function(resp) {

            const lista = resp.data || [];
            $scope.listaOriginal = lista;

            $scope.datosGrafica = lista.map(a => ({
                cantidad: Number(a.cantidad_ahorro),
                fecha: a.fecha_ahorro,
                descripcion: a.descripcion || "",
                tipo: Number(a.cantidad_ahorro) >= 0 ? "Ingreso" : "Gasto",
                es_transferencia: !!a.es_transferencia
            }));

            $scope.ultimosMovimientos = $scope.datosGrafica
                .slice()
                .sort((a,b) => new Date(b.fecha) - new Date(a.fecha))
                .slice(0, 10);

            const setAnios = new Set();
            lista.forEach(x => {
                const y = new Date(x.fecha_ahorro).getFullYear();
                setAnios.add(y);
            });
            $scope.aniosDisponibles = Array.from(setAnios).sort((a,b) => b - a);

            if (!$scope.anioSeleccionado) {
                $scope.anioSeleccionado = ($scope.aniosDisponibles.length ? $scope.aniosDisponibles[0] : (new Date()).getFullYear());
            }

            procesarResumen(lista);
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
            if (x.es_transferencia) return;

            const cantidad = Number(x.cantidad_ahorro) || 0;
            if (cantidad > 0) ingresos += cantidad;
            else gastos += Math.abs(cantidad);
        });

        $scope.resumen.totalIngresos = ingresos;
        $scope.resumen.totalGastos = gastos;
        $scope.resumen.balance = ingresos - gastos;
    }

    // ---- Filtro por periodo ----
    function filtrarPorPeriodo(lista) {
        const periodo = $scope.periodoSeleccionado;
        const anioSel = Number($scope.anioSeleccionado);
        const hoy = new Date();
        const mesActual = hoy.getMonth();

        if (periodo === "anio") {
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
            inicioSemana.setDate(hoyFecha.getDate() - hoyFecha.getDay() + 1);
            const finSemana = new Date(inicioSemana);
            finSemana.setDate(inicioSemana.getDate() + 6);

            return lista.filter(x => {
                const f = new Date(x.fecha_ahorro);
                return f.getFullYear() === anioSel && f >= inicioSemana && f <= finSemana;
            });
        }

        return lista;
    }

    // ---- Procesar gráfica con estilo mejorado ----
    function procesarGrafica(listaOriginal) {

        const lista = filtrarPorPeriodo(listaOriginal);
        const periodo = $scope.periodoSeleccionado;
        const anioSel = Number($scope.anioSeleccionado);
        let labels = [];
        let ingresos = [];
        let gastos = [];

        if (periodo === "anio" || periodo === "todos") {
            labels = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
            ingresos = Array(12).fill(0);
            gastos = Array(12).fill(0);

            lista.forEach(x => {
                if (x.es_transferencia) return;
                const f = new Date(x.fecha_ahorro);
                const mes = f.getMonth();
                const cantidad = Number(x.cantidad_ahorro) || 0;
                if (cantidad > 0) ingresos[mes] += cantidad;
                else gastos[mes] += Math.abs(cantidad);
            });
        }
        else if (periodo === "mes") {
            labels = ["Semana 1","Semana 2","Semana 3","Semana 4","Semana 5"];
            ingresos = Array(5).fill(0);
            gastos = Array(5).fill(0);

            lista.forEach(x => {
                if (x.es_transferencia) return;
                const f = new Date(x.fecha_ahorro);
                const dia = f.getDate();
                const semanaIndex = Math.min(4, Math.floor((dia - 1) / 7));
                const cantidad = Number(x.cantidad_ahorro) || 0;
                if (cantidad > 0) ingresos[semanaIndex] += cantidad;
                else gastos[semanaIndex] += Math.abs(cantidad);
            });
        }
        else if (periodo === "semana") {
            labels = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
            ingresos = Array(7).fill(0);
            gastos = Array(7).fill(0);

            const hoy = new Date();
            const inicioSemana = new Date(hoy);
            inicioSemana.setDate(hoy.getDate() - (hoy.getDay() === 0 ? 6 : hoy.getDay() - 1));
            const finSemana = new Date(inicioSemana);
            finSemana.setDate(inicioSemana.getDate() + 6);

            lista.forEach(x => {
                if (x.es_transferencia) return;
                const f = new Date(x.fecha_ahorro);
                if (f < inicioSemana || f > finSemana) return;
                if (f.getFullYear() !== anioSel) return;

                const dia = f.getDay();
                const index = dia === 0 ? 6 : dia - 1;
                const cantidad = Number(x.cantidad_ahorro) || 0;
                if (cantidad > 0) ingresos[index] += cantidad;
                else gastos[index] += Math.abs(cantidad);
            });
        }

        // 🎨 Renderizar con estilo moderno
        const ctx = document.getElementById('graficaIngresosGastos');
        if (grafica) grafica.destroy();

        grafica = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Ingresos',
                        data: ingresos,
                        backgroundColor: 'rgba(87, 199, 133, 0.8)',
                        borderColor: 'rgba(87, 199, 133, 1)',
                        borderWidth: 2,
                        borderRadius: 8,
                        hoverBackgroundColor: 'rgba(87, 199, 133, 1)',
                    },
                    {
                        label: 'Gastos',
                        data: gastos,
                        backgroundColor: 'rgba(239, 71, 111, 0.8)',
                        borderColor: 'rgba(239, 71, 111, 1)',
                        borderWidth: 2,
                        borderRadius: 8,
                        hoverBackgroundColor: 'rgba(239, 71, 111, 1)',
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 13,
                                weight: '600',
                                family: "'Inter', 'Segoe UI', sans-serif"
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(13, 59, 79, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        padding: 12,
                        borderColor: 'rgba(21, 152, 149, 0.5)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += '$' + context.parsed.y.toLocaleString('es-MX', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 12,
                                weight: '500'
                            },
                            color: '#6b7280'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                size: 12,
                                weight: '500'
                            },
                            color: '#6b7280',
                            callback: function(value) {
                                return '$' + value.toLocaleString('es-MX');
                            }
                        }
                    }
                },
                animation: {
                    duration: 800,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    $scope.actualizarGrafica = function() {
        procesarGrafica($scope.listaOriginal);
    };

    cargarDatos();

});