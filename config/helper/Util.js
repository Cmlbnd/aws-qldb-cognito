var amazon_qldb_driver_nodejs = require("amazon-qldb-driver-nodejs");
var ion_js = require("ion-js");
var LogUtil = require("./LogUtil");
/**
 * Returns the string representation of a given BlockResponse.
 * @param blockResponse The BlockResponse to convert to string.
 * @returns The string representation of the supplied BlockResponse.
 */
function blockResponseToString(blockResponse) {
    var stringBuilder = "";
    if (blockResponse.Block.IonText) {
        stringBuilder = stringBuilder + "Block: " + blockResponse.Block.IonText + ", ";
    }
    if (blockResponse.Proof.IonText) {
        stringBuilder = stringBuilder + "Proof: " + blockResponse.Proof.IonText;
    }
    stringBuilder = "{" + stringBuilder + "}";
    var writer = ion_js.makePrettyWriter();
    var reader = ion_js.makeReader(stringBuilder);
    writer.writeValues(reader);
    return ion_js.decodeUtf8(writer.getBytes());
}
exports.blockResponseToString = blockResponseToString;
/**
 * Returns the string representation of a given GetDigestResponse.
 * @param digestResponse The GetDigestResponse to convert to string.
 * @returns The string representation of the supplied GetDigestResponse.
 */
function digestResponseToString(digestResponse) {
    var stringBuilder = "";
    if (digestResponse.Digest) {
        stringBuilder += "Digest: " + JSON.stringify(ion_js.toBase64(digestResponse.Digest)) + ", ";
    }
    if (digestResponse.DigestTipAddress.IonText) {
        stringBuilder += "DigestTipAddress: " + digestResponse.DigestTipAddress.IonText;
    }
    stringBuilder = "{" + stringBuilder + "}";
    var writer = ion_js.makePrettyWriter();
    var reader = ion_js.makeReader(stringBuilder);
    writer.writeValues(reader);
    return ion_js.decodeUtf8(writer.getBytes());
}
exports.digestResponseToString = digestResponseToString;

async function getDocumentId(txn, tableName, field, value) {
    var query = "SELECT id FROM " + tableName + " AS t BY id WHERE t." + field + " = ?";
    var parameter = amazon_qldb_driver_nodejs.createQldbWriter();
    parameter.writeString(value);
    var documentId;
    
    await txn.executeInline(query, [parameter]).then(function (result) {
        var resultList = result.getResultList();
        if (resultList.length === 0) {
            throw new Error("Unable to retrieve document ID using " + value + ".");
        }
        documentId = getFieldValue(resultList[0], ["id"]);
    }).catch(function (err) {
        LogUtil.error("Error getting documentId: " + err);
    });
    return documentId;
}
/**
 * Function which, given a reader and a path, traverses through the reader using the path to find the value.
 * @param ionReader The reader to operate on.
 * @param path The path to find the value.
 * @returns The value obtained after traversing the path.
 */
function getFieldValue(ionReader, path) {
    ionReader.next();
    ionReader.stepIn();
    return recursivePathLookup(ionReader, path);
}
exports.getFieldValue = getFieldValue;
/**
 * Helper method that traverses through the reader using the path to find the value.
 * @param ionReader The reader to operate on.
 * @param path The path to find the value.
 * @returns The value, or undefined if the provided path does not exist.
 */
