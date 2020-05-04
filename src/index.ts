const oracledb = require('oracledb');
const numRows = 100000;

export class StoreProcedureDb {
  public name: string;
  public parameters: any[];

  public constructor(name: string, parameters?: any[]) {
    this.name = name;
    this.parameters = parameters;
  }

  public executeSp = async () => {
    async function run() {
      let connection;

      try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(
          `BEGIN
               ${this.name}(:id, :cursor);
               END;`,
          {
            id: this.parameters[0],
            cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
          },
        );

        const resultSet = result.outBinds.cursor;
        console.log(result.outBinds);
        let rows;
        rows = await resultSet.getRows(numRows);
        await resultSet.close();
        console.log(rows);
      } catch (err) {
        console.error(err);
      } finally {
        if (connection) {
          try {
            await connection.close();
          } catch (err) {
            console.error(err);
          }
        }
      }
    }
  };
}
