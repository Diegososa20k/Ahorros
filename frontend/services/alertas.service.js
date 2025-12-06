angular.module('ahorrosApp')

.factory('Alertas', function() {

  return {

    success: function(title, text) {
      Swal.fire({
        icon: 'success',
        title: title,
        text: text,
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: 'swal-grande'
        }
      });
    },

    warning: function(title, text) {
      Swal.fire({
        icon: 'warning',
        title: title,
        text: text,
        confirmButtonText: 'Aceptar',
        customClass: {
          popup: 'swal-grande'
        }
      });
    },

    error: function(title, text) {
      Swal.fire({
        icon: 'error',
        title: title,
        text: text,
        confirmButtonText: 'Cerrar',
        customClass: {
          popup: 'swal-grande'
        }
      });
    },

    confirm: function(title, text) {
      return Swal.fire({
        icon: 'warning',
        title: title,
        text: text,
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No',
        customClass: {
          popup: 'swal-grande'
        }
      });
    }

  };

});
