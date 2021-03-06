// => means returns a promise for
// -> means returns

var Q = require('q');

var fs = require('fs');
var path = require('path');

var readDir = Q.nbind(fs.readdir);
var stat = Q.nbind(fs.stat);
var readFile = Q.nbind(fs.readFile);

//readDirRec('./')
// => [{name:'full/path/to/file', content:'raw file content'}, ...]
module.exports = readDirRec;
function readDirRec(folder) {
    return readDir(folder).then(function (files) {
        var processedFiles = files.map(joinWith(folder)).map(processFileOrDirectory);
        return Q.all(processedFiles).then(flatten);
    });
}
//processFileOrDirectory('./')
// => [{name:'full/path/to/file', content:'raw file content'}, ...]
//processFileOrDirectory('./filename.ext')
// => {name:'full/path/to/file', content:'raw file content'}
function processFileOrDirectory(filepath) {
    return stat(filepath).then(function (stats) {
        if (stats.isFile()) {
            return processFile(filepath);
        } else if (stats.isDirectory()) {
            return readDirRec(filepath);
        } 
    });
}
//processFile('./filename.ext')
// => {name:'full/path/to/file', content:'raw file content'}
function processFile(filepath) {
    return readFile(filepath).then(function (content) {
        return {name: filepath, content: content};
    });
}

//flatten an array of arrays of arrays of .....
//into a flat array.
//
//flatten([1, 2, [3, 4], [5, [6]]])
// -> [1, 2, 3, 4, 5, 6]
function flatten(array, output) {
    output = output || [];
    for (var i = 0; i < array.length; i++) {
        if (Array.isArray(array[i])) {
            flatten(array[i], output);
        } else {
            output.push(array[i]);
        }
    };
    return output;
}

function joinWith(folder) {
    return function joinWith(file) {
        return path.join(folder, file);
    }
}