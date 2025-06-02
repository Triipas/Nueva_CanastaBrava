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

async function listarPaginado(req, res) {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 10;
    const ordenarPor = req.query.ordenarPor || 'id_producto';
    const orden = req.query.orden || 'ASC';

    const columna = req.query.columna;
    const valor = req.query.valor;

    let rango = null;

    if (columna === 'fecha_ingreso' && valor?.includes('|')) {
      rango = valor.split('|').map(f => f.trim());
    }

    const resultado = await productosModel.obtenerProductosPaginados(
      pagina, limite, ordenarPor, orden, columna, valor, rango
    );

    res.json({
      productos: resultado.datos,
      total: resultado.total,
      pagina,
      limite,
      paginas: Math.ceil(resultado.total / limite)
    });
  } catch (err) {
    console.error('Error al paginar productos:', err);
    res.status(500).send({ error: 'Error al paginar productos' });
  }
}

module.exports = {
  listar,
  listarPaginado,
  crear,
  actualizar,
  eliminar,
};
