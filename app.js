// app.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
const productosRoutes = require('./routes/productosRoutes');
app.use('/productos', productosRoutes);

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
