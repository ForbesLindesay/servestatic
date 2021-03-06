// => means returns a promise for
// -> means returns

var path = require('path');

var Q = require('q');

//readDirRec('./')
// => [{name:'full/path/to/file', content:'raw file content'}, ...]
var readDirRec = require('./readDirRec');

//parse('./')
// => {hash: {'name': {file}, ...}, list: [{file}, ...]}
// where {file} is:
//    {name(), path(), source(), raw(), update(value), rename(name), 
//     show(), hide(), hidden()}
module.exports = parse;
function parse(input) {
    input = path.resolve(input);
    return readDirRec(input)
    .then(function (files) {
        return files.map(fileParser(input));
    }).then(function (files) {
        var hash = {};
        var list = [];
        files.forEach(function (file) {
            hash[file.name()] = file;
            list.push(file);
        });
        return { hash: hash, list: list};
    });
}

//parseFile({name:'full/path/to/file', content:'raw file content'})
// -> {name(), path(), source(), raw(), update(value), rename(name), 
//     show(), hide(), hidden()}
function fileParser(root) {
    return function parseFile(file) {
        var data = file.content;
        var path = file.name;
        var name = file.name.replace(root, '').replace(/\\/g, '/');
        var isHidden = true;
        var attributes = {};
        var result = {
            name: function () {
                return name;
            },
            path: function () {
                return path;
            },
            source: function () {
                return data.toString();
            },
            raw: function () {
                return data;
            },
            update: function (value) {
                data = value;
                return this;
            },
            rename: function (newName) {
                name = newName;
                return this;
            },
            show: function () {
                isHidden = false;
                return this;
            },
            hide: function () {
                isHidden = true;
                return this;
            },
            hidden: function () {
                return isHidden;
            },
            set: function (name, value) {
                return attributes[name] = value;
            },
            get: function (name) {
                return attributes[name];
            }
        };
        return result;
    };
}