'use strict';

const crypto = require('crypto');

let pgPool;

const register = (username, password, cbFunc) => {
  const shaPass = crypto.createHash('sha256').update(password).digest('hex');
  const query = {
    text: 'INSERT INTO public.users (username, user_password) VALUES ($1, $2)',
    values: [username, shaPass],
  };
  pgPool.query(query, cbFunc);
};

const getUser = (username, password, cbFunc) => {
  const shaPass = crypto.createHash('sha256').update(password).digest('hex');

  const getUserQuery = {
    text: 'SELECT * FROM public.users WHERE username = $1 AND user_password = $2',
    values: [username, shaPass],
  };

  pgPool.query(getUserQuery, (response) => {
    cbFunc(
      false,
      response.results && response.results.rowCount === 1
        ? response.results.rows[0]
        : null
    );
  });
};

const isValidUser = (username, cbFunc) => {

  const query = {
    text: 'SELECT * FROM public.users WHERE username = $1',
    values: [username],
  };

  const checkUsrcbFunc = (response) => {
    const isValidUser = response.results
      ? response.results.rowCount <= 0
      : null;

    cbFunc(response.error, isValidUser);
  };

  pgPool.query(query, checkUsrcbFunc);
};

module.exports = (injectedPgPool) => {
  pgPool = injectedPgPool;
  return {
    register,
    getUser,
    isValidUser,
  }
};
