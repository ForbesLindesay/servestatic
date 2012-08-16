var connect = require('connect');
var url = require('url');
var Q = require('q');


module.exports.middleware = middleware;
function middleware(dir) {
    var hash = {};
    dir.forEach(function (file) {
        var name = file.name().replace(/\\/, '/');
        hash[name] = file;
        console.log('get', name);
        if (/\/index\.html$/g.test(name)) {
            console.log('get', name.replace(/\/index\.html$/g, '/'));
            hash[name.replace(/\/index\.html$/g, '')] = file;
            hash[name.replace(/\/index\.html$/g, '/')] = file;
        }
    });
    return function (req, res, next) {
        var name = url.parse(req.url).pathname;
        if (hash[name]) {
            var str = hash[name].source();
            //res.setHeader('Content-Type', 'text/html');
            res.setHeader('Content-Length', Buffer.byteLength(str));
            res.end(str);
        } else {
            next();
        }
    };
}


function liveMiddleware(app) {
    return function (req, res, next) {
        app.compile().then(function (dir) {
            middleware(dir)(req, res, next);
        }).fail(next).end();
    };
}

module.exports.serve = serve;
function serve(app, port) {
    var server = connect();
    server.use(liveMiddleware(app));
    server.listen(port);
}