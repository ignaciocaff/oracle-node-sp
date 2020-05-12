// tslint:disable-next-line: no-var-requires
const oracledb = require('oracledb');
const numRows = 100000;

export class StoreProcedureDb {
  public name: string;
  public parameters: any[];
  public size: number;

  public constructor(name: string, parameters?: any[]) {
    this.name = name;
    this.parameters = parameters;
  }

  public async executeSp(): Promise<any> {
    let connection;
    try {
      connection = await oracledb.getConnection();
      let stringParams: string = '';
      let valueParams: any[] = [];
      let size = this.parameters.length || 0;
      if (this.parameters) {
        for (let i = 0; i < size; i++) {
          stringParams += `:${i},`;
          valueParams[i] = { [i] : this.parameters[i] };
        }
      }
      valueParams[size] = { [size]: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT } };
      const result = await connection.execute(
        `BEGIN
               ${this.name}(${stringParams}:cursor);
               END;`,
        valueParams,
      );

      const resultSet = result.outBinds.cursor;
      let rows;
      rows = await resultSet.getRows(numRows);
      await resultSet.close();
      return rows;
    } catch (err) {
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {}
      }
    }
  }
}
