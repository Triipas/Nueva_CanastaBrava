const configuracionEntidad = {
  productos: {
    nombre: 'productos',
    columnas: [
      { nombre: 'ID_PRODUCTO', tipo: 'id' },
      { nombre: 'NOMBRE_PRODUCTO', tipo: 'texto' },
      { nombre: 'DESCRIPCION', tipo: 'texto' },
      { nombre: 'PRECIO_UNITARIO', tipo: 'numero' },
      { nombre: 'STOCK_ACTUAL', tipo: 'numero' },
      { nombre: 'FECHA_INGRESO', tipo: 'fecha' },
      { nombre: 'ID_CATEGORIA', tipo: 'id' }
    ],
    camposRequeridos: ['ID_PRODUCTO', 'NOMBRE_PRODUCTO']
  }
};

let entidadActiva = 'productos';
let datos = [], paginaActual = 1, filtroColumnaActual = null, filtroValorActual = null, paginasTotales = 1, limite = 10;
let modoEdicionActivo = false, modoEliminacionActivo = false, filaSeleccionada = null;

// === Init: Manejo de eventos al cargar la página ===
document.addEventListener("DOMContentLoaded", () => {
  const { columnas, camposRequeridos } = configuracionEntidad[entidadActiva];

  // Cargar primera página
  obtenerEntidadesPaginadas(1, entidadActiva, columnas);

  // Botones globales
  document.getElementById("btn-editar-global").addEventListener("click", activarModoEdicion);
  document.getElementById("btn-eliminar-global").addEventListener("click", activarModoEliminacion);

  // Botón recargar
  document.getElementById("btn-recargar").addEventListener("click", () => {
    obtenerEntidadesPaginadas(paginaActual, entidadActiva, columnas);
  });

  // Filtro: Mostrar/ocultar inputs según columna seleccionada
  const combobox = document.getElementById("filtro-columna");
  const inputFiltro = document.getElementById("valor-filtro");
  const filtroFechas = document.getElementById("filtro-fechas");

  combobox.addEventListener("change", () => {
    const columnaSeleccionada = combobox.value;
    if (columnaSeleccionada.toUpperCase().includes("FECHA")) {
      filtroFechas.style.display = "inline";
      inputFiltro.style.display = "none";
    } else {
      filtroFechas.style.display = "none";
      inputFiltro.style.display = "inline";
    }
  });

  // Botón aplicar filtro
  document.getElementById("btn-buscar-filtro").addEventListener("click", () => {
    const columnaSeleccionada = combobox.value;
    let valorFiltro = "";

    if (columnaSeleccionada.toUpperCase().includes("FECHA")) {
      const fechaInicio = document.getElementById("fecha-inicio").value;
      const fechaFin = document.getElementById("fecha-fin").value;
      if (!fechaInicio || !fechaFin) {
        alert("Debes seleccionar ambas fechas.");
        return;
      }
      valorFiltro = `${fechaInicio}|${fechaFin}`;
    } else {
      valorFiltro = inputFiltro.value.trim();
    }

    if (!valorFiltro) {
      alert("Debes ingresar un valor para filtrar.");
      return;
    }

    filtroColumnaActual = columnaSeleccionada;
    filtroValorActual = valorFiltro;

    obtenerEntidadesPaginadas(1, entidadActiva, columnas);
  });

  // Botón limpiar filtro
  document.getElementById("btn-limpiar-filtro").addEventListener("click", () => {
    document.getElementById("valor-filtro").value = "";
    document.getElementById("fecha-inicio").value = "";
    document.getElementById("fecha-fin").value = "";
    document.getElementById("mensaje-sin-resultados").style.display = "none";

    filtroColumnaActual = null;
    filtroValorActual = null;

    obtenerEntidadesPaginadas(paginaActual, entidadActiva, columnas);
  });
});

// === Funciones Generales Reutilizables y Escalables ===

