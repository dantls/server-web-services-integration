import pool from './database/pg.js';

async function checkBilleds(){

    const client = await pool.connect();

      const sql = `SELECT O.DESCRIPTION AS ORDER
                  FROM   SERVICES S
                        INNER JOIN ORDERS O
                                ON S.ID_ORDER = O.ID
                        INNER JOIN SITUATIONS SIT
                                ON S.ID_SITUATION = SIT.ID
                  WHERE  SIT.DESCRIPTION = 'Faturado'
                        AND S.FINAL_DATE IS NULL `;
         
    const {rows} = await client.query(sql,[]);

    client.release();

    return rows
}

export {checkBilleds}

 