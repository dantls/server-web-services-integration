process.env.ORA_SDTZ = 'UTC';

import fs from 'fs';
import oracledb from 'oracledb';
import dbConfig from './database/oracle.js';


let libPath;
if (process.platform === 'win64') {           // Windows
  libPath = 'C:\\instantclient_12_2';
} 
if (libPath && fs.existsSync(libPath)) {
  oracledb.initOracleClient({ libDir: libPath });
}

export async function verifyOrder(order) {
  let connection, result;

  try {

    let sql, binds, options;

    connection = await oracledb.getConnection(dbConfig);

    //
    // Query the data
    //

    sql =  `SELECT  ORD.NROORD,
                    COALESCE(PENDENCY,PENDENCY2, 0) AS PENDENCY
            FROM    WMS_ORDENTSAI ORD
                    LEFT JOIN (SELECT ORD.NROORD,
                                      COALESCE(1, 0) AS PENDENCY
                              FROM   WMS_ORDENTSAI ORD
                                      LEFT JOIN WMS_ORDSVC SVC
                                            ON SVC.IDCLOT = ORD.IDCLOT
                              WHERE  NROORD = :1
                                      AND SVC.IDCATV = 2
                                      AND SVC.IDCSITATV <> 6
                                      AND SVC.IDCNVLENDORI = 6) SVC1
                          ON SVC1.NROORD = ORD.NROORD
                          
                    LEFT JOIN (SELECT ORD.NROORD,
                                      COALESCE(1, 0) AS PENDENCY2
                              FROM   WMS_ORDENTSAI ORD
                                      LEFT JOIN WMS_ORDSVC SVC
                                            ON SVC.IDCLOT = ORD.IDCLOT
                              WHERE  ORD.NROORD = :1
                                      AND SVC.IDCATV = 5
                                      AND SVC.IDCSITATV <> 6) SVC2
                          ON SVC2.NROORD = ORD.NROORD              
              WHERE  ORD.NROORD = :1 `;
              
    binds = [ order ];

    options ={
      bindDefs: [
        { type: oracledb.STRING, maxSize: 6 }
      ],
      outFormat: oracledb.OUT_FORMAT_OBJECT, 

    }

    result = await connection.execute(sql, binds, options);

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
  
  return result.rows[0];
}