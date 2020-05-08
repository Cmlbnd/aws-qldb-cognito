var cognitoUserPoolId = process.env.COGNITO_USER_POOL_ID;
var cognitoClientId = process.env.COGNITO_CLIENT_ID;
var cognitoUserGroup = process.env.COGNITO_GROUP;
var CognitoExpress = require("cognito-express");
var AWS = require('aws-sdk');

const cognitoExpress = new CognitoExpress({
    region: "eu-west-1",
    cognitoUserPoolId,
    tokenUse: "id", //Possible Values: access | id
    tokenExpiration: 3600000 //Up to default expiration of 1 hour (3600000 ms)
});

let optionsCognito = {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey:  process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
}
var cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider(optionsCognito);


module.exports = {
    cognitoExpress,
    cognitoIdentityServiceProvider,
    cognitoUserPoolId,
    cognitoClientId,
    cognitoUserGroup
};