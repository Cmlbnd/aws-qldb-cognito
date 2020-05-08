const ConnectToLedger = require('./scripts/ConnectToLedger');
const IdentitiesRepository = require('../repository/indentityRepository');
const qldbMethods = require("./methods/qldbMethods.js");
const authMethods = require('./methods/authenticationMethods')
const authConfig = require('../config/authentication');


const getRegisteredUsers = () => new Promise(function(resolve, reject) {
    authConfig.cognitoIdentityServiceProvider.listUsers(authMethods.userPoolId, function(err, data) {
      if (err) reject(err); // an error occurred
      else     resolve(data.Users);           // successful response
    });
});

const getQldbRegisteredUserDetails = async () => {
    var session;

    try {
        let session = await ConnectToLedger.createQldbSession();
        return await session.executeLambda(async (txn) => {
            let result = await IdentitiesRepository.getAllIdentities(txn);
            let identities = {};
            result.getResultList().forEach(async (identity) => {
                let userData = qldbMethods.parseIdentity(qldbMethods.getFieldsValue(identity));
                identities[userData.externalId] = userData;
            });
            return identities;
        });
    }
    catch (e) {
        console.log(`Failed on getRegisteredUserDetails : ${e}`);
        throw e;
    }
    finally {
        ConnectToLedger.closeQldbSession(session);
    }
}

module.exports = {
    getRegisteredUsers,
    getQldbRegisteredUserDetails
}


