const path = require('path');

const fastify = require('fastify')();

fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, '.public'),
    prefix: '/', // optional: default '/'
});
fastify.register(require('@fastify/view'), {
    engine: {ejs: require('ejs')}
});

fastify.setNotFoundHandler(function (req, reply) {
    reply.view("/.view.ejs", {color: "#d317e4"});
})

fastify.listen({port: 2600, host:'127.0.0.1'}, (err, address) => {
    if (err) throw err;
    console.log('Сайт запущен на '+address);
});