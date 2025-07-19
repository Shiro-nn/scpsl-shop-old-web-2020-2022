const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const options = {
    target: 'http://localhost:2600',
    changeOrigin: false,
    ws: true,
    router: {
        'eu.scpsl.shop/socket.io': 'http://localhost:2556',
        'eu.scpsl.shop': 'http://localhost:2523',
    },
    onError: (err, req, res) => {try{
        res.writeHead(500, {
            'Content-Type': 'text/plain',
        });
        res.end('Proxy error');
    }catch{}},
};
const webProxy = createProxyMiddleware(options);
const app = express();
app.disable("x-powered-by");
app.use((req, res, next) => {
    try{
        if(req.get("host")?.startsWith('api')){
            res.set('Access-Control-Allow-Origin', '*');
            next();
            return;
        }
    }catch{}
    next();
})
app.use((req, res, next) => {
    req.headers['x-forwarded-for'] = (req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress);
    next();
})
app.use(webProxy);
{
    const server = app.listen(80);
    //const server = app.listen(2080);
    server.on('upgrade', webProxy.upgrade);
}
{
    const server = require('https').createServer({
        key: require('./.crt/ip').key,
        cert: require('./.crt/ip').crt
    }, app);

    server.addContext('*.scpsl.shop', {
        key: require('./.crt/sub.scpsl').key,
        cert: require('./.crt/sub.scpsl').crt
    });

    server.listen(443);
    //server.listen(2443);
    server.on('upgrade', webProxy.upgrade);
}
process.on("unhandledRejection", (err) => console.error(err));
process.on("uncaughtException", (err) => console.error(err));