// app.js actualizado
const express = require('express');
const cors = require('cors');
const path = require('path');
const { createRoutes } = require('./routes/genericRoutes');
const configuracionTablas = require('./config/tablas');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
  res.redirect('/productos');
});

// Servir el HTML dinámico para todas las entidades
app.get('/:entidad', (req, res, next) => {
  const entidad = req.params.entidad;
  if (configuracionTablas[entidad]) {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // o el nombre real de tu archivo HTML
  } else {
    next(); // Para que si no existe la entidad, dé 404
  }
});

// Crear rutas automáticamente para todas las entidades configuradas
Object.keys(configuracionTablas).forEach(entidad => {
  const routes = createRoutes(entidad);
  app.use(`/${entidad}`, routes);
  console.log(`Rutas creadas para: /${entidad}`);
});

// Ruta para obtener metadatos de las entidades (útil para el frontend)
app.get('/metadata', (req, res) => {
  const metadata = {};
  Object.keys(configuracionTablas).forEach(entidad => {
    metadata[entidad] = {
      campos: configuracionTablas[entidad].campos,
      primaryKey: configuracionTablas[entidad].primaryKey,
      camposBusqueda: configuracionTablas[entidad].camposBusqueda,
      camposOrden: configuracionTablas[entidad].camposOrden
    };
  });
  res.json(metadata);
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
  console.log('Entidades disponibles:', Object.keys(configuracionTablas));
});

// utils/validationUtils.js - Utilidad adicional para validaciones
const validationUtils = {
  isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
  },

  isValidNumber(value) {
    return !isNaN(value) && isFinite(value);
  },

  sanitizeString(str) {
    if (typeof str !== 'string') return str;
    return str.trim();
  },

  validateFieldType(value, tipo) {
    switch (tipo) {
      case 'number':
        return this.isValidNumber(value);
      case 'date':
        return this.isValidDate(value);
      case 'string':
      case 'clob':
        return typeof value === 'string';
      default:
        return true;
    }
  }
};



module.exports = validationUtils;