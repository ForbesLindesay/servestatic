var Q = require('q');
var path = require('path');

//parse('./')
// => {hash: {'name': {file}, ...}, list: [{file}, ...]}
// where {file} is:
//    {name(), path(), source(), raw(), update(value), rename(name), 
//     show(), hide(), hidden()}
var parseDir = require('./parse');//depends on readDirRec

//compile('./', [filter(dir), filter(dir), filter(dir), ...])
// => [{file}, {file}, {file}]
module.exports = compile;
function compile(input, filters) {
    return parseDir(input).then(function (dir) {
        var hash = dir.hash;
        var list = dir.list;
        return Q.all(serialMap(filters, filterProcessor(dir))).then(function () {
            return dir.list.filter(notHiden);
        });
    });
}

//serialMap([...], =>map(input))
// => [...]
function serialMap(input, map) {
    var output = [];
    function next(i) {
        if (i === input.length) return output;
        return map(input[i]).then(function (res) {
            output.push(res);
            return next(i + 1);
        });
    }
    return next(0);
}

//filterProcessor('./')
//-> processFilter(filter)
//   => filter(dir)
function filterProcessor(dir) {
    return function processFilter(filter) {
        return Q.resolve(filter(dir));
    };
}

//notHidden({file})
//-> true/false
function notHiden(file) {
    return !file.hidden();
}