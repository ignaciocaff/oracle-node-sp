const oracledb = require('oracledb');

const numRows = 100000;
export const testDB = async () => {
  async function run() {
    let connection;

    try {
      connection = await oracledb.getConnection();

      const result = await connection.execute(
        `BEGIN
         PR_OBTENER_ESTADOS(:id, :cursor);
         END;`,
        {
          id: 1,
          cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
        },
      );

      const resultSet = result.outBinds.cursor;
      let rows;
      do {
        rows = await resultSet.getRows(numRows);
        if (rows.length > 0) {
          // console.log("getRows(): Got " + rows.length + " rows");
          // console.log(rows);
        }
      } while (rows.length === numRows);
      await resultSet.close();
    } catch (err) {
      // console.error(err);
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          // console.error(err);
        }
      }
    }
  }

  run();
};
