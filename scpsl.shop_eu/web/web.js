const config = require('./config');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const http = require('http');
const router = require('./.routers');
const bs = require('./modules/better-sessions');

module.exports = async() => {
    const _session = bs();

    const _web = express();
    _web
    .disable('x-powered-by')
    .use((req, res, next) => {
        if(!config.testing) res.header('Cache-Control', 'max-age=2592000000');
        next();
    })
    .use(express.static(path.join(__dirname, '/.public')))
    .engine('html', require('ejs').renderFile)
    .set('view engine', 'ejs')
    .set('views', path.join(__dirname, '/.views'))
    .use(express.urlencoded({extended: true}))
    .use(express.json())
    .use(cookieParser())
    .use(_session.init)
    .use(function(req, res, next){
        req._ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress).replace('::ffff:', '').replace('::1', '127.0.0.1');
        if(config.testing) req._ip = '45.90.57.58';
        next();
    })
    .use((req, res, next) => {
        res.header('Cache-Control', 'max-age=0');
        next();
    })
    .use(router);

    http.createServer(_web).listen(2523, 'localhost');
}