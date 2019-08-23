const Mock = require('mockjs');



exports.mockFn = function (connect, opt) {
    return [
        async function httpPostMock(req, res, next) {
            let body = '';
            req.on('data', chunk => {
                body += chunk;
            });
            req.on('end', () => {

                setTimeout(() => {

                    if (req.url === '/login') {
                        res.writeHead(200, 'ok', { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ code: 0, data: 'ok' }));
                    }
                    else if (req.url == '/gifts') {
                        res.writeHead(200, 'ok', { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ code: 0, data: [] }));
                    }
                    else {
                        next();
                    }

                }, 200);
            });
            req.on('error', err => {
                next();
            })
        }
    ]
}

