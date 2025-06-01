const oracledb = require('oracledb');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const dbConfig = {
  user: 'usuario02',
  password: 'oracle',
  connectString: 'localhost/XEPDB1',
};

async function ejecutar(sql, binds = [], autoCommit = true) {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(sql, binds, { autoCommit });
    return result;
  } catch (err) {
    console.error('Error en DB:', err);
    throw err;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

module.exports = { ejecutar };
