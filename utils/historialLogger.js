const { ejecutar } = require('../db');

async function registrarHistorial({ tabla, accion, id_afectado, cambios, usuario = 'sistema' }) {
  const sql = `
    INSERT INTO historial_cambios (tabla, accion, id_afectado, cambios, usuario)
    VALUES (:tabla, :accion, :id_afectado, :cambios, :usuario)
  `;
  await ejecutar(sql, {
    tabla,
    accion,
    id_afectado: id_afectado.toString(),
    cambios: JSON.stringify(cambios, null, 2),
    usuario
  });
}

module.exports = { registrarHistorial };
