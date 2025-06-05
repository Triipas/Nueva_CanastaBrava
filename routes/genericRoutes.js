// routes/genericRoutes.js
const express = require('express');
const { createController } = require('../controllers/genericController');

function createRoutes(entidad) {
  const router = express.Router();
  const controller = createController(entidad);

  router.get('/paginar', controller.listarPaginado);
  router.get('/', controller.listar);
  router.post('/', controller.crear);
  router.put('/:id', controller.actualizar);
  router.delete('/:id', controller.eliminar);

  return router;
}

module.exports = { createRoutes };