// 🔁 Renderiza una tabla para cualquier entidad
function renderizarTabla(idTabla, data, columnas, eventosPorFila = () => {}) {
  const tabla = document.getElementById(idTabla);
  tabla.innerHTML = '';

  data.forEach(fila => {
    const tr = document.createElement('tr');
    tr.dataset.id = fila[columnas[0].nombre];

    if (modoEliminacionActivo) {
      const tdCheckbox = document.createElement('td');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.classList.add('checkbox-eliminar');
      checkbox.dataset.id = fila[columnas[0].nombre];
      tdCheckbox.appendChild(checkbox);
      tr.appendChild(tdCheckbox);
    }

    columnas.forEach(col => {
      const valor = fila[col.nombre];
      const td = document.createElement('td');
      td.textContent = (valor == null) ? '' : 
                       (typeof valor === 'number') ? 
                       (Number.isInteger(valor) ? valor : valor.toFixed(2)) : valor;
      tr.appendChild(td);
    });

    eventosPorFila(tr, fila);
    tabla.appendChild(tr);
  });

  // Encabezado de checkbox si está en modo eliminación
  const thead = document.querySelector("thead tr");
  if (modoEliminacionActivo) {
    if (!thead.querySelector("th.checkbox-header")) {
      const th = document.createElement("th");
      th.textContent = "";
      th.classList.add("checkbox-header");
      thead.insertBefore(th, thead.firstChild);
    }
  } else {
    const thCheckbox = document.querySelector("th.checkbox-header");
    if (thCheckbox) thCheckbox.remove();
  }
}

// 📄 Paginación universal para cualquier entidad
function renderizarPaginacion(pagina, totalPaginas) {
  const contenedor = document.getElementById("paginacion");
  contenedor.innerHTML = "";

  if (totalPaginas <= 1) return;

  const crearBoton = (texto, nuevaPagina, deshabilitado = false) => {
    const btn = document.createElement("button");
    btn.textContent = texto;
    btn.disabled = deshabilitado;
    btn.addEventListener("click", () => {
      const columnas = configuracionEntidad[entidadActiva].columnas;
      obtenerEntidadesPaginadas(nuevaPagina, entidadActiva, columnas);
    });
    return btn;
  };

  contenedor.appendChild(crearBoton("⏮ Primera", 1, pagina === 1));
  contenedor.appendChild(crearBoton("◀ Anterior", pagina - 1, pagina === 1));

  const rango = 2;
  for (let i = Math.max(1, pagina - rango); i <= Math.min(totalPaginas, pagina + rango); i++) {
    const btn = crearBoton(i, i);
    if (i === pagina) btn.disabled = true;
    contenedor.appendChild(btn);
  }

  contenedor.appendChild(crearBoton("Siguiente ▶", pagina + 1, pagina === totalPaginas));
  contenedor.appendChild(crearBoton("Última ⏭", totalPaginas, pagina === totalPaginas));
}

// 📊 Actualiza contador de registros
function actualizarContadorRegistros(cantidad, entidad) {
  const contenedor = document.getElementById("contador-registros");
  contenedor.textContent = `📦 ${cantidad} ${entidad}`;
}

// ⚠️ Mostrar error si no se pueden cargar datos
function mostrarErrorContador(entidad) {
  const contenedor = document.getElementById("contador-registros");
  contenedor.textContent = `⚠️ No se pudieron cargar los ${entidad}`;
}

// 🧹 Limpieza de claves (por ejemplo: columnas en minúsculas)
function formatearClave(clave) {
  return clave.toLowerCase();
}

// === CRUD Genérico Escalable ===

