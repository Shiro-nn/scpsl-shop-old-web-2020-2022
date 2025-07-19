const vhost = require('vhost');
const express = require("express"),
router = express.Router();
const DonatesData = require("../../base/donate");
const RolesData = require("../../base/roles");
const systemsData = require("../../base/system");
const config = require("../../config");
const host = config.dashboard.baseURL;
const cdn_host = config.dashboard.cdn;
const Servers = require('./modules/DonateServers');
const Roles = require('./modules/DonateRoles');
router.get('*', vhost('checkip.fydne.xyz', async(req, res) => res.send(req._ip)));
router.get('/', vhost(host, async(req, res) => {
	res.render("index.ejs", {cdn_host});
}));
router.get('/tps', vhost(host, async(req, res) => {
	res.render("system/tps.ejs", {cdn_host});
}));
router.get('/info', vhost(host, async(req, res) => {
	if(req.bs.data.user == null) return res.redirect('/authorization?redirect=info');
	const DonateData = await DonatesData.find({owner: req.bs.data.user.user});
	const RoleData = await RolesData.find({owner: req.bs.data.user.id});
	res.render("settings/info.ejs", {ddata: DonateData, rdata: RoleData, cdn_host, Servers, Roles});
}));
router.get('/profile', vhost(host, async(req, res) => {
	if(req.bs.data.user == null) return res.redirect('/authorization?redirect=profile');
	res.render("settings/profile.ejs", {cdn_host});
}));
router.get('/my/status', vhost(host, async(req, res) => {
	if(req.bs.data.user == null) return res.redirect('/authorization?redirect=my/status');
	res.render("status/my-status.ejs", {cdn_host});
}));
router.get('/trade', vhost(host, async(req, res) => {
	if(req.bs.data.user == null) return res.redirect('/authorization?redirect=trade');
	res.render("settings/trade.ejs", {cdn_host});
}));
router.get('/system', vhost(host, async(req, res, next) => {
	if(req.bs.data.user == null) return res.redirect('/authorization?redirect=system');
	if(req.bs.data.user.id != 1) return next();
	const sysdata = await systemsData.find();
	res.render("system/index.ejs", {sysdata, cdn_host, prettyMs: require('pretty-ms')});
}));
router.get('/locations', vhost(host, async(req, res, next) => {
	if(req.bs.data.user == null) return res.redirect('/authorization?redirect=system');
	if(req.bs.data.user.id != 1) return next();
	res.render("system/locations.ejs", {cdn_host});
}));

router.get('/signup', (req, res) => res.redirect('/authorization'));
router.get('/login', (req, res) => res.redirect('/authorization'));

router.get('/discord', (req, res) => res.redirect(`https://${config.dashboard.connect}/discord`));
router.get('/steam', (req, res) => res.redirect(`https://${config.dashboard.connect}/steam`));

router.get('/status', (req, res) => res.redirect('https://stats.uptimerobot.com/PM3Z6s4ym9'));

module.exports = router;