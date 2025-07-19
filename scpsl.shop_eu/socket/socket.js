const config = require('./config');
const mongodb = require('./modules/mongodb');
const { Server } = require('socket.io');
const { parse } = require('cookie');

module.exports = async(server, _session) => {
    const io = new Server(server, {
        cookie: true,
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        },
    });
    io.use(async(socket, next) => {
        socket.session = {};
        let cookietext = '';
        try{cookietext = (socket.request.headers.cookie || socket.handshake.auth.cookie)}catch{cookietext = socket.handshake.auth.cookie;}
        try{
            const cookies = parse(cookietext);
            const ck = cookies[_session.config.name];
            if(!ck) return next();
            const session = await _session.get(ck);
            session.id = ck;
            socket.session = session;
            next();
        }catch{next()}
    });
    io.on('connection', (socket) => {
        console.log(socket.session);

        socket.on('get.tps', async() => {
            const _tps = await mongodb.tps.find();
            let arr = [];
            for (let i = 0; i < _tps.length; i++) {
                const tps = _tps[i];
                arr.push({
                    server: tps.server,
                    name: tps.name,
                    ticks: tps.ticks.slice(0, 360),
                });
            }
            socket.emit('get.tps', arr);
            arr = null;
        });
    });
};