// 📥 Leer registros paginados desde el backend para cualquier entidad
async function obtenerEntidadesPaginadas(pagina = 1, entidad = entidadActiva, columnas = configuracionEntidad[entidad].columnas) {
  try {
    let url = `/${entidad}/paginar?pagina=${pagina}&limite=${limite}`;

    if (filtroColumnaActual && filtroValorActual) {
      url += `&columna=${encodeURIComponent(filtroColumnaActual.toLowerCase())}&valor=${encodeURIComponent(filtroValorActual)}`;
    }

    const res = await fetch(url);
    const json = await res.json();

    datos = json[entidad]; // Asume que backend responde con { productos: [...], pagina, paginas, total }
    paginaActual = json.pagina;
    paginasTotales = json.paginas;

    renderizarTabla('tabla-' + entidad, datos, columnas, (tr, fila) => {
      tr.addEventListener("click", () => {
        if (modoEdicionActivo && !filaSeleccionada) activarEdicionEnFila(tr, entidad);
      });
    });

    actualizarContadorRegistros(json.total, entidad);
    renderizarPaginacion(paginaActual, paginasTotales);

    console.log("✅ URL generada para fetch:", url);
  } catch (error) {
    console.error(`❌ Error al obtener ${entidad} paginados:`, error);
    mostrarErrorContador(entidad);
  }
}

