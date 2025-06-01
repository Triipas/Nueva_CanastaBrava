// controllers/productosController.js
const productosModel = require('../models/productosModel');

async function listar(req, res) {
  try {
    const productos = await productosModel.obtenerProductos();
    res.json(productos);
  } catch (err) {
    res.status(500).send({ error: 'Error al listar productos' });
  }
}

async function crear(req, res) {
  await productosModel.crearProducto(req.body);
  res.send({ mensaje: 'Producto creado' });
}

async function actualizar(req, res) {
  const id = req.params.id;
  await productosModel.actualizarProducto(id, req.body);
  res.send({ mensaje: 'Producto actualizado' });
}

async function eliminar(req, res) {
  const id = req.params.id;
  await productosModel.eliminarProducto(id);
  res.send({ mensaje: 'Producto eliminado' });
}

module.exports = {
  listar,
  crear,
  actualizar,
  eliminar,
};
