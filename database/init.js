const { Client } = require('pg');
const logger = require('../lib/logger');
const {
  DB: { USERS, ACCESS_TOKENS },
} = require('./constants');
const { query } = require('./pgPool');

// Destructure process.env with default values
const {
  DB_SUPERUSER = 'postgres',
  DB_HOST = 'localhost',
  DB_NAME = 'oauth2',
  DB_PASSWORD = 'postgres',
  DB_PORT = 5432,
  DB_SCHEMA = 'public',
} = process.env;

// Function to create the database if it does not exist
const createDatabaseIfNotExists = async () => {
  const client = new Client({
    user: DB_SUPERUSER,
    host: DB_HOST,
    password: DB_PASSWORD,
    port: DB_PORT,
  });

  try {
    await client.connect();
    const query = {
      text: 'SELECT 1 FROM pg_database WHERE datname = $1',
      values: [DB_NAME],
    };
    const res = await client.query(query);
    if (res.rowCount === 0) {
      const createQuery = {
        text: 'CREATE DATABASE $1',
        values: [DB_NAME],
      };
      await client.query(createQuery);
      logger.info(`Database ${DB_NAME} created successfully.`);
    } else {
      logger.info(`Database ${DB_NAME} already exists..`);
    }
  } catch (err) {
    logger.error(`Error checking/creating database: ${err.toString()}`);
  } finally {
    await client.end();
  }
};

// Function to create the users table
const createTable = (tableName, cbFunc) => {
  const createQuery = {
    text: 'CREATE TABLE $1 \
    (id SERIAL PRIMARY KEY, \
      username VARCHAR(100) NOT NULL, \
      password VARCHAR(100) NOT NULL);',
    values: [tableName],
  };
  query(createQuery, cbFunc);
};

const checkTableExists = (tableName, cbFunc) => {
  const checkQuery = {
    text: 'SELECT table_name FROM information_schema.tables \
    WHERE table_schema = $1 AND table_name = $2',
    values: [DB_SCHEMA, tableName],
  };
  query(checkQuery, cbFunc);
};

// Check and create tables if they do not exist
const checkAndCreateTables = (tableName) => {
  checkTableExists(tableName, (response) => {
    if (response.success) {
      if (response.rows.length > 0) {
        logger.info(`Table "${DB_SCHEMA}.${tableName}" exists.`);
      } else {
        logger.info(
          `Table "${DB_SCHEMA}.${tableName}" does not exist. Creating table...`
        );
        createTable(tableName, (createResponse) => {
          if (createResponse.success) {
            logger.info(
              `Table "${DB_SCHEMA}.${tableName}" created successfully.`
            );
          } else {
            logger.error(`Error creating table: ${createResponse.message}`);
          }
        });
      }
    } else {
      logger.error(`Error checking table existence: ${response.message}`);
    }
  });
};

// Run the process to check/create database and then check/create tables
const run = async () => {
  await createDatabaseIfNotExists();
  checkAndCreateTables(USERS.TABLE_NAME);
  checkAndCreateTables(ACCESS_TOKENS.TABLE_NAME);
};

run();