function recursivePathLookup(ionReader, path) {
    if (path.length === 0) {
        // If the path's length is 0, the current ionReader node is the value which should be returned.
        if (ionReader.type() === ion_js.IonTypes.LIST) {
            var list = [];
            ionReader.stepIn(); // Step into the list.
            while (ionReader.next() != null) {
                var itemInList = recursivePathLookup(ionReader, []);
                list.push(itemInList);
            }
            return list;
        }
        else if (ionReader.type() === ion_js.IonTypes.STRUCT) {
            var structToReturn = {};
            var type;
            var currentDepth = ionReader.depth();
            ionReader.stepIn();
            while (ionReader.depth() > currentDepth) {
                // In order to get all values within the struct, we need to visit every node.
                type = ionReader.next();
                if (type === null) {
                    // End of the container indicates that we need to step out.
                    ionReader.stepOut();
                }
                else {
                    structToReturn[ionReader.fieldName()] = recursivePathLookup(ionReader, []);
                }
            }
            return structToReturn;
        }
        return ionReader.value();
    }
    else if (path.length === 1) {
        // If the path's length is 1, the single value in the path list is the field should to be returned.
        while (ionReader.next() != null) {
            if (ionReader.fieldName() === path[0]) {
                path.shift(); // Remove the path node which we just entered.
                return recursivePathLookup(ionReader, path);
            }
        }
    }
    else {
        // If the path's length >= 2, the Ion tree needs to be traversed more to find the value we're looking for.
        while (ionReader.next() != null) {
            if (ionReader.fieldName() === path[0]) {
                ionReader.stepIn(); // Step into the IonStruct.
                path.shift(); // Remove the path node which we just entered.
                return recursivePathLookup(ionReader, path);
            }
        }
    }
    // If the path doesn't exist, return undefined.
    return undefined;
}
exports.recursivePathLookup = recursivePathLookup;
/**
 * Sleep for the specified amount of time.
 * @param ms The amount of time to sleep in milliseconds.
 * @returns Promise which fulfills with void.
 */
function sleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
exports.sleep = sleep;
/**
 * Returns the string representation of a given ValueHolder.
 * @param valueHolder The ValueHolder to convert to string.
 * @returns The string representation of the supplied ValueHolder.
 */
function valueHolderToString(valueHolder) {
    var stringBuilder = "{ IonText: " + valueHolder.IonText + "}";
    var writer = ion_js.makePrettyWriter();
    var reader = ion_js.makeReader(stringBuilder);
    writer.writeValues(reader);
    return ion_js.decodeUtf8(writer.getBytes());
}
exports.valueHolderToString = valueHolderToString;
/**
 * Converts a given value to Ion using the provided writer.
 * @param value The value to covert to Ion.
 * @param ionWriter The Writer to pass the value into.
 * @throws Error: If the given value cannot be converted to Ion.
 */
function writeValueAsIon(value, ionWriter) {
    switch (typeof value) {
        case "string":
            ionWriter.writeString(value);
            break;
        case "boolean":
            ionWriter.writeBoolean(value);
            break;
        case "number":
            ionWriter.writeInt(value);
            break;
        case "object":
            if (Array.isArray(value)) {
                // Object is an array.
                ionWriter.stepIn(ion_js.IonTypes.LIST);
                for (var _i = 0; _i < value.length; _i++) {
                    var element = value[_i];
                    writeValueAsIon(element, ionWriter);
                }
                ionWriter.stepOut();
            }
            else if (value instanceof Date) {
                // Object is a Date.
                ionWriter.writeTimestamp(ion_js.Timestamp.parse(value.toISOString()));
            }
            else if (value instanceof ion_js.Decimal) {
                // Object is a Decimal.
                ionWriter.writeDecimal(value);
            }
            else if (value === null) {
                ionWriter.writeNull(ion_js.IonTypes.NULL);
            }
            else {
                // Object is a struct.
                ionWriter.stepIn(ion_js.IonTypes.STRUCT);
                for (var _a = 0, _b = Object.keys(value); _a < _b.length; _a++) {
                    var key = _b[_a];
                    ionWriter.writeFieldName(key);
                    writeValueAsIon(value[key], ionWriter);
                }
                ionWriter.stepOut();
            }
            break;
        default:
            throw new Error("Cannot convert to Ion for type: " + (typeof value) + ".");
    }
}
exports.writeValueAsIon = writeValueAsIon;
