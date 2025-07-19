const vhost = require('vhost');
const express = require("express"),
router = express.Router();
const Roles = require('./modules/DonateRoles');
const Servers = require('./modules/DonateServers');
const accountsData = require("../../base/accounts");
const DonatesData = require("../../base/donate");
const RolesData = require("../../base/roles");
const config = require("../../config");
const host = config.dashboard.baseURL;
const cdn_host = config.dashboard.cdn;
router.get('/donate', vhost(host, async(req, res) => {
	if (req.bs.data.user == null) return res.redirect(`/authorization?redirect=donate`);
	res.render("donate/index.ejs", {cdn_host});
}));
router.get('/donate/ra', vhost(host, async(req, res) => {
	if (req.bs.data.user == null) return res.redirect(`/authorization?redirect=donate/ra`);
	const servers = Servers.GetAll();
	res.render("donate/ra.ejs", {cdn_host, servers});
}));
router.get('/donate/roles', vhost(host, async(req, res) => {
	if (req.bs.data.user == null) return res.redirect(`/authorization?redirect=donate/roles`);
	const servers = Servers.GetAll();
	res.render("donate/roles.ejs", {cdn_host, servers});
}));
router.get('/donate/customize', vhost(host, async(req, res) => {
	if (req.bs.data.user == null) return res.redirect(`/authorization?redirect=donate/customize`);
	res.render("donate/customize.ejs", {cdn_host});
}));
router.get('/donate/visual', vhost(host, async(req, res) => {
	if (req.bs.data.user == null) return res.redirect(`/authorization?redirect=donate/visual`);
	res.render("donate/visual.ejs", {cdn_host});
}));
router.get('/donate/manage', vhost(host, async(req, res, next) => {
	if (req.bs.data.user == null) return res.redirect(`/authorization?redirect=donate/manage`);
	if(req.bs.data.user.id != 1) return next();
	const DonateData = await DonatesData.find();
	const RoleData = await RolesData.find();
	const allData = await accountsData.find();
	res.render("donate/control.ejs", {
		adata: allData,
		ddata: DonateData,
		rdata: RoleData,
		cdn_host, Servers, Roles
	});
}));
router.get('/donate/rules', vhost(host, async(req, res) => {
	res.render("donate/rules/main.ejs", {cdn_host});
}));
router.get('/donate/rules/frame', vhost(host, async(req, res) => {
	res.render("donate/rules/frame.ejs", {cdn_host});
}));
module.exports = router;