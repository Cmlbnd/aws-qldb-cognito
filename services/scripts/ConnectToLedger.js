const amazon_qldb_driver_nodejs = require('amazon-qldb-driver-nodejs');

const pooledQldbDriver = createQldbDriver();
// const config = require('../../config/aws');
// console.log(config);


/**
 * Close a QLDB session object.
 * @param session The session to close.
 */
function closeQldbSession(session) {
    if (null != session) {
        session.close();
    }
}
/**
 * Create a pooled driver for creating sessions.
 * @param ledgerName The name of the ledger to create the driver on.
 * @param serviceConfigurationOptions The configurations for the AWS SDK client that the driver uses.
 * @returns The pooled driver for creating sessions.
 */
function createQldbDriver(ledgerName = process.env.LEDGER_NAME, serviceConfigurationOptions = {}) {
    // more details of the params: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/QLDB.html
    let options = {
        ...serviceConfigurationOptions,
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey:  process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION
    }

    const qldbDriver = new amazon_qldb_driver_nodejs.PooledQldbDriver(ledgerName, options);
    return qldbDriver;
}
/**
 * Retrieve a QLDB session object.
 * @returns Promise which fufills with a {@linkcode QldbSession} object.
 */
async function createQldbSession() {
    const qldbSession = await pooledQldbDriver.getSession();
    return qldbSession;
}

module.exports = {
    createQldbSession,
    closeQldbSession,
    createQldbDriver
}