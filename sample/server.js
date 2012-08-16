var servestatic = require('../');
var app = servestatic('./src');

var select = app.select;

select(/^(.*)\.jade$/g).compile('jade').rename('$1.html').use(function (dir, next) {
    console.log(dir);
    //next();
});


app.build('./out').end();