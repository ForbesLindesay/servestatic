// => means returns a promise for
// -> means returns

var fs = require('fs');
var path = require('path');
var Q = require('q');



exports = module.exports = require('./app');



//parse('./')
// => {hash: {'name': {file}, ...}, list: [{file}, ...]}
// where {file} is:
//    {name(), path(), source(), raw(), update(value), rename(name), 
//     show(), hide(), hidden()}
var parse = exports.parse = require('./parse');//depends on readDirRec

//compile('./', [filter(dir), filter(dir), filter(dir), ...])
// => [{file}, {file}, {file}]
var compile = exports.compile = require('./compile');




function run(src, out) {
    console.log('run');
    compile(src, []).then(function (files) {
        console.log('built');
        console.log(files.map(function (file) {
            return [file.name(), file.source()];
        }));
    }).end();
}
run.compile = compile;
run.select = selectFile;
function selectFile(match) {
    var filter = {selection: null, operations: []};
    filters.push(filter);
    var selection = {};
    var matchIn = match;
    if (typeof match === 'string') {
        match = function (file) {
            return file.name() === matchIn;
        };
    } else if (match instanceof RegExp) {
        match = function (file) {
            return matchIn.test(file.name());
        };
    }
    filter.selection = match;
    selection.compile = function compile(engine) {
        if (typeof engine === 'string') {
            engine = require('consolidate-build')[engine].render;
        }
        return selection.update(function (file, done) {
            engine(file.source(), { filename: file.path() }, function (err, res) {
                if (err) return done(err);
                file.update(res);
                done();
            });
        });
    };
    selection.update = function update(transformation) {
        if (typeof transformation !== 'function') {
            var value = transformation;
            transformation = function (file) {
                return value;
            };
        }
        if (transformation.length !== 2) {
            var oldTransformation = transformation;
            transformation = function (file, done) {
                try {
                    var res = oldTransformation(file);
                } catch (ex) {
                    return done(ex);
                }
                done(null, res);
            };
        }
        filter.operations.push(function (file, done) {
            transformation(file, done);
        });
        return selection;
    };
    selection.rename = function rename(to) {
        if (typeof to === 'string') {
            var value = to;
            to = function (file) {
                if (matchIn instanceof RegExp && /\$/g.test(value)) {
                    return file.name().replace(matchIn, value);
                } else {
                    return value;
                }
            };
        }
        if (typeof to !== 'function') {
            throw new Error('You can only rename to a string or function.' + 
                '\nIf you rename to a string, and matched on a regular expression, ' +
                'then the string will be used as a regular expression replacement.' + 
                '\nIf you are using a function for your to value, it will be passed ' +
                'the file object, and can return a string or call the callback with a string.');
        }
        if (to.length !== 2) {
            var oldTransformation = to;
            to = function (file, done) {
                try {
                    var res = oldTransformation(file);
                } catch (ex) {
                    return done(ex);
                }
                done(null, res);
            };
        }
        filter.operations.push(function (file, done) {
            to(file, function (err, value) {
                if (err) return done(err);
                file.rename(value);
                done();
            });
        });
        return selection;
    };
    selection.output = function output(to) {
        selection.rename(to);
    };
    selection.hide = function hide(condition) {
        filter.operations.push(function (file, done) {
            file.hide();
            done();
        });
    };
    filter.operations.push(function (file, done) {
        file.show();
        done();
    });
    return selection;
}