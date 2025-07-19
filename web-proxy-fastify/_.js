const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const options = {
    target: 'http://localhost:2631',
    changeOrigin: false,
    ws: true,
    router: {
        'scpsl.store': 'http://localhost:2631',
        'beta.scpsl.store': 'http://localhost:2631',
        'connect.scpsl.store': 'http://localhost:2535',
    },
    onError: (err, req, res) => {
        res.writeHead(500, {
            'Content-Type': 'text/plain',
        });
        res.end('Proxy error');
    },
};
const webProxy = createProxyMiddleware(options);
const app = express();
app.use(webProxy);
{
    const server = app.listen(80);
    server.on('upgrade', webProxy.upgrade);
}
{
    const crt = require('./crt')
    const server = require('https').createServer({
        key: crt.key,
        cert: crt.crt
    }, app);
    server.listen(443);
    server.on('upgrade', webProxy.upgrade);
}