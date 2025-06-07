// ===================
// 🧠 Configuración Global e Inicialización
// ===================

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
  let configuracionTablas = {};

  let entidadActiva = 'productos';

  let datos = [],
    filtroColumnaActual = null,
    filtroValorActual = null,
    paginasTotales = 1,
    paginaActual = 1,
    limite = 12;

  let modoEdicionActivo = false,
    modoEliminacionActivo = false,
    filaSeleccionada = null;

  document.addEventListener("DOMContentLoaded", () => {
    const { columnas, camposRequeridos } = configuracionEntidad[entidadActiva];

    obtenerEntidadesPaginadas(1, entidadActiva, columnas);

    ConfiguracionTablas();
    configurarBotonesGlobales();
    configurarFiltroBusqueda();
  });

// ===================
// 🧩 Configuración de Interfaz (Botones, Filtros, Eventos UI)
// ===================

  function configurarBotonesGlobales() {
    document.getElementById("btn-editar-global").addEventListener("click", activarModoEdicion);
    document.getElementById("btn-eliminar-global").addEventListener("click", activarModoEliminacion);
    document.getElementById("btn-recargar").addEventListener("click", () => {
      obtenerEntidadesPaginadas(paginaActual, entidadActiva);
    });
  }

  function configurarFiltroBusqueda() {
    const combobox = document.getElementById("filtro-columna");
    const inputFiltro = document.getElementById("valor-filtro");
    const filtroFechas = document.getElementById("filtro-fechas");

    combobox.addEventListener("change", () => {
      const columnaSeleccionada = combobox.value;
      const esFecha = columnaSeleccionada.toUpperCase().includes("FECHA");
      filtroFechas.style.display = esFecha ? "inline" : "none";
      inputFiltro.style.display = esFecha ? "none" : "inline";
    });

    document.getElementById("btn-buscar-filtro").addEventListener("click", aplicarFiltroDesdeUI);
    document.getElementById("btn-limpiar-filtro").addEventListener("click", limpiarFiltroUI);
  }

  function aplicarFiltroDesdeUI() {
    const columna = document.getElementById("filtro-columna").value;
    let valorFiltro = "";

    if (columna.toUpperCase().includes("FECHA")) {
      const inicio = document.getElementById("fecha-inicio").value;
      const fin = document.getElementById("fecha-fin").value;
      if (!inicio || !fin) return alert("Debes seleccionar ambas fechas.");
      valorFiltro = `${inicio}|${fin}`;
    } else {
      valorFiltro = document.getElementById("valor-filtro").value.trim();
    }

    if (!valorFiltro) return alert("Debes ingresar un valor para filtrar.");

    filtroColumnaActual = columna;
    filtroValorActual = valorFiltro;

    obtenerEntidadesPaginadas(1, entidadActiva);
  }

  function limpiarFiltroUI() {
    document.getElementById("valor-filtro").value = "";
    document.getElementById("fecha-inicio").value = "";
    document.getElementById("fecha-fin").value = "";
    document.getElementById("mensaje-sin-resultados").style.display = "none";

    filtroColumnaActual = null;
    filtroValorActual = null;

    obtenerEntidadesPaginadas(paginaActual, entidadActiva);
  }

