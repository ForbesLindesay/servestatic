module.exports.show = showOp;
function showOp() {
    return function (dir) {
        dir.filtered.forEach(function (file) {
            console.log('show', file.name());
            file.show();
        });
    };
}
module.exports.hide = hideOp;
function hideOp() {
    return function (dir) {
        dir.filtered.forEach(function (file) {
            console.log('hide', file.name());
            file.hide();
        });
    };
}