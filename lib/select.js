var Q = require('q');

module.exports = select;
function select(selector, filters) {
    var self = {};
    var operations = [];
    filters.push(function selection(dir) {
        var dircopy = {hash: dir.hash, list: dir.list, filtered: dir.list};
        function next(i) {
            if (operations.length === i) return dir;
            return Q.timeout(Q.resolve(operations[i](dircopy)), 5000).then(function () {
                return next(i + 1);
            });
        }
        return next(0);
    });
    self.select = addOp(selectAndRename.select);
    self.rename = addOp(selectAndRename.rename);
    self.show = addOp(showAndHide.show);
    self.hide = addOp(showAndHide.hide);
    self.compile = addOp(compileAndTemplate.compile);
    self.template = addOp(compileAndTemplate.template);
    self.use = addOp(useOp);
    function addOp(op) {
        return function () {
            operations.push(op.apply(this, arguments));
            return self;
        };
    }
    return self.select(selector).show();
}

var selectAndRename = require('./operations/selectAndRename');

var showAndHide = require('./operations/showAndHide');

var compileAndTemplate = require('./operations/compileAndTemplate');


function useOp(fn) {
    if (fn.length === 2) {
        return Q.nbind(fn);
    } else {
        return fn;
    }
}