// ===================
// 📦 Comunicación con el Servidor / Fetch API
// ===================

  async function ConfiguracionTablas() {
    try {
      const res = await fetch('/metadata');
      const data = await res.json();
      configuracionTablas = data;

      console.log('Configuración cargada:', configuracionTablas);

    } catch (err) {
      console.error('Error al cargar configuración:', err);
    }
  }

  async function obtenerEntidadesPaginadas(pagina = 1, entidad = entidadActiva, columnas = configuracionEntidad[entidad].columnas) {
    try {
      let url = `/${entidad}/paginar?pagina=${pagina}&limite=${limite}`; if (filtroColumnaActual && filtroValorActual) {
        url += `&columna=${encodeURIComponent(filtroColumnaActual.toLowerCase())}&valor=${encodeURIComponent(filtroValorActual)}`;
      } const res = await fetch(url); const json = await res.json(); datos = json.datos || json[entidad] || []; paginaActual = json.pagina;
      paginasTotales = json.paginas; renderizarTabla('tabla-' + entidad, datos, columnas, (tr, fila) => {
        tr.addEventListener("click", () => {
          if (modoEdicionActivo && !filaSeleccionada) {
            activarEdicionEnFila(tr, entidad);
          }
        });
      }); actualizarContadorRegistros(json.total, entidad); renderizarPaginacion(paginaActual, paginasTotales); console.log("✅ URL generada para fetch:", url);

    } catch (error) {
      console.error(`❌ Error al obtener ${entidad} paginados:`, error); mostrarErrorContador(entidad);
    }
  }

  async function crearEntidadDesdeFormulario() {
    const form = document.getElementById('formulario-popup'); if (!form.reportValidity()) return; const inputs = form.querySelectorAll('input'); const body = {}; inputs.forEach(input => {
      const valor = input.value.trim(); if (input.type === 'number') {
        body[formatearClave(input.name)] = valor ? parseFloat(valor) : null;
      } else {
        body[formatearClave(input.name)] = valor || null;
      }
    });

    try {
      const response = await fetch(`/${entidadActiva}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      }); if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error del servidor:', errorData); throw new Error(`Error ${response.status}: ${errorData.error || 'Error desconocido'}`);
      } const data = await response.json();
      console.log('✅ Creado exitosamente:', data);

    } catch (error) { console.error('❌ Error completo:', error); } cerrarFormularioPopup(); obtenerEntidadesPaginadas(paginaActual, entidadActiva);
  }

  async function confirmarEdicion(id) {
    const inputs = filaSeleccionada.querySelectorAll("input"); const columnas = configuracionEntidad[entidadActiva].columnas.slice(1); const body = {}; columnas.forEach((col, i) => {
      const input = inputs[i];
      if (!input) return; const valor = input.value.trim(); body[formatearClave(col.nombre)] = (input.type === 'number') ? parseFloat(valor) : valor;
    }); await fetch(`/${entidadActiva}/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    }); cancelarModo(); obtenerEntidadesPaginadas(paginaActual, entidadActiva);
  }

  async function eliminarLote(ids) {
    const errores = []; for (const id of ids) {
      try {
        const res = await fetch(`/${entidadActiva}/${id}`, { method: "DELETE" }); if (!res.ok) throw new Error(`Falló el ID ${id}`);
      } catch (error) {
        errores.push(`❌ ID ${id}: ${error.message}`);
      }
    } cerrarFormularioPopup(); if (errores.length > 0) {
      alert("Algunas eliminaciones fallaron:\n" + errores.join('\n'));
    } cancelarModo(); obtenerEntidadesPaginadas(paginaActual, entidadActiva);
  }

