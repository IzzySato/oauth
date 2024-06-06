'use strict';
let userDB;

const sendResponse = (res, message, error) => {
  res.status(error !== undefined ? 400 : 200).json({
    message: message,
    error: error,
  });
};

const registerUser = (req, res) => {
  userDB.isValidUser(req.body.username, (error, isValidUser) => {
    if (error || !isValidUser) {
      const message = error
        ? 'isValid Something went wrong!'
        : 'This user already exists!';
      if (error) {
        console.log(error)
      }

      sendResponse(res, message, error);
      return;
    }

    userDB.register(req.body.username, req.body.password, (response) => {
      sendResponse(
        res,
        response.error === undefined ? 'Success!!' : 'register Something went wrong!',
        response.error
      );
    });
  });
};

const login = (query, res) => {};

module.exports = (injectedUserDB) => {
  userDB = injectedUserDB;
  return {
    registerUser,
    login,
  };
};
