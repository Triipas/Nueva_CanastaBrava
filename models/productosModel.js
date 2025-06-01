// models/productosModel.js
const { getAll, insert, update, remove } = require('../utils/crudGenerico');

const tabla = 'productos';

async function obtenerProductos() {
  const campos = `
    id_producto, nombre_producto, TO_CHAR(descripcion) AS descripcion,
    precio_unitario, stock_actual, TO_CHAR(fecha_ingreso, 'YYYY-MM-DD') AS fecha_ingreso,
    id_categoria
  `;
  return await getAll(tabla, campos);
}

async function crearProducto(data) {
  const columnas = [
    'id_producto', 'nombre_producto', 'descripcion',
    'precio_unitario', 'stock_actual', 'fecha_ingreso', 'id_categoria'
  ];
  const valores = [
    data.id_producto, data.nombre_producto, data.descripcion,
    data.precio_unitario, data.stock_actual, data.fecha_ingreso, data.id_categoria
  ];
  const columnasOracle = [...columnas];
  valores[5] = data.fecha_ingreso; // fecha_ingreso

  const sql = `
    INSERT INTO ${tabla} (
      ${columnas.join(', ')}
    ) VALUES (
      :1, :2, :3, :4, :5, TO_DATE(:6, 'YYYY-MM-DD'), :7
    )
  `;
  await require('../db').ejecutar(sql, valores);
}

async function actualizarProducto(id, data) {
  const columnas = [
    'nombre_producto', 'descripcion', 'precio_unitario',
    'stock_actual', 'fecha_ingreso', 'id_categoria'
  ];
  const valores = [
    data.nombre_producto, data.descripcion, data.precio_unitario,
    data.stock_actual, data.fecha_ingreso, data.id_categoria, id
  ];
  const sql = `
    UPDATE ${tabla}
    SET nombre_producto = :1, descripcion = :2, precio_unitario = :3,
        stock_actual = :4, fecha_ingreso = TO_DATE(:5, 'YYYY-MM-DD'),
        id_categoria = :6
    WHERE id_producto = :7
  `;
  await require('../db').ejecutar(sql, valores);
}

async function eliminarProducto(id) {
  await remove(tabla, 'id_producto', id);
}

module.exports = {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};
