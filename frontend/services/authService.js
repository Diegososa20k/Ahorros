angular.module('ahorrosApp')
.factory('authService', function($http, $window) {

  const API = "http://localhost:5001/api/auth";

  return {

    login(data) {
      return $http.post(API + "/login", data)
        .then(res => {
          if (res.data.ok && res.data.token) {
            $window.localStorage.setItem("token", res.data.token);
            $window.localStorage.setItem("usuario", JSON.stringify(res.data.usuario));
          }
          return res.data;
        });
    },

    register(data) {
      return $http.post(API + "/register", data);
    },

    logout() {
      $window.localStorage.removeItem("token");
      $window.localStorage.removeItem("usuario");
       return true; // opcional, para confirmar
    },

    obtenerUsuario() {
      return JSON.parse($window.localStorage.getItem("usuario") || "{}");
    },

    obtenerToken() {
      return $window.localStorage.getItem("token");
    },

    estaLogueado() {
      return !!$window.localStorage.getItem("token");
    }
  };
});
