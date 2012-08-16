var Q = require('q');

var fs = require('fs');
var path = require('path');

var writeFile = Q.nbind(fs.writeFileSync);

module.exports = function fileWriter(dir) {
    return function writeFileOp(file) {
        var filePath = path.join(dir, file.name());
        return mkdir_p(path.dirname(filePath)).then(function () {
            return writeFile(filePath, file.raw(), 'utf8');
        });
    };
};


var mkdir = Q.nbind(fs.mkdir);

/**
 * Offers functionality similar to mkdir -p
 */
function mkdir_p(directory) {
    return exists(directory).then(function (exists) {
        if (exists) return true;
        return mkdir_p(path.resolve(directory, '..')).then(function () {
            return mkdir(directory);
        })
    });
}

function exists(path) {
    var def = Q.defer();
    fs.exists(path, function (exists) {
        def.resolve(exists);
    });
    return def.promise;
}