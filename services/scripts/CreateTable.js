var amazon_qldb_driver_nodejs = require("amazon-qldb-driver-nodejs");
var LogUtil = require("../../config/helper/LogUtil");
var Util = require("../../config/helper/Util");

async function createTable(txn, tableName) {
    var statement = "CREATE TABLE " + tableName;
    return await txn.executeInline(statement).then(function (result) {
        LogUtil.log("Successfully created table " + tableName + ".");
        return result.getResultList().length;
    });
}

async function createIndex(txn, tableName, indexAttribute) {
    var statement = "CREATE INDEX on " + tableName + " (" + indexAttribute + ")";
    return await txn.executeInline(statement).then(function (result) {
        LogUtil.log("Successfully created index " + indexAttribute + " on table " + tableName + ".");
        return result.getResultList().length;
    });
}

async function insertDocument(txn, tableName, documents) {
    var statement = "INSERT INTO " + tableName + " ?";
    var documentsWriter = amazon_qldb_driver_nodejs.createQldbWriter();
    Util.writeValueAsIon(documents, documentsWriter);
    var result = await txn.executeInline(statement, [documentsWriter]);
    return result;
}

module.exports = {
    createTable,
    createIndex,
    insertDocument
}
