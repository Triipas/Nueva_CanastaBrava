// utils/crudGenerico.js
const { ejecutar } = require('../db');

async function getAll(tabla, campos = '*') {
  const sql = `SELECT ${campos} FROM ${tabla} ORDER BY 1`;
  const result = await ejecutar(sql);
  return result.rows;
}

async function getPaginado(tabla, campos = '*', pagina = 1, limite = 10) {
  // Asegurar que sean números enteros
  pagina = Number(pagina);
  limite = Number(limite);
  const offset = (pagina - 1) * limite;

  const sqlData = `
    SELECT ${campos} FROM ${tabla}
    ORDER BY 1
    OFFSET :offset ROWS FETCH NEXT :limite ROWS ONLY
  `;

  const sqlCount = `SELECT COUNT(*) AS total FROM ${tabla}`;

  const [data, count] = await Promise.all([
    ejecutar(sqlData, { offset, limite }),
    ejecutar(sqlCount)
  ]);

  return {
    datos: data.rows,
    total: count.rows[0].TOTAL
  };
}

async function insert(tabla, columnas, valores) {
  const placeholders = columnas.map((_, i) => `:${i + 1}`).join(', ');
  const sql = `INSERT INTO ${tabla} (${columnas.join(', ')}) VALUES (${placeholders})`;
  await ejecutar(sql, valores);
}

async function update(tabla, columnas, valores, condicion) {
  const set = columnas.map((col, i) => `${col} = :${i + 1}`).join(', ');
  const sql = `UPDATE ${tabla} SET ${set} WHERE ${condicion}`;
  await ejecutar(sql, valores);
}

async function remove(tabla, campoId, id) {
  const sql = `DELETE FROM ${tabla} WHERE ${campoId} = :1`;
  await ejecutar(sql, [id]);
}

module.exports = { getAll, insert, update, remove, getPaginado };
