'use strict';

const express = require('express');
const dotenv = require('dotenv');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');

const pgPool = require('./database/pgPool');
const tokenDB = require('./database/token')(pgPool);
const userDB = require('./database/user')(pgPool);
// OAuth imports
const oAuthService = require('./auth/tokenService')(userDB, tokenDB);
const oAuth2Server = require('node-oauth2-server');
const authenticator = require('./auth/authenticator')(userDB);

dotenv.config();
const PORT = process.env.PORT || 3001;

const app = express();

app.oauth = oAuth2Server({
  model: oAuthService,
  grants: ['password'],
  debug: true,
});

app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL);
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );
  res.header('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

app.use(
  bodyParser.urlencoded({
    parameterLimit: 100000,
    limit: '150mb',
    extended: true,
  })
);

const routes = require('./routes/auth/index')(
  express.Router(),
  app,
  authenticator
);

app.use('/auth', routes);

app.use((req, res, next) => {
  next(createError(404));
});

pgPool.checkTableExists((response) => {
  if (response.results && response.results.rows.length > 0) {
    console.log('Table "public.users" exists.');
  } else {
    console.log('Table "public.users" does not exist.');
  }
}, 'users');

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
