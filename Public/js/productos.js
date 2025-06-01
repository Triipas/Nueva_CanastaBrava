document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-editar-global").addEventListener("click", activarModoEdicion);
  document.getElementById("btn-eliminar-global").addEventListener("click", activarModoEliminacion);
  obtenerDatos();
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
async function obtenerDatos() {
  try {
    const res = await fetch(`/${entidad}`);
    const datos = await res.json();

    renderizarTabla('tabla-productos', datos, columnasProductos, (tr, fila) => {
      tr.addEventListener("click", () => {
        if (modoEdicionActivo && !filaSeleccionada) activarEdicionEnFila(tr);
        if (modoEliminacionActivo) eliminarFilaSeleccionada(tr);
      });
    });
  } catch (error) {
    console.error(`Error al cargar ${entidad}:`, error);
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

  obtenerDatos();
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
}

// === Eliminar producto ===
async function eliminarFilaSeleccionada(fila) {
  const id = fila.children[0].textContent;
  if (confirm(`¿Eliminar el ${entidad.slice(0, -1)} ID ${id}?`)) {
    await fetch(`/${entidad}/${id}`, { method: 'DELETE' });
  }
  cancelarModo();
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
  document.getElementById("boton-cancelar-modo-container").innerHTML = '';
  obtenerDatos(); // función que puedes redefinir según la entidad activa
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
  alert("Haz clic en una fila para eliminarla.");
}

function desactivarBotonesGlobales() {
  document.getElementById("btn-editar-global").disabled = true;
  document.getElementById("btn-eliminar-global").disabled = true;
}

function activarBotonesGlobales() {
  document.getElementById("btn-editar-global").disabled = false;
  document.getElementById("btn-eliminar-global").disabled = false;
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
  obtenerDatos();
}

function formatearClave(clave) {
  return clave.toLowerCase();
}