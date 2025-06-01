async function obtenerProductos() {
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
      <td>S/. ${p.PRECIO_UNITARIO?.toFixed(2) || '0.00'}</td>
      <td>${p.STOCK_ACTUAL}</td>
      <td>${p.FECHA_INGRESO}</td>
      <td>${p.ID_CATEGORIA}</td>
      <td>
        <button onclick="editarProducto('${p.ID_PRODUCTO}')">✏️</button>
        <button onclick="eliminarProducto('${p.ID_PRODUCTO}')">🗑️</button>
      </td>
    `;
    tabla.appendChild(fila);
  });
}

async function crearProducto() {
  const id_producto = parseInt(document.getElementById('id_producto').value);
  const nombre_producto = document.getElementById('nombre_producto').value;
  const descripcion = document.getElementById('descripcion').value;
  const precio_unitario = parseFloat(document.getElementById('precio_unitario').value);
  const stock_actual = parseInt(document.getElementById('stock_actual').value);
  const fecha_ingreso = document.getElementById('fecha_ingreso').value;
  const id_categoria = parseInt(document.getElementById('id_categoria').value);

  if (nombre_producto && !isNaN(precio_unitario) && !isNaN(stock_actual) && fecha_ingreso && !isNaN(id_categoria)) {
    await fetch('/productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_producto, nombre_producto, descripcion, precio_unitario, stock_actual, fecha_ingreso, id_categoria
      })
    });
    obtenerProductos();
  }
}

async function eliminarProducto(id) {
  await fetch(`/productos/${id}`, { method: 'DELETE' });
  obtenerProductos();
}

async function editarProducto(id) {
  const nuevoNombre = prompt('Nuevo nombre:');
  const nuevaDescripcion = prompt('Nueva descripción:');
  const nuevoPrecio = prompt('Nuevo precio:');
  const nuevoStock = prompt('Nuevo stock:');
  const nuevaFecha = prompt('Nueva fecha (YYYY-MM-DD):');
  const nuevaCategoria = prompt('Nuevo ID categoría:');

  if (nuevoNombre && nuevaDescripcion && nuevoPrecio && nuevoStock && nuevaFecha && nuevaCategoria) {
    await fetch(`/productos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_producto: nuevoNombre,
        descripcion: nuevaDescripcion,
        precio_unitario: parseFloat(nuevoPrecio),
        stock_actual: parseInt(nuevoStock),
        fecha_ingreso: nuevaFecha,
        id_categoria: parseInt(nuevaCategoria)
      })
    });
    obtenerProductos();
  }
}

obtenerProductos();
