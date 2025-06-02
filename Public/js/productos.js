let datos = [];
let paginaActual = 1;
let filtroColumnaActual = null;
let filtroValorActual = null;
let paginasTotales = 1;
let limite = 10;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-editar-global").addEventListener("click", activarModoEdicion);
  document.getElementById("btn-eliminar-global").addEventListener("click", activarModoEliminacion);
  obtenerProductosPaginados(1);

  const combobox = document.getElementById("filtro-columna");
  const inputFiltro = document.getElementById("valor-filtro");
  const filtroFechas = document.getElementById("filtro-fechas");
  const btnRecargar = document.getElementById("btn-recargar");

  btnRecargar.addEventListener("click", () => {
    obtenerProductosPaginados(paginaActual); // o los parámetros reales que tu función requiera
  });

  combobox.addEventListener("change", () => {
    const columnaSeleccionada = combobox.value;

    if (columnaSeleccionada === "FECHA_INGRESO") {
      filtroFechas.style.display = "inline";
      inputFiltro.style.display = "none";
    } else {
      filtroFechas.style.display = "none";
      inputFiltro.style.display = "inline";
    }
  });

  document.getElementById("btn-buscar-filtro").addEventListener("click", () => {
    const columnaSeleccionada = document.getElementById("filtro-columna").value;
    let valorFiltro = "";

    if (columnaSeleccionada === "FECHA_INGRESO") {
      const fechaInicio = document.getElementById("fecha-inicio").value;
      const fechaFin = document.getElementById("fecha-fin").value;

      if (!fechaInicio || !fechaFin) {
        alert("Debes seleccionar ambas fechas.");
        return;
      }

      // En este ejemplo solo soportamos un valor, así que usa solo una fecha
      valorFiltro = `${fechaInicio}|${fechaFin}`; // Enviar rango como string separado por |
    } else {
      valorFiltro = document.getElementById("valor-filtro").value;
    }

    if (!valorFiltro) {
      alert("Debes ingresar un valor para filtrar.");
      return;
    }

    // Guardamos globalmente los filtros
    filtroColumnaActual = columnaSeleccionada;
    filtroValorActual = valorFiltro;

    // Cargar desde el backend con el filtro aplicado
    obtenerProductosPaginados(1);
  });

  document.getElementById("btn-limpiar-filtro").addEventListener("click", () => {
    document.getElementById("valor-filtro").value = "";
    document.getElementById("fecha-inicio").value = "";
    document.getElementById("fecha-fin").value = "";
    document.getElementById("mensaje-sin-resultados").style.display = "none";

    // Resetear filtros globales
    filtroColumnaActual = null;
    filtroValorActual = null;

    obtenerProductosPaginados(paginaActual); // Volver a ruta simple
    actualizarContadorRegistros(datos.length, entidad); // ✅ Actualizar el contador
  });

});

// === Configuración específica de "productos" ===
const entidad = 'productos';
const columnasProductos = [
  'ID_PRODUCTO',
  'NOMBRE_PRODUCTO',
  'DESCRIPCION',
  'PRECIO_UNITARIO',
  'STOCK_ACTUAL',
  'FECHA_INGRESO',
  'ID_CATEGORIA'
];

// === Obtiene productos desde el backend ===
async function obtenerProductosPaginados(pagina = 1) {
  try {
    let url = `/${entidad}/paginar?pagina=${pagina}&limite=${limite}`;

    if (filtroColumnaActual && filtroValorActual) {
      url += `&columna=${encodeURIComponent(filtroColumnaActual.toLowerCase())}&valor=${encodeURIComponent(filtroValorActual)}`;
    }

    const res = await fetch(url);
    const json = await res.json();

    datos = json.productos;
    paginaActual = json.pagina;
    paginasTotales = json.paginas;

    renderizarTabla('tabla-productos', datos, columnasProductos, (tr, fila) => {
      tr.addEventListener("click", () => {
        if (modoEdicionActivo && !filaSeleccionada) activarEdicionEnFila(tr);
      });
    });

    actualizarContadorRegistros(json.total, entidad);
    renderizarPaginacion(paginaActual, paginasTotales);
    console.log("URL generada para fetch:", url);
  } catch (error) {
    console.error(`Error al obtener ${entidad} paginados:`, error);
    mostrarErrorContador(entidad);
  }
}

