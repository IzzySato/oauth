'use strict';

const Pool = require('pg').Pool;
const {
  DB_USER = 'postgres',
  DB_HOST = 'localhost',
  DB_NAME = 'oauth2',
  DB_PASSWORD = 'postgres',
  DB_PORT = 5432,
  DB_SCHEMA = 'public',
} = process.env;

const setResponse = (error, results) => {
  if (error) {
    return { success: false, message: error.message };
  }
  return { success: true, rows: results.rows };
};

const query = (queryString, cbFunc) => {
  const pool = new Pool({
    user: DB_USER,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    port: DB_PORT,
  });

  pool.query(`SET search_path TO ${DB_SCHEMA};`, (error) => {
    if (error) {
      console.error('Error setting search path:', error);
      cbFunc(setResponse(error, null));
      pool.end();
      return;
    }

    pool.query(queryString, (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
      } else {
        console.log('Query results:', results.rows);
      }
      cbFunc(setResponse(error, results));
      pool.end();
    });
  });

  pool.on('connect', () => {
    console.log('Connected to the PostgreSQL database');
  });

  pool.on('error', (err) => {
    console.log('Unexpected error on idle client', err);
    process.exit(-1);
  });
};

module.exports = {
  query
};
