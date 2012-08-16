module.exports = function fileWriter(dir) {
    console.log('file writer for: ', dir);
    return function writeFile(file) {
        console.log(file.name(), file.source());
    };
};