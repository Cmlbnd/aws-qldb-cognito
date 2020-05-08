const QueryTable = require('../services/scripts/QueryTable');
const CreateTable = require('../services/scripts/CreateTable');

async function insertNewIdentity(txn, externalId, firstName, lastName, roles) {
    var body = {
        "ExternalId": externalId,
        "FirstName": firstName,
        "LastName": lastName,
        "Name": `${firstName} ${lastName}`,
        "Roles": JSON.stringify(roles)
    }
    console.log("-- INSERT QUERY --", body)
    result = await CreateTable.insertDocument(txn, "IdentitiesTable", body)
    return result;
}

async function getAllIdentities(txn) {
    const query = `SELECT c.data.ExternalId, c.data.Name, c.data.Roles, c.metadata.id as documentId FROM _ql_committed_IdentitiesTable as c`;
    console.log(query);
    var result = await QueryTable.scanTableForDocuments(txn, query);
    return result;
}

module.exports = {
    insertNewIdentity,
    getAllIdentities
}