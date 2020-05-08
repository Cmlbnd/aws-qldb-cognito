var ion_js = require("ion-js");

function getFieldsValue(ionReader) {
    let result = {};
    ionReader.next();
    ionReader.stepIn();

    while (ionReader.next() != null) {
        let fieldName = ionReader.fieldName();
        let fieldValue = ionReader.value();
        let type = ionReader.type();

        if (type.isNumeric) {
            fieldValue = ionReader.numberValue();
        }
        result[fieldName] = fieldValue;
    }
    return result;
}

const parseIdentity = (identity) => {
    let splitName = identity.Name.split(" ");
    return {
        name: identity.Name,
        roles: JSON.parse(identity.Roles),
        externalId: identity.ExternalId,
        firstName: splitName[0],
        lastName: splitName[splitName.length - 1],
        userID: identity.ExternalId,
        email: "n/a",
        documentId: identity.documentId
    }
}

module.exports =
{
    getFieldsValue,
    parseIdentity
};
