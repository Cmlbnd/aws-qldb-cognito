var ion_js = require("ion-js");
const ConnectToLedger = require('./ConnectToLedger');
const CreateTable = require('./CreateTable');
const Util = require("../../config/helper/Util.js")

/**
 * Pretty print the Readers in the provided result list.
 * @param resultList The result list containing the Readers to pretty print.
 */
function prettyPrintResultList(resultList) {
    const writer = ion_js.makePrettyWriter();
    resultList.forEach((reader) => {
        writer.writeValues(reader);
    });

    return ion_js.decodeUtf8(writer.getBytes());
}
/**
 * Scan for all the documents in a table.
 * @param txn The {@linkcode TransactionExecutor} for lambda execute.
 * @param tableName The name of the table to operate on.
 * @returns Promise which fulfills with a {@linkcode Result} object.
 */
async function scanTableForDocuments(txn,query) {
    return await txn.executeInline(query).then((result) => {
        return result;
    });
}


/**
 * Retrieve the list of table names.
 * @param session The session to retrieve table names from.
 * @returns Promise which fulfills with a list of table names.
 */
async function scanTables(session) {
    return await session.getTableNames();
}


module.exports = {
    scanTables,
    scanTableForDocuments,
    prettyPrintResultList
}