// ===================
// 📊 Renderizado de Datos en la Interfaz
// ===================

  function renderizarTabla(idTabla, data, columnas, eventosPorFila = () => { }) {
    const tabla = document.getElementById(idTabla); tabla.innerHTML = ''; data.forEach(fila => {
      const tr = document.createElement('tr'); tr.dataset.id = fila[columnas[0].nombre]; if (modoEliminacionActivo) {
        const tdCheckbox = document.createElement('td'); const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.classList.add('checkbox-eliminar'); checkbox.dataset.id = fila[columnas[0].nombre]; tdCheckbox.appendChild(checkbox); tr.appendChild(tdCheckbox);
      } columnas.forEach(col => {
        const valor = fila[col.nombre]; const td = document.createElement('td'); td.textContent = (valor == null) ? '' :
          (typeof valor === 'number') ?
            (Number.isInteger(valor) ? valor : valor.toFixed(2)) :
            valor;

        tr.appendChild(td);
      }); eventosPorFila(tr, fila); tabla.appendChild(tr);
    }); const thead = document.querySelector("thead tr");
    if (modoEliminacionActivo) {
      if (!thead.querySelector("th.checkbox-header")) {
        const th = document.createElement("th"); th.textContent = "";
        th.classList.add("checkbox-header");
        thead.insertBefore(th, thead.firstChild);
      }
    } else {
      const thCheckbox = document.querySelector("th.checkbox-header");
      if (thCheckbox) thCheckbox.remove();
    }
  }

  function renderizarPaginacion(pagina, totalPaginas) {
    const contenedor = document.getElementById("paginacion"); contenedor.innerHTML = ""; if (totalPaginas <= 1) return; const crearBoton = (texto, nuevaPagina, deshabilitado = false) => {
      const btn = document.createElement("button"); btn.textContent = texto; btn.disabled = deshabilitado; btn.addEventListener("click", () => {
        const columnas = configuracionEntidad[entidadActiva].columnas;
        obtenerEntidadesPaginadas(nuevaPagina, entidadActiva, columnas);
      });

      return btn;
    }; contenedor.appendChild(crearBoton("⏮", 1, pagina === 1)); contenedor.appendChild(crearBoton("◀ Anterior", pagina - 1, pagina === 1)); const rango = 2; for (let i = Math.max(1, pagina - rango); i <= Math.min(totalPaginas, pagina + rango); i++) {
      const btn = crearBoton(i, i); if (i === pagina) btn.disabled = true;

      contenedor.appendChild(btn);
    } contenedor.appendChild(crearBoton("Siguiente ▶", pagina + 1, pagina === totalPaginas)); contenedor.appendChild(crearBoton("⏭", totalPaginas, pagina === totalPaginas));
  }

  function actualizarContadorRegistros(cantidad, entidad) {
    const contenedor = document.getElementById("contador-registros");
    contenedor.textContent = `📦 ${cantidad} ${entidad}`;
  }

  function mostrarErrorContador(entidad) {
    const contenedor = document.getElementById("contador-registros");
    contenedor.textContent = `⚠️ No se pudieron cargar los ${entidad}`;
  }

