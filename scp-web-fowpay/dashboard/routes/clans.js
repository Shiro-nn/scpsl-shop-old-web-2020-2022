const express = require("express"),
router = express.Router();
const vhost = require('vhost');
let accountsData = require("../../base/accounts");
let clansData = require("../../base/clans");
let invsData = require("../../base/invites");
const config = require("../../config");
const host = config.dashboard.baseURL;
const cdn_host = config.dashboard.cdn;
router.get('/clans/create', vhost(host, async(req, res) => {
	if (req.bs.data.user == null) return res.redirect('/authorization?redirect=clans/create');
	res.render("clans/create.ejs", {cdn_host});
}));
router.get('/clans/list', vhost(host, async(req, res) => {
	res.render("clans/list.ejs", {cdn_host});
}));
router.get('/clans/:tag', vhost(host, async(req, res) => {
	res.render("clans/clan.ejs", {cdn_host, tag:req.params.tag.toUpperCase(), render: 1});
}));
router.get('/clans/:tag/:type', vhost(host, async(req, res) => {
	let render = 1;
	const _type = req.params.type.toLowerCase();
	switch (_type) {
		case 'users': render = 2; break;
		case 'boosts': render = 3; break;
		case 'chat': render = 4; break;
		case 'settings': render = 5; break;
		default: break;
	}
	res.render("clans/clan.ejs", {cdn_host, tag:req.params.tag.toUpperCase(), render});
}));




router.get('/clans/wars', vhost(host, async(req, res) => {
	res.render("clans/wars/list.ejs", {cdn_host});
}));
router.get('/clans/wars/create', vhost(host, async(req, res) => {
	res.render("clans/wars/create.ejs", {cdn_host});
}));
router.get('/inv/:code', vhost(host, async(req, res, next) => {
	const inv_code = req.params.code;
	if (req.bs.data.user == null) return res.redirect(`/authorization?redirect=inv/${inv_code}`);
	const invite = await invsData.findOne({code: inv_code});
	if(invite === null || invite === undefined) return next();
	const clan = await clansData.findOne({tag: invite.clan});
	if(clan === null || clan === undefined) return next();
	const userData = await accountsData.findOne({ user: req.bs.data.user.user });
	if(clan.users.filter(x => x.user == userData.id).length < 1){
		clan.users.push({user: userData.id, access: 1});
		clan.markModified("users");
		const msg = `<@${userData.id}> вступил в клан по приглашению <@${invite.by}>.`;
		clan.notifications.push({msg, date: Date.now()});
		clan.markModified("notifications");
		await invite.remove();
		await clan.save();
	}
	if(userData.clan == ''){
		userData.clan = clan.tag;
		await userData.save();
	}
	try{res.redirect(`/clans/${invite.clan}`)}catch{}
}));



router.post('/clans/create', vhost(host, async(req, res) => {
	if (req.bs.data.user == null) return res.redirect('/authorization?redirect=clans/create');
	const data = req.body;
	if(data.clan_name == '') return res.status(418).send('name');
	let clan_tag = data.clan_tag.replace(/[^A-Za-z]/ig, '');
	if(clan_tag.length > 3) clan_tag = clan_tag.substr(0,4);
	while (clan_tag.length < 4) clan_tag+='0';
	clan_tag = clan_tag.toUpperCase();
	if(clan_tag == "LIST" || clan_tag == "WARS") return res.status(418).send('tag');
	const userData = await accountsData.findOne({ user: req.bs.data.user.user });
	const AllClans = await clansData.find();
	if(AllClans.filter(x => x.users.filter(y => y.user == userData.id && y.access == 5).length > 0).length > 0) return res.status(418).send('already');
	if(AllClans.filter(x => x.users.filter(y => y.user == userData.id).length > 0).length > 3) return res.status(418).send('many');
	if(userData.balance < 100) return res.status(418).send('money');
	const _clanData = await clansData.findOne({tag: clan_tag});
	if(_clanData != undefined && _clanData != null) return res.status(418).send('tag');
	const clanData = new clansData({tag: clan_tag});
	clanData.tag = clan_tag;
	clanData.name = data.clan_name;
	clanData.desc = data.clan_desc.substring(0, 300);
	clanData.public = data.clan_public;
	clanData.color = data.clan_color;
	clanData.users.push({user: userData.id, access: 5})
	await clanData.save();
	userData.balance -= 100;
	if(userData.clan == '') userData.clan = clan_tag;
	if(userData.achievements.filter(x => x == 'clan_owner').length < 1){
		userData.achievements.push('clan_owner');
	}
	await userData.save();
	res.status(200).send(`ok:/clans/${clanData.tag}`);
}));
module.exports = router;