// 🆕 Crear entidad desde formulario emergente
async function crearEntidadDesdeFormulario() {
  const form = document.getElementById('formulario-popup');
  if (!form.reportValidity()) return;

  const inputs = form.querySelectorAll('input');
  const body = {};

  inputs.forEach(input => {
    const valor = input.value.trim();
    if (input.type === 'number') {
      body[formatearClave(input.name)] = valor ? parseFloat(valor) : null;
    } else {
      body[formatearClave(input.name)] = valor || null;
    }
  });

  await fetch(`/${entidadActiva}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  cerrarFormularioPopup();
  obtenerEntidadesPaginadas(paginaActual, entidadActiva);
}

// ✏️ Confirmar edición genérica para entidad activa
async function confirmarEdicion(id) {
  const inputs = filaSeleccionada.querySelectorAll("input");
  const columnas = configuracionEntidad[entidadActiva].columnas.slice(1); // Omitimos el ID

  const body = {};
  columnas.forEach((col, i) => {
    const input = inputs[i];
    if (!input) return;

    const valor = input.value.trim();
    body[formatearClave(col.nombre)] = (input.type === 'number') ? parseFloat(valor) : valor;
  });

  await fetch(`/${entidadActiva}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  cancelarModo();
  obtenerEntidadesPaginadas(paginaActual, entidadActiva);
}

// 🗑️ Eliminar lote genérico
async function eliminarLote(ids) {
  const errores = [];

  for (const id of ids) {
    try {
      const res = await fetch(`/${entidadActiva}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Falló el ID ${id}`);
    } catch (error) {
      errores.push(`❌ ID ${id}: ${error.message}`);
    }
  }

  cerrarFormularioPopup();

  if (errores.length > 0) {
    alert("Algunas eliminaciones fallaron:\n" + errores.join('\n'));
  }

  cancelarModo();
  obtenerEntidadesPaginadas(paginaActual, entidadActiva);
}

// === Modo Edición / Eliminación Escalable ===

// 🔁 Activar modo edición (solo una fila a la vez)
function activarModoEdicion() {
  if (modoEdicionActivo) return;

  modoEdicionActivo = true;
  desactivarBotonesGlobales();
  mostrarBotonCancelarModo();

  alert(`Haz clic en una fila para editar un ${entidadActiva.slice(0, -1)}.`);
}

// 🗑️ Activar modo eliminación (checkbox por fila)
function activarModoEliminacion() {
  if (modoEliminacionActivo) return;

  modoEliminacionActivo = true;
  desactivarBotonesGlobales();
  mostrarBotonCancelarModo();

  const btnEliminarGlobal = document.getElementById("btn-eliminar-global");
  btnEliminarGlobal.style.display = "none";

  const btnConfirmar = document.getElementById("btn-confirmar-eliminacion");
  btnConfirmar.style.display = "inline-block";

  // Clonamos para eliminar event listeners previos
  const nuevoBtnConfirmar = btnConfirmar.cloneNode(true);
  btnConfirmar.replaceWith(nuevoBtnConfirmar);

  nuevoBtnConfirmar.addEventListener("click", confirmarEliminarSeleccionados);

  obtenerEntidadesPaginadas(paginaActual, entidadActiva);
}

// 🚫 Cancelar cualquier modo activo
function cancelarModo() {
  modoEdicionActivo = false;
  modoEliminacionActivo = false;
  filaSeleccionada = null;
  activarBotonesGlobales();

  const btnEliminar = document.getElementById("btn-eliminar-global");
  if (btnEliminar) btnEliminar.style.display = "inline-block";

  const btnConfirmar = document.getElementById("btn-confirmar-eliminacion");
  if (btnConfirmar) {
    btnConfirmar.style.display = "none";
    btnConfirmar.replaceWith(btnConfirmar.cloneNode(true)); // Limpia listeners
  }

  document.getElementById("boton-cancelar-modo-container").innerHTML = '';

  obtenerEntidadesPaginadas(paginaActual, entidadActiva);
}

// 🛠️ Utilidades de botón global
function mostrarBotonCancelarModo() {
  const container = document.getElementById("boton-cancelar-modo-container");
  container.innerHTML = `<button id="btn-cancelar-modo">❌ Cancelar modo</button>`;
  document.getElementById("btn-cancelar-modo").addEventListener("click", cancelarModo);
}

function desactivarBotonesGlobales() {
  document.getElementById("btn-editar-global").disabled = true;
  document.getElementById("btn-eliminar-global").disabled = true;
}

function activarBotonesGlobales() {
  const btnEditar = document.getElementById("btn-editar-global");
  const btnEliminar = document.getElementById("btn-eliminar-global");

  if (btnEditar) btnEditar.disabled = false;
  if (btnEliminar) btnEliminar.disabled = false;
}

// === Filtros Genéricos ===

// Variables globales de filtro

// ✅ Aplicar filtro local o remoto
function aplicarFiltro(datosOriginales, columna, valorFiltro) {
  const tipoColumna = obtenerTipoColumna(datosOriginales, columna);
  let datosFiltrados = [];

  if (tipoColumna === 'fecha') {
    const [inicio, fin] = valorFiltro.split('|');
    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);

    datosFiltrados = datosOriginales.filter(item => {
      const fechaItem = new Date(item[columna]);
      return fechaItem >= fechaInicio && fechaItem <= fechaFin;
    });

  } else if (tipoColumna === 'número') {
    const valorNumerico = Number(valorFiltro);
    if (isNaN(valorNumerico)) {
      alert("Por favor ingresa un número válido.");
      return;
    }

    datosFiltrados = datosOriginales.filter(item => {
      const valorItem = Number(item[columna]);
      return !isNaN(valorItem) && Math.abs(valorItem - valorNumerico) < 0.001;
    });

  } else {
    datosFiltrados = datosOriginales.filter(item => {
      const valorItem = item[columna];
      return valorItem && valorItem.toString().toLowerCase().includes(valorFiltro.toLowerCase());
    });
  }

  const mensaje = document.getElementById("mensaje-sin-resultados");
  const tablaId = `tabla-${entidadActiva}`;

  if (datosFiltrados.length > 0) {
    renderizarTabla(tablaId, datosFiltrados, configuracionEntidad[entidadActiva].columnas);
    mensaje.style.display = "none";
    actualizarContadorRegistros(datosFiltrados.length, entidadActiva);
  } else {
    document.getElementById(tablaId).innerHTML = "";
    mensaje.style.display = "block";
    actualizarContadorRegistros(0, entidadActiva);
  }
}

