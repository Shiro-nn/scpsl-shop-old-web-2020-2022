const { Server } = require("socket.io");
//const { parse } = require('cookie');
const clansData = require('./data/clans');
const warsData = require('./data/wars');

module.exports = async(server, _session) => {
    const io = new Server(server, {
        path: '/clans-wars/',
        cookie: true,
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        },
    });
    /*
    io.use(async(socket, next) => {
        socket.session = {};
        let cookietext = '';
        try{cookietext = (socket.request.headers.cookie || socket.handshake.auth.cookie)}catch{cookietext = socket.handshake.auth.cookie;}
        try{
            const cookies = parse(cookietext);
            const ck = cookies[_session.config.name];
            if(!ck) return next();
            const session = await _session.get(ck);
            socket.session = session;
            next();
        }catch{next()}
    });
    */
    io.on('connection', (socket) => {
        /*
        let session = socket.session;
        function GetUID(){
            if(session == undefined || session == null) return 0;
            if(session.user == undefined || session.user == null) return 0;
            return session.user.id;
        }
        */


        socket.on('get.clans.war', async(uid) => {
            const war = await warsData.findById(uid);
            if(war == null || war == undefined) return socket.emit('get.clans.war', false, 'Клановая Война не найдена');
            const clan = await clansData.findOne({tag:war.owner.tag});
            if(clan == null || clan == undefined) return socket.emit('get.clans.war', false, 'Клан-организатор Клановой Войны не найден');
            socket.emit('get.clans.war', true, war, {color:clan.color, tag:clan.tag, name:clan.name});
        });
        socket.on('get.clans.wars', async(index = 0) => {
            const wars = await warsData.find();
            socket.emit('get.clans.wars', wars.slice(index * 10, (index * 10) + 10));
        });
    });
};