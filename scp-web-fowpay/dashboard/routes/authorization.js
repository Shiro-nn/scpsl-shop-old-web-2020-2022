const Mails = require('./modules/mails/Manager');
const express = require("express"),
router = express.Router();
const accountsData = require("../../base/accounts");
const verifyData = require("../../base/verify");
const countsData = require("../../base/counts");
const crypto = require('crypto');
const CryptoJS = require("crypto-js");
const ipinfo = require("ipinfo");
const config = require("../../config");
const host = config.dashboard.baseURL;
const vhost = require('vhost');
const cdn_host = config.dashboard.cdn;
router.get('/authorization', vhost(host, async(req, res) => {
    let query = '/';
    console.log(req.bs.data);
    if(req.query.redirect !== null && req.query.redirect !== undefined) query += req.query.redirect;
    if(req.bs.data.user != null && req.bs.data.user != undefined) return res.redirect(query);
    if(req.cookies.login == undefined) return res.render("authorization/authorization.ejs", {cdn_host});
    let userData = await accountsData.findOne({cookie:req.cookies.login, ip:req._ip});
	if (userData == null || userData == undefined) return res.render("authorization/authorization.ejs", {cdn_host});
    req.bs.data.user = {
        id:userData.id,
        user:userData.user,
        style:userData.style,
        discord:userData.discord,
    }
    await req.bs.save();
    res.redirect(query);
}));
router.get('/authorization/verify/:key', vhost(host, async(req, res) => {
    const _data = await verifyData.findOne({code:req.params.key});
    if(_data == null || _data == undefined) return res.redirect('/authorization');
    const _account = await accountsData.findOne({id:_data.id});
    if(_account == null || _account == undefined) return res.redirect('/authorization');
    _account.verified = true;
    await _account.save();
    _data.remove();
    res.redirect('/info');
}));
router.get('/authorization/reset-password/:key', vhost(host, async(req, res) => {
    const passKey = req.params.key;
    const _data = await accountsData.findOne({passKey});
    if(_data == null || _data == undefined) return res.redirect('/authorization');
    res.render("authorization/reset.ejs", {cdn_host});
}));
router.post('/authorization/login', vhost(host, async(req, res) => {
    let userData = await accountsData.findOne({user: req.body.user});
    if(userData == null || userData == undefined){
        userData = await accountsData.findOne({email: req.body.user});
        if(userData == null || userData == undefined) return res.status(404).send('user-not-found');
    }
    if(!userData.verified) return res.status(400).send('user-not-verified');
    const hashed = sha256(sha256(req.body.user) + 'scpsl.store');
    const pass = CryptoJS.AES.decrypt(req.body.pass, hashed).toString(CryptoJS.enc.Latin1);
    if(pass == null || pass == undefined) return res.status(400).send('invalid-password');
    const right = validatePassword(pass, userData.pass);
    if(!right) return res.status(400).send('invalid-password');
    if(req.body.remember){
        const key = await generateLoginKey(userData.user, req._ip);
        res.cookie('login', key, { expires: new Date(253402300000000) });
    }
    req.bs.data.user = {
        id:userData.id,
        user:userData.user,
        style:userData.style,
        discord:userData.discord,
    }
    await req.bs.save();
    const useragent = req.headers['user-agent'];
    res.send('successfully');
    if(!userData.ips.some(x => x == req._ip)){
        userData.ips.push(req._ip);
		userData.markModified('ips');
        await userData.save();
        ipinfo(req._ip, '').then(cLoc => Mails.ips(userData, cLoc, useragent));
    }
}));
router.post('/authorization/signup', vhost(host, async(req, res) => {
    if(req.body.user == null || req.body.user == undefined || req.body.user.length < 3 || req.body.user.length > 25) return res.status(400).send('username-many');
    if(req.body.nick == null || req.body.nick == undefined || req.body.nick.length > 25) return res.status(400).send('nick-many');
    if(req.body.nick == null || req.body.nick == undefined || req.body.nick.length < 2) return res.status(400).send('nick-low');
    if(req.body.pass == null || req.body.pass == undefined) return res.status(400).send('password-null');
    if(!validateEmail(req.body.email)) return res.status(400).send('email-null');
    const _data1 = await accountsData.findOne({user: req.body.user});
    if(_data1 != null && _data1 != undefined) return res.status(400).send('username-taken');
    const _data2 = await accountsData.findOne({email: req.body.email});
    if(_data2 != null && _data2 != undefined) return res.status(400).send('email-taken');
    const _data3 = await accountsData.findOne({email: req.body.user});
    if(_data3 != null && _data3 != undefined) return res.status(400).send('username-taken');
    const hashed = sha256(sha256(req.body.user) + 'scpsl.store');
    const do_pass = CryptoJS.AES.decrypt(req.body.pass, hashed).toString(CryptoJS.enc.Latin1);
    if(do_pass == null || do_pass == undefined) return res.status(400).send('password-null');
    if(do_pass.length < 6) return res.status(400).send('password-few-length');
    const pass = saltAndHash(do_pass);
    let counts = await countsData.findOne();
    if(counts === null || counts === undefined) counts = new countsData();
    counts.accounts++;
    await counts.save();
    const userData = new accountsData({
        email: req.body.email,
        user: req.body.user,
        name: req.body.nick,
        id: counts.accounts,
        pass, ip:req._ip, date: GetDateTime(),
    });
    await userData.save();
    res.status(200).send('successfully');
    const _key = guid() + guid();
    await new verifyData({id:userData.id, code:_key}).save();
    Mails.accounts.register(userData, `https://${config.dashboard.baseURL}/authorization/verify/${_key}`);
}));
router.post('/authorization/logout', vhost(host, async(req, res) => {
	res.clearCookie('login');
    await req.bs.destroy();
    res.sendStatus(200);
}));
router.post('/authorization/reverify', vhost(host, async(req, res) => {
	let email = req.body.email;
    if(!validateEmail(email)) return res.status(400).send('email-null');
    const _key = guid() + guid();
    const userData = await accountsData.findOne({email});
    if(userData == null || userData == undefined) return res.status(404).send('account not found');
    if(userData.verified) return res.status(400).send('account verified');
    await new verifyData({id:userData.id, code:_key}).save();
    ipinfo(req._ip, '').then(cLoc => SendEmail(cLoc)).catch(() => SendEmail({}));
    function SendEmail(ipinfo){
        const useragent = req.headers['user-agent'];
        Mails.accounts.verify(userData, ipinfo, useragent, `https://${config.dashboard.baseURL}/authorization/verify/${_key}`, function(e, m){
            if (!e) return res.status(200).send('successfully');
            for (k in e) console.log('ERROR : ', k, e[k]);
            res.status(400).send('email error');
        })
    }
}));
router.post('/authorization/lost-password', vhost(host, async(req, res) => {
	const email = req.body.email;
    if(!validateEmail(email)) return res.status(400).send('email-null');
    const passKey = guid() + guid();
    const userData = await accountsData.findOne({email});
    if(userData == null || userData == undefined) return res.status(404).send('account not found');
    userData.passKey = passKey;
    userData.cookie = '';
    await userData.save();
    ipinfo(req._ip, '').then(cLoc => SendEmail(cLoc)).catch(() => SendEmail({}));
    function SendEmail(ipinfo){
        const useragent = req.headers['user-agent'];
        Mails.accounts.reset(userData, ipinfo, useragent, `https://${config.dashboard.baseURL}/authorization/reset-password/${passKey}`, function(e, m){
            if (!e) return res.status(200).send('successfully');
            for (k in e) console.log('ERROR : ', k, e[k]);
            res.status(400).send('email error');
        })
    }
}));
router.post('/authorization/reset-password/:key', vhost(host, async(req, res) => {
    if(req.body.pass == null || req.body.pass == undefined) return res.status(400).send('password-few-length');
    const hashed = sha256(sha256(req.body.uid) + 'scpsl.store');
    const do_pass = CryptoJS.AES.decrypt(req.body.pass, hashed).toString(CryptoJS.enc.Latin1);
    if(do_pass == null || do_pass == undefined || do_pass.length < 6) return res.status(400).send('password-few-length');
    const newPass = saltAndHash(do_pass);
	const passKey = req.params.key;
    req.bs.destroy();
    const userData = await accountsData.findOne({passKey});
    if(userData == null || userData == undefined) return res.status(404).send('account not found');
    userData.pass = newPass;
    userData.ip = req._ip;
    userData.passKey = '';
    userData.cookie = '';
    await userData.save();
    const useragent = req.headers['user-agent'];
    req.bs.clearAll(`\"id\":${userData.id},`);
    res.status(200).send('successfully');
    ipinfo(req._ip, '').then(cLoc => Mails.accounts.changed(userData, cLoc, useragent)).catch(() => Mails.accounts.changed(userData, {}, useragent));
}));
module.exports = router;
const guid = function(){return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*32|0,v=c=='x'?r:r&0x3|0x8;return v.toString(32);});}
var sha256 = function(str) {
	return crypto.createHash('sha256').update(str).digest('hex');
}
var generateSalt = function()
{
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	for (var i = 0; i < 10; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	return salt;
}
var saltAndHash = function(pass)
{
	var salt = generateSalt();
	return salt + sha256(pass + salt);
}
var validatePassword = function(plainPass, hashedPass)
{
	var salt = hashedPass.substr(0, 10);
	var validHash = salt + sha256(plainPass + salt);
	return hashedPass === validHash;
}
var generateLoginKey = async function(user, ipAddress)
{
	let cookie = guid();
	let userData = await accountsData.findOne({user:user});
	userData.ip = ipAddress;
	userData.cookie = cookie;
	await userData.save();
    return cookie;
}
function validateEmail(e) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(e);
}
function GetDateTime() {
    var date = new Date();
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    var hour = date.getHours();
    var minute = date.getMinutes();
	var second = date.getSeconds();
    if (parseInt(day) < 10) {
        var t = "0";
        t += day;
        day = t;
    }
	if (parseInt(hour) < 10) {
		var t = "0";
		t += hour;
		hour = t;
	}
	if (parseInt(minute) < 10) {
		var t = "0";
		t += minute;
		minute = t;
	}
	if (parseInt(second) < 10) {
		var t = "0";
		t += second;
		second = t;
	}
    if (parseInt(month) == 13) {
        month = "01";
        year = date.getFullYear() + 1;
    }
    if (parseInt(month) < 10) {
        var t = "0";
        t += month;
        month = t;
    }
    var time = day + "." + month + "." + year + " " + hour + ':' + minute + ':' + second;
    return time;
};


/*
on web:

async function hash(string) {
  const utf8 = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((bytes) => bytes.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}


salt = await hash(salt+'scpsl.store');
*/