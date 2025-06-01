const express = require('express');
const cors = require('cors');
const path = require('path');
const { ejecutar } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// CREATE
// ✅ CORREGIDO
app.post('/productos', async (req, res) => {
  const {
    id_producto, nombre_producto, descripcion,
    precio_unitario, stock_actual, fecha_ingreso, id_categoria
  } = req.body;

  await ejecutar(
    `INSERT INTO productos (
      id_producto, nombre_producto, descripcion,
      precio_unitario, stock_actual, fecha_ingreso, id_categoria
    ) VALUES (
      :1, :2, :3, :4, :5, TO_DATE(:6, 'YYYY-MM-DD'), :7
    )`,
    [id_producto, nombre_producto, descripcion, precio_unitario, stock_actual, fecha_ingreso, id_categoria]
  );

  res.send({ mensaje: 'Producto creado' });
});



// READ
app.get('/productos', async (req, res) => {
  try {
    const result = await ejecutar(`
  SELECT 
    id_producto, 
    nombre_producto, 
    TO_CHAR(descripcion) AS descripcion,
    precio_unitario, 
    stock_actual, 
    TO_CHAR(fecha_ingreso, 'YYYY-MM-DD') AS fecha_ingreso,
    id_categoria 
  FROM productos
  ORDER BY id_producto
`);
    res.json(result.rows); // ✅ Solo los datos
  } catch (error) {
    console.error('Error en GET /productos:', error);
    res.status(500).send({ error: 'Error al obtener productos' });
  }
});


// UPDATE
app.put('/productos/:id', async (req, res) => {
  const { nombre_producto, descripcion, precio_unitario, stock_actual, fecha_ingreso, id_categoria } = req.body;
  const { id } = req.params;
  await ejecutar(
    `UPDATE productos 
     SET nombre_producto = :1, descripcion = :2, precio_unitario = :3, stock_actual = :4,
         fecha_ingreso = TO_DATE(:5, 'YYYY-MM-DD'), id_categoria = :6
     WHERE id_producto = :7`,
    [nombre_producto, descripcion, precio_unitario, stock_actual, fecha_ingreso, id_categoria, id]
  );
  res.send({ mensaje: 'Producto actualizado' });
});


// DELETE
app.delete('/productos/:id', async (req, res) => {
  const { id } = req.params;
  await ejecutar('DELETE FROM productos WHERE id_producto = :1', [id]);
  res.send({ mensaje: 'Producto eliminado' });
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
