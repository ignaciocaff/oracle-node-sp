import { logger } from "./CustomLogger";

// tslint:disable-next-line: no-var-requires
const oracledb = require('oracledb');
const numRows = 100000;
export class StoreProcedureDb {
  public name: string;
  public parameters: any[];
  public size: number;
  public autoCommit: boolean;

  public constructor(name: string, parameters?: any[], autoCommit?: boolean) {
    this.name = name;
    this.parameters = parameters;
    this.autoCommit = autoCommit;
  }

  public async executeSp(): Promise<any> {
    let connection;
    try {
      connection = await oracledb.getConnection();
      let stringParams: string = '';
      const valueParams: { [k: string]: any } = {};
      const size = this.parameters ? this.parameters.length || 0 : 0;
      if (this.parameters) {
        for (let i = 0; i < size; i++) {
          if (i === size - 1) {
            stringParams += `:${i}`;
            valueParams[i] = { val: this.parameters[i] };
          } else {
            stringParams += `:${i},`;
            valueParams[i] = { val: this.parameters[i] };
          }
        }
      }
      valueParams['cursor'] = { type: oracledb.CURSOR, dir: oracledb.BIND_OUT };
      const execution = this.parameters && this.parameters.length ? `${this.name}(:cursor,${stringParams});` : `${this.name}(:cursor);`;
      logger.info(this.parameters && this.parameters.length ? `${execution} Params values: ${JSON.stringify(this.parameters)}` : `${execution}`);
      const result = await connection.execute(
        `BEGIN
               ${execution}
               END;`,
        valueParams,
        { autoCommit: this.autoCommit }
      );
      const resultSet = result.outBinds.cursor;
      let rows;
      rows = await resultSet.getRows(numRows);
      await resultSet.close();
      return rows;
    } catch (err) {
      logger.error(err);
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          logger.error(err);
        }
      }
    }
  }

  public async executeSpTransactional(connection: any): Promise<any> {
    try {
      let stringParams: string = '';
      const valueParams: { [k: string]: any } = {};
      const size = this.parameters ? this.parameters.length || 0 : 0;
      if (this.parameters) {
        for (let i = 0; i < size; i++) {
          if (i === size - 1) {
            stringParams += `:${i}`;
            valueParams[i] = { val: this.parameters[i] };
          } else {
            stringParams += `:${i},`;
            valueParams[i] = { val: this.parameters[i] };
          }
        }
      }
      valueParams['cursor'] = { type: oracledb.CURSOR, dir: oracledb.BIND_OUT };
      const execution = this.parameters && this.parameters.length ? `${this.name}(:cursor,${stringParams});` : `${this.name}(:cursor);`;
      logger.info(this.parameters && this.parameters.length ? `${execution} Params values: ${JSON.stringify(this.parameters)}` : `${execution}`);
      const result = await connection.execute(
        `BEGIN
               ${execution}
               END;`,
        valueParams
      );
      const resultSet = result.outBinds.cursor;
      let rows;
      rows = await resultSet.getRows(numRows);
      await resultSet.close();
      return rows;
    } catch (err) {
      logger.error(err);
    }
  }
}

async function closePoolAndExit() {
  logger.info('\nTerminando..');
  try {
    await oracledb.getPool().close(10);
    logger.info('Pool cerrado');
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
process
  .once('SIGTERM', closePoolAndExit)
  .once('SIGINT', closePoolAndExit)