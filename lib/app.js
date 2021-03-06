// => means returns a promise for
// -> means returns

var fs = require('fs');
var path = require('path');
var Q = require('q');

//parse('./')
// => {hash: {'name': {file}, ...}, list: [{file}, ...]}
// where {file} is:
//    {name(), path(), source(), raw(), update(value), rename(name), 
//     show(), hide(), hidden()}
var parse = require('./parse');//depends on readDirRec

//compile('./', [filter(dir), filter(dir), filter(dir), ...])
// => [{file}, {file}, {file}]
var compile = require('./compile');

//fileWriter(dir)
// -> writeFile({file})
//   => {file}
var fileWriter = require('./fileWriter');

var select = require('./select');

var server = require('./server');

module.exports = app;
function app(src) {
    var self = {};
    var filters = [];

    self.parse = function parseWrapper() {
        return parse(src);
    };

    self.compile = function compileWrapper() {
        return compile(src, filters);
    };

    self.use = function useWrapper(filter) {
        filters.push(filter);
        return self;
    };

    self.select = function selectWrapper(selector) {
        return select(selector, filters);
    };

    self.middleware = function middlewareWrapper(port) {

    };
    self.listen = function listenWrapper(port) {
        return server.serve(self, port);
    };
    self.build = function buildWrapper(dir) {
        return self.compile().then(function (files) {
            return Q.all(files.map(fileWriter(dir))).then(function () {
                return self;
            });
        });
    };

    return self;
}