// config/tablas.js
const configuracionTablas = {
  productos: {
    tabla: 'productos',
    primaryKey: 'id_producto',
    campos: { //OPCIONAL = FALSE //TRUE = REQUERIDO
      id_producto:     { tipo: 'number', requerido: true },
      nombre_producto: { tipo: 'string', requerido: true },
      descripcion:     { tipo: 'clob',   requerido: false },
      precio_unitario: { tipo: 'number', requerido: false },
      fecha_ingreso:   { tipo: 'date',   requerido: false },
      id_categoria:    { tipo: 'number', requerido: false }
    },
    camposSelect: `
      id_producto,
      nombre_producto,
      TO_CHAR(descripcion) AS descripcion,
      precio_unitario,
      TO_CHAR(fecha_ingreso, 'YYYY-MM-DD') AS fecha_ingreso,
      id_categoria
    `,
    camposBusqueda: {
      fecha_ingreso:   { tipo: 'dateRange' },
      descripcion:     { tipo: 'textLike' },
      nombre_producto: { tipo: 'textLike' },
      id_producto:     { tipo: 'exact' },
      precio_unitario: { tipo: 'exact' },
      id_categoria:    { tipo: 'exact' }
    },
    camposOrden: [
      'id_producto',
      'nombre_producto',
      'descripcion',
      'precio_unitario',
      'fecha_ingreso',
      'id_categoria'
    ]
  },
   categorias: {
    tabla: 'categorias',
    primaryKey: 'id_categoria',
    campos: {
      id_categoria:     { tipo: 'number', requerido: true },
      nombre_categoria: { tipo: 'string', requerido: true },
      descripcion:      { tipo: 'clob',   requerido: false }
    },
    camposSelect: `
      id_categoria,
      nombre_categoria,
      TO_CHAR(descripcion) AS descripcion
    `,
    camposBusqueda: {
      id_categoria:     { tipo: 'exact' },
      nombre_categoria: { tipo: 'textLike' },
      descripcion:      { tipo: 'textLike' }
    },
    camposOrden: [
      'id_categoria',
      'nombre_categoria',
      'descripcion'
    ]
  },
};

module.exports = configuracionTablas;
