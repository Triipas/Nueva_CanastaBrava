// routes/productosRoutes.js
const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');

router.get('/paginar', productosController.listarPaginado);
router.get('/', productosController.listar);
router.post('/', productosController.crear);
router.put('/:id', productosController.actualizar);
router.delete('/:id', productosController.eliminar);

module.exports = router;
