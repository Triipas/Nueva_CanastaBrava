// public/js/crudAPI.js

window.crudAPI = {
  get modoEdicionActivo() {
    return window.crudUI.modoEdicionActivo;
  },
  get modoEliminacionActivo() {
    return window.crudUI.modoEliminacionActivo;
  },
  get filaSeleccionada() {
    return window.crudUI.filaSeleccionada;
  },
  set filaSeleccionada(value) {
    window.crudUI.filaSeleccionada = value;
  },
  cancelarModo: () => window.crudUI.cancelarModo(),

  inicializarControlesGlobales(recargarCallback, editarCallback, eliminarCallback) {
    document.getElementById("btn-editar-global").addEventListener("click", () => {
      window.crudUI.activarModoEdicion();
    });

    document.getElementById("btn-eliminar-global").addEventListener("click", () => {
      window.crudUI.activarModoEliminacion();
    });

    document.getElementById("boton-cancelar-modo-container").innerHTML = '';
    window.crudUI.cancelarModo = () => {
      // reescribir función con lógica inyectada
      window.crudUI.modoEdicionActivo = false;
      window.crudUI.modoEliminacionActivo = false;
      window.crudUI.filaSeleccionada = null;
      window.crudUI.activarBotonesGlobales();
      document.getElementById("boton-cancelar-modo-container").innerHTML = '';
      if (recargarCallback) recargarCallback();
    };

    // asigna callbacks a los botones
    window.crudUI.activarModoEdicion = () => {
      if (window.crudUI.modoEdicionActivo) return;
      window.crudUI.modoEdicionActivo = true;
      window.crudUI.desactivarBotonesGlobales();
      window.crudUI.mostrarBotonCancelarModo();
      alert("Haz clic en una fila para editarla.");
      if (editarCallback) editarCallback();
    };

    window.crudUI.activarModoEliminacion = () => {
      if (window.crudUI.modoEliminacionActivo) return;
      window.crudUI.modoEliminacionActivo = true;
      window.crudUI.desactivarBotonesGlobales();
      window.crudUI.mostrarBotonCancelarModo();
      alert("Haz clic en una fila para eliminarla.");
      if (eliminarCallback) eliminarCallback();
    };
  }
};
