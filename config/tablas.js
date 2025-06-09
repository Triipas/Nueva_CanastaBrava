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
    sucursales: {
    tabla: 'sucursales',
    primaryKey: 'id_sucursal',
    campos: {
      id_sucursal:      { tipo: 'number', requerido: true },
      nombre_almacen:   { tipo: 'string', requerido: true },
      dirección:        { tipo: 'string', requerido: false },
      capacidad_maxima: { tipo: 'number', requerido: false }
    },
    camposSelect: `
      id_sucursal,
      nombre_almacen,
      dirección,
      capacidad_maxima
    `,
    camposBusqueda: {
      id_sucursal:      { tipo: 'exact' },
      nombre_almacen:   { tipo: 'textLike' },
      dirección:        { tipo: 'textLike' },
      capacidad_maxima: { tipo: 'exact' }
    },
    camposOrden: [
      'id_sucursal',
      'nombre_almacen',
      'dirección',
      'capacidad_maxima'
    ]
  },
    personal: {
    tabla: 'personal',
    primaryKey: 'id_personal',
    campos: {
      id_personal:        { tipo: 'number', requerido: true },
      nombre:             { tipo: 'string', requerido: true },
      apellido:           { tipo: 'string', requerido: true },
      cargo:              { tipo: 'string', requerido: false },
      fecha_contratacion: { tipo: 'date',   requerido: false },
      id_sucursal:        { tipo: 'number', requerido: false } // es FK pero opcional desde el frontend
    },
    camposSelect: `
      id_personal,
      nombre,
      apellido,
      cargo,
      TO_CHAR(fecha_contratacion, 'YYYY-MM-DD') AS fecha_contratacion,
      id_sucursal
    `,
    camposBusqueda: {
      id_personal:        { tipo: 'exact' },
      nombre:             { tipo: 'textLike' },
      apellido:           { tipo: 'textLike' },
      cargo:              { tipo: 'textLike' },
      fecha_contratacion: { tipo: 'dateRange' },
      id_sucursal:        { tipo: 'exact' }
    },
    camposOrden: [
      'id_personal',
      'nombre',
      'apellido',
      'cargo',
      'fecha_contratacion',
      'id_sucursal'
    ]
  },
    proveedores: {
    tabla: 'proveedores',
    primaryKey: 'id_proveedor',
    campos: {
      id_proveedor:     { tipo: 'number', requerido: true },
      nombre_proveedor: { tipo: 'string', requerido: true },
      contacto:         { tipo: 'string', requerido: false },
      ubicacion:        { tipo: 'string', requerido: false }
    },
    camposSelect: `
      id_proveedor,
      nombre_proveedor,
      contacto,
      ubicacion
    `,
    camposBusqueda: {
      id_proveedor:     { tipo: 'exact' },
      nombre_proveedor: { tipo: 'textLike' },
      contacto:         { tipo: 'textLike' },
      ubicacion:        { tipo: 'textLike' }
    },
    camposOrden: [
      'id_proveedor',
      'nombre_proveedor',
      'contacto',
      'ubicacion'
    ]
  },
    ordenes_compra: {
    tabla: 'ordenes_compra',
    primaryKey: 'id_orden',
    campos: {
      id_orden:      { tipo: 'number', requerido: true },
      fecha_orden:   { tipo: 'date',   requerido: false },
      id_proveedor:  { tipo: 'number', requerido: false },
      estado:        { tipo: 'string', requerido: false },
      id_personal:   { tipo: 'number', requerido: false }
    },
    camposSelect: `
      id_orden,
      TO_CHAR(fecha_orden, 'YYYY-MM-DD') AS fecha_orden,
      id_proveedor,
      estado,
      id_personal
    `,
    camposBusqueda: {
      id_orden:     { tipo: 'exact' },
      fecha_orden:  { tipo: 'dateRange' },
      id_proveedor: { tipo: 'exact' },
      estado:       { tipo: 'textLike' },
      id_personal:  { tipo: 'exact' }
    },
    camposOrden: [
      'id_orden',
      'fecha_orden',
      'id_proveedor',
      'estado',
      'id_personal'
    ]
  },
    recepcion_productos: {
    tabla: 'recepcion_productos',
    primaryKey: 'id_recepcion',
    campos: {
      id_recepcion:    { tipo: 'number', requerido: true },
      id_producto:     { tipo: 'number', requerido: false },
      fecha_recepcion: { tipo: 'date',   requerido: false },
      id_sucursal:     { tipo: 'number', requerido: false }
    },
    camposSelect: `
      id_recepcion,
      id_producto,
      TO_CHAR(fecha_recepcion, 'YYYY-MM-DD') AS fecha_recepcion,
      id_sucursal
    `,
    camposBusqueda: {
      id_recepcion:    { tipo: 'exact' },
      id_producto:     { tipo: 'exact' },
      fecha_recepcion: { tipo: 'dateRange' },
      id_sucursal:     { tipo: 'exact' }
    },
    camposOrden: [
      'id_recepcion',
      'id_producto',
      'fecha_recepcion',
      'id_sucursal'
    ]
  },
    inventario: {
    tabla: 'inventario',
    primaryKey: 'id_movimiento',
    campos: {
      id_movimiento:  { tipo: 'number', requerido: true },
      id_producto:    { tipo: 'number', requerido: false },
      cantidad:       { tipo: 'number', requerido: false },
      id_responsable: { tipo: 'number', requerido: false }
    },
    camposSelect: `
      id_movimiento,
      id_producto,
      cantidad,
      id_responsable
    `,
    camposBusqueda: {
      id_movimiento:  { tipo: 'exact' },
      id_producto:    { tipo: 'exact' },
      cantidad:       { tipo: 'exact' },
      id_responsable: { tipo: 'exact' }
    },
    camposOrden: [
      'id_movimiento',
      'id_producto',
      'cantidad',
      'id_responsable'
    ]
  },
    estados_productos: {
    tabla: 'estados_productos',
    primaryKey: 'id_estado',
    campos: {
      id_estado:   { tipo: 'number', requerido: true },
      estado:      { tipo: 'string', requerido: false },
      id_producto: { tipo: 'number', requerido: false }
    },
    camposSelect: `
      id_estado,
      estado,
      id_producto
    `,
    camposBusqueda: {
      id_estado:   { tipo: 'exact' },
      estado:      { tipo: 'textLike' },
      id_producto: { tipo: 'exact' }
    },
    camposOrden: [
      'id_estado',
      'estado',
      'id_producto'
    ]
  },
    registro_caducidad: {
    tabla: 'registro_caducidad',
    primaryKey: 'id_caducidad',
    campos: {
      id_caducidad:      { tipo: 'number', requerido: true },
      id_producto:       { tipo: 'number', requerido: true },
      fecha_caducidad:   { tipo: 'date',   requerido: false },
      estado_caducidad:  { tipo: 'string', requerido: false }
    },
    camposSelect: `
      id_caducidad,
      id_producto,
      TO_CHAR(fecha_caducidad, 'YYYY-MM-DD') AS fecha_caducidad,
      estado_caducidad
    `,
    camposBusqueda: {
      id_caducidad:     { tipo: 'exact' },
      id_producto:      { tipo: 'exact' },
      fecha_caducidad:  { tipo: 'dateRange' },
      estado_caducidad: { tipo: 'textLike' }
    },
    camposOrden: [
      'id_caducidad',
      'id_producto',
      'fecha_caducidad',
      'estado_caducidad'
    ]
  },
  stock_minimo_maximo: {
    tabla: 'Stock_Minimo_Maximo',
    primaryKey: 'id_producto',
    campos: {
      id_producto:   { tipo: 'number', requerido: true },
      stock_minimo:  { tipo: 'number', requerido: true },
      stock_maximo:  { tipo: 'number', requerido: true }
    },
    camposSelect: `
      id_producto,
      stock_minimo,
      stock_maximo
    `,
    camposBusqueda: {
      id_producto:  { tipo: 'exact' },
      stock_minimo: { tipo: 'exact' },
      stock_maximo: { tipo: 'exact' }
    },
    camposOrden: [
      'id_producto',
      'stock_minimo',
      'stock_maximo'
    ]
  },
};

module.exports = configuracionTablas;
