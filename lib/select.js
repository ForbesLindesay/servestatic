var cons = require('consolidate-build');
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
    self.select = addOp(selectOp);
    self.rename = addOp(renameOp);
    self.show = addOp(showOp);
    self.hide = addOp(hideOp);
    self.compile = addOp(compileOp);
    self.use = addOp(useOp);
    function addOp(op) {
        return function () {
            operations.push(op.apply(this, arguments));
            return self;
        };
    }
    return self.select(selector).show();
}

function selectOp(selector) {
    return function (dir) {
        dir.replaceFromSelection = function (str) {
            if (selector instanceof RegExp) {
                dir.filtered.forEach(function (file) {
                    file.rename(file.name().replace(selector, str));
                });
            } else {
                dir.filtered.forEach(function (file) {
                    file.rename(str);
                });
            }
        };
        if (selector instanceof RegExp) {
            dir.filtered = dir.filtered.filter(function (file) {
                return selector.test(file.name());
            });
        } else {
            throw new Error('Unsuported selector type.  Currently only Regular Expressions are supported.');
        }
    };
}

function renameOp(str) {
    return function (dir) {
        if (dir.replaceFromSelection) {
            dir.replaceFromSelection(str);
        } else {
            throw new Error('You must have a selector to do replacement.');
        }
    };
}


function showOp() {
    return function (dir) {
        dir.filtered.forEach(function (file) {
            file.show();
        });
    };
}
function hideOp() {
    return function (dir) {
        dir.filtered.forEach(function (file) {
            file.hide();
        });
    };
}


function compileOp(compiler) {
    var engine;
    if (typeof compiler === 'function') {
        engine = Q.nbind(compiler);
    } else {
        if (typeof cons[compiler].render !== 'function') {
            throw new Error('unsupported compiler');
        }
        engine = Q.nbind(cons[compiler].render);
    }
    return function (dir) {
        return Q.all(dir.filtered.map(function (file) {
            return engine(file.source(), {filename: file.path()}).then(function (result) {
                file.update(result);
            });
        }));
    };
}

function useOp(fn) {
    if (fn.length === 2) {
        return Q.nbind(fn);
    } else {
        return fn;
    }
}