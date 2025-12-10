angular.module('ahorrosApp')
.controller('loginCtrl', function($scope, $rootScope, $state, authService) {
  $scope.form = {};
  $scope.error = null;

  $scope.login = function() {
    authService.login($scope.form)
      .then(function(res) {
        if (!res.ok) {
          $scope.error = res.err || "Credenciales incorrectas";
          return;
        }

        // Guardar token y usuario en localStorage
        if (res.token) {
          localStorage.setItem("token", res.token);
          localStorage.setItem("usuario", JSON.stringify(res.usuario));
        }

        // Activar layout
        $rootScope.mostrarLayout = true;

        // Redirigir a principal
        $state.go("principal");
      })
      .catch(function() {
        $scope.error = "Error al conectar con el servidor";
      });
  };
});
