const { param } = require('../../dashboard/routes/api');
const mongo = require('./mongo');
module.exports = function(config = {
    name: 'sid',
    expires: new Date(253402300000000),
    httpOnly: false,
    domain: '.scpsl.store',
    path: '/',
    secure: true
}) {
    const guid = () => {
        return DoGUID() + DoGUID();
        function DoGUID(){return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*32|0,v=c=='x'?r:r&0x3|0x8;return v.toString(32);});}
    }
    let cache = [];
    return {
        config:config,
        get: async(id) => {
            if(cache.some(x => x.uid == id)) return JSON.parse(cache.find(x => x.uid == id).data);
            const _data = await mongo.findOne({id});
            if(_data == null || _data == undefined) return {};
            cache.push({uid:id, data:_data.data});
            return JSON.parse(_data.data);
        },
        init: async(req, res, next) => {
            const ck = req.cookies[config.name];
            req.bs = {
                data: {},
                save: async function(recreate = false) {
                    let uid = recreate ? null : ck;
                    if(uid == null || uid == undefined){
                        uid = guid();
                        res.cookie(config.name, uid, {expires:config.expires, httpOnly:config.httpOnly, domain:config.domain, path:config.path, secure:config.secure});
                    }
                    if(!cache.some(x => x.uid == uid)) cache.push({uid, data:req.bs.data});
                    else cache.find(x => x.uid == uid).data = req.bs.data;
                    await MongoUpdate();
                    async function MongoUpdate() {
                        const _data = await mongo.findOne({id:uid});
                        if(_data == null || _data == undefined) await new mongo({id:uid, data:JSON.stringify(req.bs.data)}).save();
                        else{_data.data = JSON.stringify(req.bs.data); await _data.save();}
                    }
                },
                destroy: async function(){
                    if(ck == null || ck == undefined) return;
                    res.clearCookie(config.name, {httpOnly:config.httpOnly, domain:config.domain, path:config.path, secure:config.secure});
                    cache = cache.filter(x => x.uid != ck);
                    await mongo.deleteMany({id:ck});
                },
                clearAll: async(params) => {
                    try{cache = cache.filter(x => !x.data.includes(params));}catch{}
                    const _data = await mongo.find();
                    _data.forEach(async(data) => {
                        if(data.data.includes(params)) await data.remove();
                    });
                }
            }
            if(ck == null || ck == undefined) return next();
            if(cache.some(x => x.uid == ck)) req.bs.data = cache.find(x => x.uid == ck).data;
            else{
                const _data = await mongo.findOne({id:ck});
                if(_data == null || _data == undefined) return next();
                req.bs.data = JSON.parse(_data.data);
            }
            next();
        }
    }
}