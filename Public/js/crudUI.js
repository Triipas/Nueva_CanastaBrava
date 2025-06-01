let modoEdicionActivo = false;
let modoEliminacionActivo = false;
let filaSeleccionada = null;

function activarModoEdicion(callback) {
  if (modoEdicionActivo) return;
  modoEdicionActivo = true;
  desactivarBotonesGlobales();
  mostrarBotonCancelarModo();
  alert("Haz clic en una fila para editarla.");
  if (callback) callback();
}

function activarModoEliminacion(callback) {
  if (modoEliminacionActivo) return;
  modoEliminacionActivo = true;
  desactivarBotonesGlobales();
  mostrarBotonCancelarModo();
  alert("Haz clic en una fila para eliminarla.");
  if (callback) callback();
}

function cancelarModo(recargarCallback) {
  modoEdicionActivo = false;
  modoEliminacionActivo = false;
  filaSeleccionada = null;
  activarBotonesGlobales();
  document.getElementById("boton-cancelar-modo-container").innerHTML = '';
  if (recargarCallback) recargarCallback();
}

function mostrarBotonCancelarModo() {
  const container = document.getElementById("boton-cancelar-modo-container");
  container.innerHTML = `<button id="btn-cancelar-modo">❌ Cancelar modo</button>`;
  document.getElementById("btn-cancelar-modo").addEventListener("click", () => cancelarModo());
}

function desactivarBotonesGlobales() {
  document.getElementById("btn-editar-global").disabled = true;
  document.getElementById("btn-eliminar-global").disabled = true;
}

function activarBotonesGlobales() {
  document.getElementById("btn-editar-global").disabled = false;
  document.getElementById("btn-eliminar-global").disabled = false;
}

window.crudUI = {
  activarModoEdicion,
  activarModoEliminacion,
  cancelarModo,
  mostrarBotonCancelarModo,
  activarBotonesGlobales,
  desactivarBotonesGlobales,
  get modoEdicionActivo() { return modoEdicionActivo; },
  get modoEliminacionActivo() { return modoEliminacionActivo; },
  get filaSeleccionada() { return filaSeleccionada; },
  set filaSeleccionada(value) { filaSeleccionada = value; }
};
