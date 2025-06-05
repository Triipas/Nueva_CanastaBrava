// models/genericModel.js
const { getAll, insert, update, remove, getPaginado } = require('../utils/crudGenerico');
const configuracionTablas = require('../config/tablas');

async function obtenerTodos(entidad) {
  const config = configuracionTablas[entidad];
  if (!config) throw new Error(`Configuración no encontrada para: ${entidad}`);
  
  return await getAll(config.tabla, config.camposSelect);
}

async function obtenerPaginados(entidad, pagina, limite, ordenarPor, orden, columna, valor, rango = null) {
  const config = configuracionTablas[entidad];
  if (!config) throw new Error(`Configuración no encontrada para: ${entidad}`);

  let where = '';
  const params = {};

  if (columna && config.camposBusqueda[columna]) {
    const tipoBusqueda = config.camposBusqueda[columna].tipo;
    
    switch (tipoBusqueda) {
      case 'dateRange':
        if (rango && rango.length === 2) {
          where = `WHERE ${columna} BETWEEN TO_DATE(:fechaInicio, 'YYYY-MM-DD') AND TO_DATE(:fechaFin, 'YYYY-MM-DD')`;
          params.fechaInicio = rango[0];
          params.fechaFin = rango[1];
        }
        break;
      
      case 'textLike':
        if (columna === 'descripcion') {
          where = `WHERE UPPER(TO_CHAR(${columna})) LIKE '%' || UPPER(:filtro) || '%'`;
        } else {
          where = `WHERE UPPER(${columna}) LIKE '%' || UPPER(:filtro) || '%'`;
        }
        params.filtro = valor;
        break;
      
      case 'exact':
        where = `WHERE ${columna} = :filtro`;
        params.filtro = valor;
        break;
    }
  }

  return await getPaginado(config.tabla, config.camposSelect, pagina, limite, ordenarPor, orden, where, params);
}

async function crear(entidad, data) {
  const config = configuracionTablas[entidad];
  if (!config) throw new Error(`Configuración no encontrada para: ${entidad}`);

  const columnas = Object.keys(config.campos);
  const valores = columnas.map(col => data[col]);
  
  // Construir SQL dinámicamente
  const placeholders = columnas.map((col, index) => {
    const campo = config.campos[col];
    if (campo.tipo === 'date') {
      return `TO_DATE(:${index + 1}, 'YYYY-MM-DD')`;
    }
    return `:${index + 1}`;
  }).join(', ');

  const sql = `
    INSERT INTO ${config.tabla} (
      ${columnas.join(', ')}
    ) VALUES (
      ${placeholders}
    )
  `;
  
  await require('../db').ejecutar(sql, valores);
}

async function actualizar(entidad, id, data) {
  const config = configuracionTablas[entidad];
  if (!config) throw new Error(`Configuración no encontrada para: ${entidad}`);

  const columnas = Object.keys(config.campos).filter(col => col !== config.primaryKey);
  const valores = columnas.map(col => data[col]);
  valores.push(id); // Agregar el ID al final

  const setClauses = columnas.map((col, index) => {
    const campo = config.campos[col];
    if (campo.tipo === 'date') {
      return `${col} = TO_DATE(:${index + 1}, 'YYYY-MM-DD')`;
    }
    return `${col} = :${index + 1}`;
  }).join(', ');

  const sql = `
    UPDATE ${config.tabla}
    SET ${setClauses}
    WHERE ${config.primaryKey} = :${columnas.length + 1}
  `;
  
  await require('../db').ejecutar(sql, valores);
}

async function eliminar(entidad, id) {
  const config = configuracionTablas[entidad];
  if (!config) throw new Error(`Configuración no encontrada para: ${entidad}`);
  
  await remove(config.tabla, config.primaryKey, id);
}

module.exports = {
  obtenerTodos,
  obtenerPaginados,
  crear,
  actualizar,
  eliminar
};