// ✅ Inferir tipo de dato según muestra representativa
function obtenerTipoColumna(datos, columna) {
  const muestra = datos.find(item => item[columna] != null);
  if (!muestra) return 'texto';

  const valor = muestra[columna];

  if (typeof valor === "number") return 'número';

  if (typeof valor === "string") {
    if (!isNaN(valor) && valor.trim() !== "") return 'número';
    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return 'fecha'; // ISO-like
  }

  return 'texto';
}

// === Modal genérico para cualquier entidad ===

function abrirFormularioPopup() {
  const form = document.getElementById('formulario-popup');
  const titulo = document.getElementById('modal-titulo');
  form.innerHTML = '';

  const config = configuracionEntidad[entidadActiva];
  titulo.textContent = `Agregar nuevo ${entidadActiva.slice(0, -1)}`;

  config.columnas.forEach(col => {
    const label = document.createElement('label');
    label.textContent = col.nombre;

    const input = document.createElement('input');

    // Estimar tipo de campo
    if (col.nombre.toLowerCase().includes('fecha')) {
      input.type = 'date';
    } else if (col.nombre.toLowerCase().includes('id') || col.nombre.toLowerCase().includes('stock') || col.nombre.toLowerCase().includes('precio')) {
      input.type = 'number';
      input.step = 'any';
    } else {
      input.type = 'text';
    }

    input.name = col.nombre;

    // Campo requerido según config
    if (config.camposRequeridos.includes(col.nombre)) {
      input.required = true;
    }

    form.appendChild(label);
    form.appendChild(input);
  });

  document.getElementById('modal-popup').classList.remove('hidden');
}

function cerrarFormularioPopup() {
  document.getElementById('modal-popup').classList.add('hidden');

  // Restaurar visibilidad de contenido del modal
  const formulario = document.getElementById("formulario-popup");
  formulario.style.display = "block";
  formulario.innerHTML = "";

  const contenidoModal = document.querySelector("#modal-popup .modal-content");
  contenidoModal.style.display = "block";

  const contenidoDinamico = document.getElementById("modal-contenido-dinamico");
  contenidoDinamico.innerHTML = "";
  contenidoDinamico.style.display = "none";
}

function activarEdicionEnFila(tr, entidad) {
  if (filaSeleccionada) return;

  filaSeleccionada = tr;

  const columnas = configuracionEntidad[entidad].columnas;

  for (let i = 1; i < columnas.length; i++) { // omitimos ID
    const colConfig = columnas[i];
    const td = tr.children[modoEliminacionActivo ? i + 1 : i];
    const valor = td.textContent;

    let tipoInput;
    switch (colConfig.tipo) {
      case 'fecha':
        tipoInput = 'date';
        break;
      case 'numero':
        tipoInput = 'number';
        break;
      default:
        tipoInput = 'text';
    }

    const input = document.createElement('input');
    input.type = tipoInput;
    input.value = valor;
    td.textContent = '';
    td.appendChild(input);
  }

  mostrarBotonesEdicion(tr.dataset.id);
}

function mostrarBotonesEdicion(id) {
  const container = document.getElementById('boton-cancelar-modo-container');
  container.innerHTML = `
    <button id="btn-confirmar-edicion">✔ Confirmar</button>
    <button id="btn-cancelar-edicion">❌ Cancelar</button>
  `;

  document.getElementById('btn-confirmar-edicion').onclick = () => confirmarEdicion(id);
  document.getElementById('btn-cancelar-edicion').onclick = () => {
    filaSeleccionada = null;
    cancelarModo();
  };
}

function confirmarEliminarSeleccionados() {
  const checkboxes = document.querySelectorAll('.checkbox-eliminar:checked');
  if (checkboxes.length === 0) {
    alert("Selecciona al menos un registro para eliminar.");
    return;
  }

  const confirmacion = confirm(`¿Estás seguro de que deseas eliminar ${checkboxes.length} registros? Esta acción no se puede deshacer.`);
  if (!confirmacion) return;

  const idsAEliminar = Array.from(checkboxes).map(cb => cb.dataset.id);
  eliminarLote(idsAEliminar);
}
