angular.module('ahorrosApp')
.controller('registerCtrl', function($scope, $state, authService, $timeout) {
  $scope.form = {};
  $scope.error = null;
  $scope.success = null;
  $scope.registrando = false;

  $scope.register = function() {
    // Validar que las contraseñas coincidan
    if ($scope.form.password !== $scope.form.password2) {
      $scope.error = "Las contraseñas no coinciden";
      return;
    }

    // Validar longitud mínima
    if ($scope.form.password.length < 6) {
      $scope.error = "La contraseña debe tener al menos 6 caracteres";
      return;
    }

    $scope.registrando = true;
    $scope.error = null;

    authService.register($scope.form)
      .then(function(res) {
        if (!res.data.ok) {
          $scope.error = res.data.err || "Error al registrar usuario";
          $scope.registrando = false;
          return;
        }

        // Mostrar mensaje de éxito
        $scope.success = "¡Cuenta creada exitosamente! Redirigiendo al login...";
        
        // Redirigir al login después de 2 segundos
        $timeout(function() {
          $state.go("login");
        }, 2000);
      })
      .catch(function(err) {
        console.error(err);
        $scope.error = err.data?.err || "Error al conectar con el servidor";
        $scope.registrando = false;
      });
  };
});