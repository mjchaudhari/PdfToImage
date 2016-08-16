var config = {};

config.workingFolder = "C:\\DeleteThis\\";
config.hostAddress = "";
exports.config = config;
exports.isValidJSON = function(str){
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}