import {Pool} from 'pg';

export default new Pool ({
  max: 20,
  connectionString: `postgres://${process.env.DB_PG_USER}:${process.env.DB_PG_PASSWORD}@${process.env.DB_PG_HOST}:${process.env.DB_PG_PORT}/${process.env.DB_PG_DB}`,
  idleTimeoutMillis: 30000
});