// === Crear producto ===
async function crearProducto() {
  const id_producto = parseInt(document.getElementById('id_producto').value);
  const nombre_producto = document.getElementById('nombre_producto').value;
  const descripcion = document.getElementById('descripcion').value;
  const precio_unitario = parseFloat(document.getElementById('precio_unitario').value);
  const stock_actual = parseInt(document.getElementById('stock_actual').value);
  const fecha_ingreso = document.getElementById('fecha_ingreso').value;
  const id_categoria = parseInt(document.getElementById('id_categoria').value);

  await fetch(`/${entidad}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id_producto, nombre_producto, descripcion, precio_unitario,
      stock_actual, fecha_ingreso, id_categoria
    })
  });

  obtenerProductosPaginados(paginaActual);
}

// === Editar fila producto (solo para esta tabla por ahora) ===
function activarEdicionEnFila(fila) {
  filaSeleccionada = fila;
  const celdas = fila.querySelectorAll("td");
  const valores = Array.from(celdas).map(td => td.textContent);

  fila.innerHTML = `
    <td>${valores[0]}</td>
    <td><input type="text" value="${valores[1]}" /></td>
    <td><input type="text" value="${valores[2]}" /></td>
    <td><input type="number" step="0.01" value="${valores[3]}" /></td>
    <td><input type="number" value="${valores[4]}" /></td>
    <td><input type="date" value="${valores[5]}" /></td>
    <td><input type="number" value="${valores[6]}" /></td>
    <td>
      <button onclick="confirmarEdicion(${valores[0]})">✅</button>
      <button onclick="cancelarModo()">❌</button>
    </td>
  `;
}

// === Confirmar edición producto ===
async function confirmarEdicion(id) {
  const inputs = filaSeleccionada.querySelectorAll("input");

  const data = {
    nombre_producto: inputs[0].value,
    descripcion: inputs[1].value,
    precio_unitario: parseFloat(inputs[2].value),
    stock_actual: parseInt(inputs[3].value),
    fecha_ingreso: inputs[4].value,
    id_categoria: parseInt(inputs[5].value)
  };

  await fetch(`/${entidad}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  cancelarModo();
  obtenerProductosPaginados(paginaActual);
}

// === Estado global del CRUD ===
let modoEdicionActivo = false;
let modoEliminacionActivo = false;
let filaSeleccionada = null;

// === Utilidad genérica: Renderizar tabla con manejo de valores null y números ===
function renderizarTabla(idTabla, data, columnas, eventosPorFila = () => {}) {
  const tabla = document.getElementById(idTabla);
  tabla.innerHTML = '';

  data.forEach(fila => {
    const tr = document.createElement('tr');
    tr.dataset.id = fila[columnas[0]]; // ID dinámico por si se cambia entidad

    // Agregar checkbox si está activo el modo eliminación múltiple
    if (modoEliminacionActivo) {
      const tdCheckbox = document.createElement('td');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.classList.add('checkbox-eliminar');
      checkbox.dataset.id = fila[columnas[0]];
      tdCheckbox.appendChild(checkbox);
      tr.appendChild(tdCheckbox);
    }

    columnas.forEach(col => {
      const valor = fila[col];
      let contenido = '';
      if (valor == null) {
        contenido = '';
      } else if (typeof valor === 'number') {
        contenido = Number.isInteger(valor) ? valor : valor.toFixed(2);
      } else {
        contenido = valor;
      }

      const td = document.createElement('td');
      td.textContent = contenido;
      tr.appendChild(td);
    });

    eventosPorFila(tr, fila);
    tabla.appendChild(tr);
  });

  // Agregar encabezado de checkbox si está en modo eliminación
  if (modoEliminacionActivo) {
    const thead = document.querySelector("thead tr");
    if (!thead.querySelector("th.checkbox-header")) {
      const th = document.createElement("th");
      th.textContent = ""; // vacío para checkbox
      th.classList.add("checkbox-header");
      thead.insertBefore(th, thead.firstChild);
    }
  } else {
    // Limpiar columna de checkbox si ya no estamos en ese modo
    const thCheckbox = document.querySelector("th.checkbox-header");
    if (thCheckbox) thCheckbox.remove();
  }
}

// === Manejo de modos ===
function mostrarBotonCancelarModo() {
  const container = document.getElementById("boton-cancelar-modo-container");
  container.innerHTML = `<button id="btn-cancelar-modo">❌ Cancelar modo</button>`;
  document.getElementById("btn-cancelar-modo").addEventListener("click", cancelarModo);
}

function cancelarModo() {
  modoEdicionActivo = false;
  modoEliminacionActivo = false;
  filaSeleccionada = null;
  activarBotonesGlobales();

  document.getElementById("btn-eliminar-global").style.display = "inline-block";

  const btnConfirmar = document.getElementById("btn-confirmar-eliminacion");
  if (btnConfirmar) {
    btnConfirmar.style.display = "none";

    // También elimina event listener anterior (opcional)
    btnConfirmar.replaceWith(btnConfirmar.cloneNode(true));
  }

  document.getElementById("boton-cancelar-modo-container").innerHTML = '';
  obtenerProductosPaginados(paginaActual);
}


function activarModoEdicion() {
  if (modoEdicionActivo) return;
  modoEdicionActivo = true;
  desactivarBotonesGlobales();
  mostrarBotonCancelarModo();
  alert("Haz clic en una fila para editarla.");
}

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

  // **Agregar listener al nuevo botón**
  nuevoBtnConfirmar.addEventListener("click", confirmarEliminarSeleccionados);

  obtenerProductosPaginados(paginaActual);
}

