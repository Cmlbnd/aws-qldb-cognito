var aws_sdk = require("aws-sdk");
aws_sdk.config.logger = console;
/**
 * Logs an error level message.
 * @param line The message to be logged.
 */
function error(line) {
    if (isLoggerSet()) {
        _prepend(line, "ERROR");
    }
}
exports.error = error;
/**
 * Logs a message.
 * @param line The message to be logged.
 */
function log(line) {
    if (isLoggerSet()) {
        _prepend(line, "LOG");
    }
}
exports.log = log;
/**
 * @returns A boolean indicating whether a logger has been set within the AWS SDK.
 */
function isLoggerSet() {
    return aws_sdk.config.logger !== null;
}
exports.isLoggerSet = isLoggerSet;
/**
 * Prepends a string identifier indicating the log level to the given log message, & writes or logs the given message
 * using the logger set in the AWS SDK.
 * @param line The message to be logged.
 * @param level The log level.
 */
function _prepend(line, level) {
    if (aws_sdk.config.logger) {
        if (typeof aws_sdk.config.logger.log === "function") {
            aws_sdk.config.logger.log("[" + level + "][Node.js QLDB Sample Code] " + line);
        }
        else if (typeof aws_sdk.config.logger.write === "function") {
            aws_sdk.config.logger.write("[" + level + "][Node.js QLDB Sample Code] " + line + "\n");
        }
    }
}
