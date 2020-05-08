var AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const authConfig = require('../../config/authentication');

var getUserPool = () => new Promise(function(resolve, reject) {
	var poolData = {
			UserPoolId : authConfig.cognitoUserPoolId, 
    		ClientId : authConfig.cognitoClientId
    	};
  	var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  	resolve(userPool);
	});

var confirmSignUp = (username) => new Promise(function(resolve, reject) {
    var confirmParams = {
			UserPoolId : authConfig.cognitoUserPoolId, 
            Username: username
          };
          
     authConfig.cognitoIdentityServiceProvider.adminConfirmSignUp(confirmParams, function(err, data) {
            if (err) reject(err); 
            resolve();
        });
});

var addToGroups = (username,role) => new Promise(function(resolve, reject) {
    var params = {
      GroupName: role, 
      UserPoolId: authConfig.cognitoUserPoolId,
      Username: username
    };
    authConfig.cognitoIdentityServiceProvider.adminAddUserToGroup(params, function(err, data) {
      if (err) reject(err);
      else  resolve(data);
    });
})

module.exports = {
	getUserPool,
	confirmSignUp

}