function desactivarBotonesGlobales() {
  document.getElementById("btn-editar-global").disabled = true;
  document.getElementById("btn-eliminar-global").disabled = true;
}

function activarBotonesGlobales() {
  const btnEditar = document.getElementById("btn-editar-global");
  if (btnEditar) btnEditar.disabled = false;

  const btnEliminar = document.getElementById("btn-eliminar-global");
  if (btnEliminar) btnEliminar.disabled = false;
}

// Campos requeridos por entidad
const camposRequeridosPorEntidad = {
  productos: ['ID_PRODUCTO', 'NOMBRE_PRODUCTO']
};

function abrirFormularioPopup() {
  const form = document.getElementById('formulario-popup');
  const titulo = document.getElementById('modal-titulo');
  form.innerHTML = '';
  titulo.textContent = `Agregar nuevo ${entidad.slice(0, -1)}`;

  columnasProductos.forEach(col => {
    const label = document.createElement('label');
    label.textContent = col;

    const input = document.createElement('input');

    // Tipo de input según el nombre de columna
    if (col.toLowerCase().includes('fecha')) {
      input.type = 'date';
    } else if (col.toLowerCase().includes('id') || col.toLowerCase().includes('stock') || col.toLowerCase().includes('precio')) {
      input.type = 'number';
      input.step = 'any';
    } else {
      input.type = 'text'; // Incluye descripción como texto plano
    }

    input.name = col;

    // Campo requerido si está definido en config
    if (camposRequeridosPorEntidad[entidad]?.includes(col)) {
      input.required = true;
    }

    form.appendChild(label);
    form.appendChild(input);
  });

  document.getElementById('modal-popup').classList.remove('hidden');
}

function cerrarFormularioPopup() {
  document.getElementById('modal-popup').classList.add('hidden');

  // Mostrar formulario y ocultar contenido dinámico
  document.getElementById("formulario-popup").style.display = "block";
  document.querySelector("#modal-popup .modal-content").style.display = "block";

  document.getElementById("modal-contenido-dinamico").style.display = "none";
  document.getElementById("modal-contenido-dinamico").innerHTML = "";
}

