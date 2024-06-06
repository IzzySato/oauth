'use strict';

let userDB;
let tokenDB;

const getClient = (clientID, clientSecret, cbFunc) => {
  const client = {
    clientID,
    clientSecret,
    grants: null,
    redirectUris: null,
  };

  cbFunc(false, client);
};

const grantTypeAllowed = (clientID, grantType, cbFunc) => {
  cbFunc(false, true);
};

const getUser = (username, password, cbFunc) => {
  userDB.getUser(username, password, cbFunc);
};

const saveAccessToken = (accessToken, clientID, expires, user, cbFunc) => {
  tokenDB.saveAccessToken(accessToken, user.id, cbFunc);
};

const getAccessToken = (bearerToken, cbFunc) => {
  tokenDB.getUserIDFromBearerToken(bearerToken, (userID) => {
    const accessToken = {
      user: {
        id: userID,
      },
      expires: null,
    };

    cbFunc(userID === null, userID === null ? null : accessToken);
  });
};

module.exports = (injectedUserDB, injectedTokenDB) => {
  userDB = injectedUserDB;
  tokenDB = injectedTokenDB;
  return {
    getClient,
    saveAccessToken,
    getUser,
    grantTypeAllowed,
    getAccessToken,
  };
};
