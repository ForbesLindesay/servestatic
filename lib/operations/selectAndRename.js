
module.exports.select = selectOp;

function selectOp(selector) {
    if (selector instanceof RegExp && selector.global) 
        throw new Error('It is an error to use a global RegExp for the selector remote the g flag.');
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
                return !!selector.test(file.name());
            });
        } else {
            throw new Error('Unsuported selector type.  Currently only Regular Expressions are supported.');
        }
    };
}


module.exports.rename = renameOp;

function renameOp(str) {
    return function (dir) {
        if (dir.replaceFromSelection) {
            dir.replaceFromSelection(str);
        } else {
            throw new Error('You must have a selector to do replacement.');
        }
    };
}