async function guardarDesdePopup() {
  const form = document.getElementById('formulario-popup');

  if (!form.reportValidity()) return; // Fuerza validación HTML5 y evita submit si hay errores

  const inputs = form.querySelectorAll('input');
  const body = {};

  inputs.forEach(input => {
    const value = input.value.trim();
    if (input.type === 'number') {
      body[formatearClave(input.name)] = value ? parseFloat(value) : null;
    } else {
      body[formatearClave(input.name)] = value || null;
    }
  });

  await fetch(`/${entidad}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  cerrarFormularioPopup();
  obtenerProductosPaginados(paginaActual);
}

function formatearClave(clave) {
  return clave.toLowerCase();
}

function actualizarContadorRegistros(cantidad, nombreEntidad) {
  const contenedor = document.getElementById("contador-registros");
  contenedor.textContent = `📦${cantidad} ${nombreEntidad}`;
}

function mostrarErrorContador(nombreEntidad) {
  const contenedor = document.getElementById("contador-registros");
  contenedor.textContent = `⚠️ No se pudieron cargar los ${nombreEntidad}`;
}

async function confirmarEliminarSeleccionados() {
  const checkboxes = document.querySelectorAll(".checkbox-eliminar:checked");
  if (checkboxes.length === 0) {
    alert("Debes seleccionar al menos un elemento para eliminar.");
    return;
  }

  const ids = Array.from(checkboxes).map(cb => cb.dataset.id);

  // Mostrar modal de confirmación en el contenedor dinámico
  const contenido = ids.map(id => `<li>ID: ${id}</li>`).join('');
  const modalContenido = `
    <div class="modal-content">
      <h2>Confirmar eliminación</h2>
      <p>¿Estás seguro de eliminar los siguientes ${entidad}?</p>
      <ul>${contenido}</ul>
      <div class="modal-buttons">
        <button id="btn-eliminar-confirmar-final">✅ Confirmar</button>
        <button onclick="cerrarFormularioPopup()">❌ Cancelar</button>
      </div>
    </div>
  `;
  
  // Ocultar el formulario popup y mostrar el contenido dinámico
  document.getElementById("formulario-popup").style.display = "none";
  document.querySelector("#modal-popup .modal-content").style.display = "none";

  const contenedorDinamico = document.getElementById("modal-contenido-dinamico");
  contenedorDinamico.innerHTML = modalContenido;
  contenedorDinamico.style.display = "block";

  document.getElementById("modal-popup").classList.remove("hidden");

  document.getElementById("btn-eliminar-confirmar-final").onclick = async () => {
    await eliminarLote(ids);
  };
}

async function eliminarLote(ids) {
  const errores = [];

  for (const id of ids) {
    try {
      const res = await fetch(`/${entidad}/${id}`, { method: "DELETE" });
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
  obtenerProductosPaginados(paginaActual);
}

function aplicarFiltro(tablaId, datosOriginales, columna, valorFiltro) {
  let datosFiltrados = [];

  const tipoColumna = obtenerTipoColumna(datosOriginales, columna);

  if (tipoColumna === 'fecha') {
    const [fechaInicio, fechaFin] = valorFiltro.split(' al ').map(fecha => new Date(fecha.trim()));
    datosFiltrados = datosOriginales.filter(item => {
      const fechaItem = new Date(item[columna]);
      return fechaItem >= fechaInicio && fechaItem <= fechaFin;
    });
  } else if (tipoColumna === 'número') {
      const valorNumerico = Number(valorFiltro);
      if (isNaN(valorNumerico)) {
        alert("Por favor ingresa un valor numérico válido.");
        return;
      }

      datosFiltrados = datosOriginales.filter(item => {
        const valorItem = Number(item[columna]);
        return !isNaN(valorItem) && Math.abs(valorItem - valorNumerico) < 0.001;
      });
  } else { // texto
    datosFiltrados = datosOriginales.filter(item => {
      const valor = item[columna];
      return valor && valor.toString().toLowerCase().includes(valorFiltro.toLowerCase());
    });
  }

  const mensaje = document.getElementById("mensaje-sin-resultados");

  if (datosFiltrados.length > 0) {
    renderizarTabla(tablaId, datosFiltrados, columnasProductos);
    mensaje.style.display = "none";
    actualizarContadorRegistros(datosFiltrados.length, entidad);
  } else {
    // No coincidencias
    document.getElementById(tablaId).innerHTML = "";
    mensaje.style.display = "block";
    actualizarContadorRegistros(0, entidad);
  }
}

function obtenerTipoColumna(datos, columna) {
  const ejemplo = datos.find(item => item[columna] != null);
  if (!ejemplo) return 'texto';

  const valor = ejemplo[columna];

  // Si ya es número (realmente un tipo número)
  if (typeof valor === "number") return 'número';

  // Si parece número como string
  if (!isNaN(valor) && valor.trim() !== "") return 'número';

  // Si parece fecha en formato ISO (yyyy-mm-dd)
  if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valor)) return 'fecha';

  return 'texto';
}

function renderizarPaginacion(pagina, totalPaginas) {
  const contenedor = document.getElementById("paginacion");
  contenedor.innerHTML = "";

  if (totalPaginas <= 1) return;

  const crearBoton = (texto, nuevaPagina, deshabilitado = false) => {
    const btn = document.createElement("button");
    btn.textContent = texto;
    btn.disabled = deshabilitado;
    btn.addEventListener("click", () => obtenerProductosPaginados(nuevaPagina));
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
