// controllers/genericController.js
const genericModel = require('../models/genericModel');
const configuracionTablas = require('../config/tablas');

function createController(entidad) {
  const config = configuracionTablas[entidad];
  
  if (!config) {
    throw new Error(`Configuración no encontrada para la entidad: ${entidad}`);
  }

  return {
    async listar(req, res) {
      try {
        const datos = await genericModel.obtenerTodos(entidad);
        res.json(datos);
      } catch (err) {
        console.error(`Error al listar ${entidad}:`, err);
        res.status(500).json({ error: `Error al listar ${entidad}` });
      }
    },

    async crear(req, res) {
      try {
        // Validar campos requeridos
        const errores = validateRequiredFields(req.body, config.campos);
        if (errores.length > 0) {
          return res.status(400).json({ error: 'Campos requeridos faltantes', detalles: errores });
        }

        await genericModel.crear(entidad, req.body);
        res.json({ mensaje: `${entidad} creado exitosamente` });
      } catch (err) {
        console.error(`Error al crear ${entidad}:`, err);
        res.status(500).json({ error: `Error al crear ${entidad}` });
      }
    },

    async actualizar(req, res) {
      try {
        const id = req.params.id;
        await genericModel.actualizar(entidad, id, req.body);
        res.json({ mensaje: `${entidad} actualizado exitosamente` });
      } catch (err) {
        console.error(`Error al actualizar ${entidad}:`, err);
        res.status(500).json({ error: `Error al actualizar ${entidad}` });
      }
    },

    async eliminar(req, res) {
      try {
        const id = req.params.id;
        await genericModel.eliminar(entidad, id);
        res.json({ mensaje: `${entidad} eliminado exitosamente` });
      } catch (err) {
        console.error(`Error al eliminar ${entidad}:`, err);
        res.status(500).json({ error: `Error al eliminar ${entidad}` });
      }
    },

    async listarPaginado(req, res) {
      try {
        const pagina = parseInt(req.query.pagina) || 1;
        const limite = parseInt(req.query.limite) || 10;
        const ordenarPor = req.query.ordenarPor || config.primaryKey;
        const orden = req.query.orden || 'ASC';
        const columna = req.query.columna;
        const valor = req.query.valor;

        // Validar campo de ordenamiento
        if (!config.camposOrden.includes(ordenarPor)) {
          return res.status(400).json({ 
            error: 'Campo de ordenamiento inválido',
            camposPermitidos: config.camposOrden 
          });
        }

        let rango = null;
        if (columna && config.camposBusqueda[columna]?.tipo === 'dateRange' && valor?.includes('|')) {
          rango = valor.split('|').map(f => f.trim());
        }

        const resultado = await genericModel.obtenerPaginados(
          entidad, pagina, limite, ordenarPor, orden, columna, valor, rango
        );

        res.json({
          datos: resultado.datos,
          total: resultado.total,
          pagina,
          limite,
          paginas: Math.ceil(resultado.total / limite),
          entidad
        });
      } catch (err) {
        console.error(`Error al paginar ${entidad}:`, err);
        res.status(500).json({ error: `Error al paginar ${entidad}` });
      }
    }
  };
}

function validateRequiredFields(data, camposConfig) {
  const errores = [];
  
  for (const [campo, config] of Object.entries(camposConfig)) {
    if (config.requerido && (!data[campo] || data[campo] === '')) {
      errores.push(`El campo ${campo} es requerido`);
    }
  }
  
  return errores;
}

module.exports = { createController };