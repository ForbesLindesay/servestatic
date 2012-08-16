var cons = require('consolidate-build');
var Q = require('q');

module.exports.compile = compileOp;
function compileOp(compiler, options) {
    var engine = getEngine(compiler)
    return function (dir) {
        return Q.all(dir.filtered.map(function (file) {
            function render(options) {
                options = Object.create(options || {});
                options.filename = options.filename || file.path();
                return engine(file.source(), options);
            }
            file.set('render', render);
            return render(options || {}).then(function (result) {
                file.update(result);
            }, function (err) {
                console.log(err);
                return Q.reject(err);
            });
        }));
    };
}

module.exports.template = templateOp;
function templateOp(name, compiler, options) {
    var engine;
    if (compiler) {
        engine = getEngine(compiler);
    }
    return function (dir) {
        return Q.all(dir.filtered.map(function (file) {
            var render = function render(options) {
                options = Object.create(options || {});
                options.filename = options.filename || dir.hash[name].path();
                return engine(dir.hash[name].source(), options);
            }

            if (!engine) render = dir.hash[name].get('render');
            var optionsCopy = Object.create(options || {});
            optionsCopy.contents = optionsCopy.contents || file.source();

            return render(optionsCopy || {}).then(function (result) {
                file.update(result);
            }, function (err) {
                console.log(err);
                return Q.reject(err);
            });
        }));
    };
}


function getEngine(compiler) {
    var engine;
    if (typeof compiler === 'function') {
        engine = Q.nbind(compiler);
    } else {
        if (typeof cons[compiler].render !== 'function') {
            throw new Error('The compiler "' + compiler + '" is unsupported.');
        }
        engine = Q.nbind(cons[compiler].render);
    }
    return engine;
}