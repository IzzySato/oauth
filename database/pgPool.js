const Pool = require('pg').Pool;

const setResponse = (error, results = null) => {
  return {
    error: error,
    results,
  };
};

const query = (queryString, cbFunc) => {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
  pool.query(queryString, (error, results) => {
    cbFunc(setResponse(error, results));
  });

  pool.on('connect', () => {
    console.log('Connected to the PostgreSQL database');
  });

  pool.on('error', (err) => {
    console.log('Unexpected error on idle client', err);
    // process.exit(-1);
  });
};

const checkTableExists = (cbFunc, tableName) => {
  const checkQuery = {
    text: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1",
    values: [tableName],
  };
  query(checkQuery, cbFunc);
};

module.exports = {
  query,
  checkTableExists,
};
