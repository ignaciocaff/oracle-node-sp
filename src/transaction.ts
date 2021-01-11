import { StoreProcedureDb } from './index'
import { logger } from "./CustomLogger";
import { connect } from 'http2';
// tslint:disable-next-line: no-var-requires
const oracledb = require('oracledb');

export class TransactionDb {
    public async executeTransaction(storeProceduresList: StoreProcedureDb[]) {
        let connection;
        try {
            connection = await oracledb.getConnection();
            for (const sp of storeProceduresList) {
                logger.info('Comienzo de transacción, cantidad de SP a ejecutar: ', storeProceduresList.length - 1)
                await sp.executeSpTransactional(connection);
                logger.info('Finalizo la ejecución del SP')
            }
            logger.info('Finalizo la ejecución de la transacción.')
            await connection.commit();
            logger.info('Commiteo la transacción.')
        } catch (e) {
            logger.error('Finalizo la ejecución de la transacción.')
            logger.error('Error:', e)
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
}