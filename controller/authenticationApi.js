var express = require("express");
var router = express.Router();

var authService = require('../services/authenticationService');
var errors = require('../config/helper/errors');

router.post("/createUser",
  errors.errorWrapper(async function (req, res) {
    const { username, firstName, lastName, email, password, phone, address, postalCode, city, country } = req.body;
    let creationResult = await authService.createUser(username, firstName, lastName, email, password, phone, address, postalCode, city, country);
    // console.log(creationResult);
    res.send(creationResult);
  })
);

router.post("/authenticate",
  errors.errorWrapper(async function (req, res, next) {
    const { username, password } = req.body;
    let loginInfo = await authService.authenticate(username, password);
    // console.log(loginInfo);
    res.send(loginInfo);
  })
);

module.exports = router;