// ===================
// 📝 Modo Edición y Eliminación
// ===================

  function activarModoEdicion() {
    if (modoEdicionActivo) return;

    modoEdicionActivo = true; 

    desactivarBotonesGlobales(); 
    mostrarBotonCancelarModo(); 

    alert(`Haz clic en una fila para editar un ${entidadActiva.slice(0, -1)}.`); 
  }

  function activarModoEliminacion() {
    if (modoEliminacionActivo) return; modoEliminacionActivo = true; desactivarBotonesGlobales(); mostrarBotonCancelarModo(); const btnEliminarGlobal = document.getElementById("btn-eliminar-global");
    btnEliminarGlobal.style.display = "none"; const btnConfirmar = document.getElementById("btn-confirmar-eliminacion");
    btnConfirmar.style.display = "inline-block"; const nuevoBtnConfirmar = btnConfirmar.cloneNode(true); btnConfirmar.replaceWith(nuevoBtnConfirmar); nuevoBtnConfirmar.addEventListener("click", confirmarEliminarSeleccionados); obtenerEntidadesPaginadas(paginaActual, entidadActiva);
  }

  function cancelarModo() {
    modoEdicionActivo = false; modoEliminacionActivo = false; filaSeleccionada = null; activarBotonesGlobales(); const btnEliminar = document.getElementById("btn-eliminar-global"); if (btnEliminar) btnEliminar.style.display = "inline-block"; const btnConfirmar = document.getElementById("btn-confirmar-eliminacion");

    if (btnConfirmar) {
      btnConfirmar.style.display = "none"; btnConfirmar.replaceWith(btnConfirmar.cloneNode(true));
    } document.getElementById("boton-cancelar-modo-container").innerHTML = ''; obtenerEntidadesPaginadas(paginaActual, entidadActiva);
  }

  function activarEdicionEnFila(tr, entidad) {
    if (filaSeleccionada) return; filaSeleccionada = tr; const columnas = configuracionEntidad[entidad].columnas; for (let i = 1; i < columnas.length; i++) {
      const colConfig = columnas[i]; const td = tr.children[modoEliminacionActivo ? i + 1 : i]; const valor = td.textContent; let tipoInput;
      switch (colConfig.tipo) {
        case 'fecha':
          tipoInput = 'date'; break;
        case 'numero':
          tipoInput = 'number'; break;
        default:
          tipoInput = 'text';
      }      const input = document.createElement('input');
      input.type = tipoInput; input.value = valor; td.textContent = ''; td.appendChild(input);
    } mostrarBotonesEdicion(tr.dataset.id);
  }

  function confirmarEliminarSeleccionados() {
    const checkboxes = document.querySelectorAll('.checkbox-eliminar:checked'); if (checkboxes.length === 0) {
      alert("Selecciona al menos un registro para eliminar.");
      return;
    } const confirmacion = confirm(`¿Estás seguro de que deseas eliminar ${checkboxes.length} registros? Esta acción no se puede deshacer.`); if (!confirmacion) return; const idsAEliminar = Array.from(checkboxes).map(cb => cb.dataset.id); eliminarLote(idsAEliminar);
  }

  function mostrarBotonCancelarModo() {
    const container = document.getElementById("boton-cancelar-modo-container");
    container.innerHTML = `<button id="btn-cancelar-modo">❌ Cancelar modo</button>`;
    document.getElementById("btn-cancelar-modo").addEventListener("click", cancelarModo);
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

// ===================
// 📤 Formularios y Popups
// ===================

  function abrirFormularioPopup() {
    const form = document.getElementById('formulario-popup');
    const titulo = document.getElementById('modal-titulo');
    form.innerHTML = '';

    const config = configuracionTablas[entidadActiva];
    titulo.textContent = `Agregar nuevo ${entidadActiva.slice(0, -1)}`;

    for (const [nombreCampo, campo] of Object.entries(config.campos)) {
      const label = document.createElement('label');
      label.textContent = nombreCampo;

      const input = document.createElement('input');
      input.name = nombreCampo; switch (campo.tipo) {
        case 'string':
        case 'clob':
          input.type = 'text';
          break;
        case 'number':
          input.type = 'number';
          input.step = 'any';
          break;
        case 'date':
          input.type = 'date';
          break;
        default:
          input.type = 'text';
      }

      if (campo.requerido) {
        input.required = true;
      }

      form.appendChild(label);
      form.appendChild(input);
    }

    document.getElementById('modal-popup').classList.remove('hidden');
  }

  function cerrarFormularioPopup() {
    document.getElementById('modal-popup').classList.add('hidden'); const formulario = document.getElementById("formulario-popup");
    formulario.style.display = "block";
    formulario.innerHTML = "";

    const contenidoModal = document.querySelector("#modal-popup .modal-content");
    contenidoModal.style.display = "block";

    const contenidoDinamico = document.getElementById("modal-contenido-dinamico");
    contenidoDinamico.innerHTML = "";
    contenidoDinamico.style.display = "none";
  }

// ===================
// 🛠️ Utilidades Generales
// ===================

  function activarBotonesGlobales() {
    const btnEditar = document.getElementById("btn-editar-global");
    const btnEliminar = document.getElementById("btn-eliminar-global");

    if (btnEditar) btnEditar.disabled = false;
    if (btnEliminar) btnEliminar.disabled = false;
  }

  function desactivarBotonesGlobales() {
    document.getElementById("btn-editar-global").disabled = true;
    document.getElementById("btn-eliminar-global").disabled = true;
  }

  function formatearClave(clave) {
    return clave.toLowerCase();
  }

  function obtenerTipoColumna(columna) {
    const entidad = entidadActiva;
    const config = configuracionTablas[entidad];

    if (!config || !config.campos) {
      console.warn(`⚠️ Configuración no disponible para la entidad "${entidad}"`);
      return 'texto';
    }

    const campo = config.campos[columna.toLowerCase()];
    if (!campo || !campo.tipo) {
      console.warn(`⚠️ Tipo no definido para la columna "${columna}", se asume "texto"`);
      return 'texto';
    }

    switch (campo.tipo) {
      case 'number': return 'número';
      case 'date': return 'fecha';
      case 'string':
      case 'clob': return 'texto';
      default: return 'texto';
    }
  }