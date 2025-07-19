const fastify = require('fastify');
const proxy = require('fastify-vhost');

const app = fastify();

app.register(proxy, {
    upstream: 'https://scpsl.store',
    host: '127.0.0.1'
})
app.listen(80);