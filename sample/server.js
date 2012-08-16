var servestatic = require('../');
var app = servestatic('./src');

var select = app.select;

select(/^(.*)\.md$/).compile('markdown').template('/template.html', 'mustache').rename('$1.html');
select(/^(.*)\.jade$/).compile('jade').rename('$1.html');
//select(/\.html/).compile('mustache');
select(/^\/static\/(.*)/).rename('/$1');

app.listen(8080);
//app.build('./out').end();