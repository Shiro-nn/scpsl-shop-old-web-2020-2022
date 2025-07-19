const express = require('express');
const http = require('http');

const ips = [
    '193.164.17.142',
    '193.164.17.138',
    '193.164.17.136',
];
const verkeys = {
    '193.164.17.142': '',
    '193.164.17.138': '',
    '193.164.17.136': '',
}

const _web = express();
_web
.use(express.json())
.use(async(req, res) => {
    if(req.query.port == '6666') req.query.port = '7779';
    else if(req.query.port == '7667') req.query.port = '7666';
    let reply = '';

    let _baseInfo = req.query.info;

    for(let n in ips){
        req.query.ip = ips[n];
        req.query.passcode = verkeys[req.query.ip] ?? req.query.passcode;

        if(req.query.port == '7666' && req.query.ip != '193.164.17.138'){
            req.query.info = ''
        }
        else if(req.query.port == '7779' && req.query.ip != '193.164.17.136'){
            req.query.info = ''
        }else{
            req.query.info = _baseInfo;
        }

        let args = '';
        for(var i in req.query){
            args += `${i}=${req.query[i]}&`;
        }
        args = args.substring(0, args.length - 1);
        const res = await fetch('https://api.scpslgame.com/v5/authenticator.php', {
            method: 'POST',
            headers: {
                'Accept': 'application/x-www-form-urlencoded',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: args
        });
        reply = await res.text();
    }
    res.send(reply);
})

http.createServer(_web).listen(4639, '127.0.0.1');