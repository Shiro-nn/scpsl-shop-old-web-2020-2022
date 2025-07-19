const { Server } = require('qurre-socket');
const mongodb = require('./modules/mongodb');
const config = require('./config');

module.exports = async() => {
    let SCPServers = [];
    let CachedIPS = [];
    const _server = new Server(2524, config.ip);
    _server.on('connection', (socket) => {
        let authorized = false;
        socket.on('SCPServerInit', (token) => {
            if(token != config.ApiToken) return;
            authorized = true;
            if(!SCPServers.some(x => x == socket.id)) SCPServers.push(socket.id);
        });
        socket.on('disconnect', () => {
            SCPServers = SCPServers.filter(x => x != socket.id);
        });
        socket.on('SendToSCPChangeRoleStatus', async([role]) => {
            const address = socket.sock.remoteAddress?.replace('::ffff:', '');
            if(address != '::1' && address != '127.0.0.1' && address != config.safeIp) return;
            for (let i = 0; i < SCPServers.length; i++) {
                const _socket = _server.clients.find(x => x.id == SCPServers[i]);
                if(_socket == null || _socket == undefined) continue;
                _socket.emit('ChangeFreezeSCPServer', role);
            }
        });
        socket.on('web.getips', async([uid]) => {
            const address = socket.sock.remoteAddress?.replace('::ffff:', '');
            if(address != '::1' && address != '127.0.0.1' && address != config.safeIp) return;
            let _chips = [];
            for (let i = 0; i < CachedIPS.length; i++) {
                const _lcips = CachedIPS[i];
                _chips.push(..._lcips.ips);
            }
            socket.emit('web.getips', _chips, uid);
        });
        socket.on('server.clearips', async([server]) => {
            if(!authorized) return;
            try{CachedIPS.find(x => x.server == server).ips = []}catch{}
        });
        socket.on('server.leave', async([server, ip]) => {
            if(!authorized) return;
            try{
                const _dt = CachedIPS.find(x => x.server == server);
                _dt.ips = removeItemOnce(_dt.ips, ip);
            }catch{}
            function removeItemOnce(arr, value) {
                var index = arr.indexOf(value);
                if (index > -1) {
                  arr.splice(index, 1);
                }
                return arr;
            }
        });
        socket.on('server.addip', async([server, ip]) => {
            if(!authorized) return;
            if(CachedIPS.some(x => x.server == server)) CachedIPS.find(x => x.server == server).ips.push(ip);
            else CachedIPS.push({server, ips:[ip]});
        });
        socket.on('server.tps', async([server, name, tps]) => {
            if(!authorized) return;
            tps = parseInt(tps);
            if(isNaN(tps)) return;
            if(tps == 0) return;
            let data = await mongodb.tps.findOne({server});
            if(!data) data = new mongodb.tps({server, name});
            const date = Date.now();
            const tpsleng = data.ticks.length;
            if(tpsleng > 8640){
                let _tpsns = tpsleng - 7500;
                if(0 > _tpsns) _tpsns = 0;
                let frnd = false;
                for (let i = _tpsns; !frnd && i < data.ticks.length; i++) {
                    if(date - data.ticks[i].date < 1000 * 60 * 60 * 24 * 3){
                        _tpsns = i;
                        frnd = true;
                    }
                }
                data.ticks = data.ticks.slice((_tpsns > 0 ? _tpsns : 0), tpsleng);
            }
            data.name = name;
            data.ticks.push({date, tps});
            data.markModified('ticks');
            await data.save();
        });
        socket.on('database.get.data', async([userid, ip]) => {
            if(!authorized) return;
            if(!userid.includes('@steam')) return;
            let stats = await mongodb.accounts.findOne({steam:userid.replace('@steam', '')});
            if(!stats) stats = new mongodb.accounts({steam:userid.replace('@steam', '')});
            if(!stats.ips.some(x => x == ip)){
                stats.ips.push(ip);
                stats.markModified('ips');
                await stats.save();
            }
            socket.emit('database.get.data', userid, {
                steam: stats.steam,
                prefix: stats.prefix,
                administration: stats.administration,
                money: stats.money,
                lvl: stats.lvl,
                xp: stats.xp,
                to: stats.to,
            });
        });
        socket.on('database.get.donate.roles', async([userid]) => {
            if(!authorized) return;
            if(!userid.includes('@steam')) return;
            const roleData = await mongodb.roles.find({owner:userid.replace('@steam', ''), freezed:false});
            let roles = [];
            roleData.forEach(role => roles.push(role.id));
            socket.emit('database.get.donate.roles', roles, userid);
        });
        socket.on('database.get.donate.ra', async([userid]) => {
            if(!authorized) return;
            if(!userid.includes('@steam')) return;
            const donateData = await mongodb.builds.find({owner:userid.replace('@steam', '')});
            let donates = [];
            donateData.forEach(donate => {
                donates.push({
                    force:donate.force,
                    give:donate.give,
                    effects:donate.effects,
                    players_roles:donate.players_roles,
                    prefix:donate.prefix,
                    color:donate.color,
                });
            });
            socket.emit('database.get.donate.ra', donates, userid);
        });
        socket.on('database.get.donate.customize', async([userid]) => {
            if(!authorized) return;
            if(!userid.includes('@steam')) return;
            const donateData = await mongodb.customize.findOne({owner:userid.replace('@steam', ''), active:true});
            if(donateData == null || donateData == undefined) return;
            socket.emit('database.get.donate.customize', {genetics:donateData.genetics, scales:donateData.scales}, userid);
        });
        
        socket.on('database.remove.admin', async([userid]) => {
            if(!authorized) return;
            if(!userid.includes('@steam')) return;
            const stats = await mongodb.accounts.findOne({steam:userid.replace('@steam', '')});
            if(!stats) return;
            stats.administration.owner = false;
            stats.administration.admin = false;
            stats.administration.moderator = false;
            stats.markModified('administration');
            await stats.save();
        });
        socket.on('database.add.stats', async([userid, xp, money]) => {
            if(!authorized) return;
            if(!userid.includes('@steam')) return;
            const stats = await mongodb.accounts.findOne({steam:userid.replace('@steam', '')});
            if(!stats) return;
            stats.xp += xp;
            stats.money += money;
            if(stats.xp >= stats.to){
                stats.xp -= stats.to;
                stats.lvl++;
                stats.to = stats.lvl * 250 + 750;
            }
            await stats.save();
            socket.emit('database.get.stats', {xp:stats.xp, lvl:stats.lvl, to:stats.to, money:stats.money}, userid);
        });
        socket.on('database.get.stats', async([userid, guid]) => {
            if(!authorized) return;
            if(!userid.includes('@steam')) return;
            const stats = await mongodb.accounts.findOne({steam:userid.replace('@steam', '')});
            if(!stats) return;
            socket.emit('database.get.stats', {xp:stats.xp, lvl:stats.lvl, to:stats.to, money:stats.money}, guid);
        });
    });
    _server.initialize();
};