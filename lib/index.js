// => means returns a promise for
// -> means returns


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