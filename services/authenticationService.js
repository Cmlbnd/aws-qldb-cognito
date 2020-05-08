const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

const authConfig = require('../config/authentication');
const authMethods = require('../services/methods/authenticationMethods')
// const qldbMethods = require("../modules/qldbMethods");

const jwt_decode = require('jwt-decode');
const usersRegistered = require('../config/users');


const createUser = (username, firstName, lastName, email, password, phoneNumber, address, postalCode, city, country) => new Promise(async function (resolve, reject) {

    var userPool = await authMethods.getUserPool()
    var authenticationData = {
        Username: username,
        Password: password
    };
    var attributeList = [];

    var dataName = {
        Name: 'name',
        Value: `${firstName} ${lastName}`,
    };
    var dataGivenName = {
        Name: 'given_name',
        Value: firstName,
    };
    var dataFamilyName = {
        Name: 'family_name',
        Value: lastName,
    };
    var dataEmail = {
        Name: 'email',
        Value: email,
    };
    var dataPhoneNumber = {
        Name: 'phone_number',
        Value: phoneNumber,
    };


    var attributeName = new AmazonCognitoIdentity.CognitoUserAttribute(dataName);
    var attributeGivenName = new AmazonCognitoIdentity.CognitoUserAttribute(dataGivenName);
    var attributeFamilyName = new AmazonCognitoIdentity.CognitoUserAttribute(dataFamilyName);
    var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
    var attributePhoneNumber = new AmazonCognitoIdentity.CognitoUserAttribute(dataPhoneNumber);

    attributeList.push(attributeName);
    attributeList.push(attributeGivenName);
    attributeList.push(attributeFamilyName);
    attributeList.push(attributeEmail);
    attributeList.push(attributePhoneNumber);

    await userPool.signUp(authenticationData.Username, authenticationData.Password, attributeList, null, async function (err, result) {
        if (err) {
            reject(err);
        }
        await authMethods.confirmSignUp(authenticationData.Username);
        await authMethods.addToGroups(authenticationData.Username, authConfig.cognitoUserGroup);
        resolve({ status: 'OK' });
    });
});

var login = (cognitoUser, authenticationDetails) => new Promise(function (resolve, reject) {

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            var accessToken = result.getAccessToken().getJwtToken();
            var idToken = result.idToken.jwtToken;

            resolve({ accessToken, cognitoUser, idToken });
        },
        onFailure: function (err) {
            console.log(err);
            reject(err)
        },
        mfaRequired: function (codeDeliveryDetails) {
            var verificationCode = prompt('Please input verification code', '');
            cognitoUser.sendMFACode(verificationCode, this);
            reject(cognitoUser);
        },
        newPasswordRequired: function (userAttributes, requiredAttributes) {
            cognitoUser.completeNewPasswordChallenge(newPassword, attributesData, this)
            reject(cognitoUser);
        }
    });
});

const authenticate = async function (username, password) {
    var userPool = await authMethods.getUserPool()
    var cognitoUser = await authMethods.getCognitoUser(username, userPool)
    var authenticationDetails = await authMethods.getAuthenticationDetails(username, password)

    var result = await login(cognitoUser, authenticationDetails)

    // create QLDB user if it doesn't exist
    let idToken = jwt_decode(result.idToken);
    let qldbUserDocumentId = await qldbMethods.createUser(idToken.sub, idToken.given_name, idToken.family_name, idToken['cognito:groups']);
    if(qldbUserDocumentId) {
        await usersRegistered.setRegisteredUsers();
    }
    return { "token_type": "Bearer", "scope": "", "expires_in": 3599, "ext_expires_in": 3599, "access_token": result.idToken };
}


var validateToken = (req, res, next) => {
    let accessTokenFromClient = req.bearerToken;
    //Fail if token not present in header. 
    if (!accessTokenFromClient) return res.status(401).send("Access Token missing from header");

    authConfig.cognitoExpress.validate(accessTokenFromClient, function (err, response) {

        //If API is not authenticated, Return 401 with error message. 
        if (err) return res.status(401).send(err);

        //Else API has been authenticated. Proceed.
        req.user = response;
        // console.log(response);
        next();
    });
}

module.exports = {
    createUser,
    authenticate,
    validateToken
}


