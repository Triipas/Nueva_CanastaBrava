document.addEventListener("DOMContentLoaded", () => {
  crudAPI.inicializarControlesGlobales(obtenerProductos, activarEdicionEnFila, eliminarFilaSeleccionada);
  obtenerProductos();
});

async function obtenerProductos() {
  try {
    const res = await fetch('/productos');
    const productos = await res.json();
    const tabla = document.getElementById('tabla-productos');
    tabla.innerHTML = '';

    productos.forEach(p => {
      const fila = document.createElement('tr');

      fila.innerHTML = `
        <td>${p.ID_PRODUCTO}</td>
        <td>${p.NOMBRE_PRODUCTO}</td>
        <td>${p.DESCRIPCION || ''}</td>
        <td>${p.PRECIO_UNITARIO.toFixed(2)}</td>
        <td>${p.STOCK_ACTUAL}</td>
        <td>${p.FECHA_INGRESO}</td>
        <td>${p.ID_CATEGORIA}</td>
      `;

      fila.addEventListener("click", () => {
        if (crudAPI.modoEdicionActivo && !crudAPI.filaSeleccionada) activarEdicionEnFila(fila);
        if (crudAPI.modoEliminacionActivo) eliminarFilaSeleccionada(fila);
      });

      tabla.appendChild(fila);
    });
  } catch (error) {
    console.error('Error al cargar productos:', error);
  }
}

function activarEdicionEnFila(fila) {
  crudAPI.filaSeleccionada = fila;
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
      <button onclick="crudAPI.cancelarModo()">❌</button>
    </td>
  `;
}

async function confirmarEdicion(id) {
  const inputs = crudAPI.filaSeleccionada.querySelectorAll("input");

  const data = {
    nombre_producto: inputs[0].value,
    descripcion: inputs[1].value,
    precio_unitario: parseFloat(inputs[2].value),
    stock_actual: parseInt(inputs[3].value),
    fecha_ingreso: inputs[4].value,
    id_categoria: parseInt(inputs[5].value)
  };

  await fetch(`/productos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  crudAPI.cancelarModo();
}

async function eliminarFilaSeleccionada(fila) {
  const id = fila.children[0].textContent;
  if (confirm(`¿Eliminar el producto ID ${id}?`)) {
    await fetch(`/productos/${id}`, { method: 'DELETE' });
  }
  crudAPI.cancelarModo();
}

async function crearProducto() {
  const id_producto = parseInt(document.getElementById('id_producto').value);
  const nombre_producto = document.getElementById('nombre_producto').value;
  const descripcion = document.getElementById('descripcion').value;
  const precio_unitario = parseFloat(document.getElementById('precio_unitario').value);
  const stock_actual = parseInt(document.getElementById('stock_actual').value);
  const fecha_ingreso = document.getElementById('fecha_ingreso').value;
  const id_categoria = parseInt(document.getElementById('id_categoria').value);

  await fetch('/productos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id_producto, nombre_producto, descripcion, precio_unitario, stock_actual, fecha_ingreso, id_categoria
    })
  });

  obtenerProductos();
}
