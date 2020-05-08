/**
 * Function to wrapp async errors. It will catch an error returned by a promise and send it to the next function to be handled
 * @param {function} code Code of the async function to be executed
 */
const errorWrapper = (code) => {
    return   async function (req, res, next) {
        try {
            return await code(req, res);
        }
        catch(error) {
            next(error);
        }
    };
}

module.exports = {
    errorWrapper 
}