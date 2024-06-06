let pgPool;

const saveAccessToken = (accessToken, userID, cbFunc) => {
  const getUserQuery = {
    text: 'INSERT INTO public.access_tokens (access_token, user_id) VALUES ($1, $2)',
    values: [accessToken, userID],
  };

  pgPool.query(getUserQuery, (response) => {
    cbFunc(response.error);
  });
};

const getUserIDFromBearerToken = (bearerToken, cbFunc) => {
  const getUserIDQuery = {
    text: 'SELECT * FROM public.access_tokens WHERE access_token = $1;',
    values: [bearerToken],
  };

  pgPool.query(getUserIDQuery, (response) => {
    const userID =
      response.results && response.results.rowCount == 1
        ? response.results.rows[0].user_id
        : null;

    cbFunc(userID);
  });
};

module.exports = (injectedPgPool) => {
  pgPool = injectedPgPool;
  return {
    saveAccessToken,
    getUserIDFromBearerToken,
  }
};
