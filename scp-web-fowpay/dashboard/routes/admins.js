const vhost = require('vhost');
const express = require("express"),
router = express.Router();
const AdminsModule = require('./modules/admins');
const adminsData = require("../../base/admins");
const logsData = require("../../base/ra-logs");
const config = require("../../config");
const host = config.dashboard.baseURL;
const cdn_host = config.dashboard.cdn;

router.get('/ra-logs', vhost(host, async(req, res, next) => {
	if(req.bs.data.user == null) return res.redirect('/authorization?redirect=ra-logs');
	const adminData = await adminsData.findOne({id: req.bs.data.user.id});
	if(adminData == null || adminData == undefined) return next();
	if(!AdminsModule.ItsSlAdmin(adminData)) return next();
	let logs = await logsData.findOne({type:1});
	if(logs === null || logs === undefined) logs = await new logsData({type:1}).save();
	res.render('settings/admins/ra-logs.ejs', {logs, cdn_host});
}));
router.get('/ra-logs/hrp', vhost(host, async(req, res, next) => {
	if(req.bs.data.user == null) return res.redirect('/authorization?redirect=ra-logs/hrp');
	const adminData = await adminsData.findOne({id: req.bs.data.user.id});
	if(adminData == null || adminData == undefined) return next();
	if(!AdminsModule.ItsHrpSlAdmin(adminData)) return next();
	let logs = await logsData.findOne({type:3});
	if(logs === null || logs === undefined) logs = await new logsData({type:3}).save();
	res.render('settings/admins/ra-logs.ejs', {logs, cdn_host});
}));
router.get('/ra-logs/donate', vhost(host, async(req, res, next) => {
	if(req.bs.data.user == null) return res.redirect('/authorization?redirect=ra-logs/donate');
	if(req.bs.data.user.id != 1) return next();
	let logs = await logsData.findOne({type:2});
	if(logs === null || logs === undefined) logs = await new logsData({type:2}).save();
	res.render('settings/admins/ra-logs.ejs', {logs, cdn_host});
}));

router.get('/admins/sl/stats', vhost(host, async(req, res, next) => {
	if(req.bs.data.user == null) return res.redirect('/authorization?redirect=admins/sl/stats');
	const adminData = await adminsData.findOne({id: req.bs.data.user.id});
	if(adminData == null || adminData == undefined) return next();
	if(!AdminsModule.ItsSlAdmin(adminData)) return next();
	const allData = await adminsData.find();
	res.render("settings/admins/stats.ejs", {
		admdata: adminData,
		adata: allData.filter(x => AdminsModule.ItsSlAdmin(x)),
		cdn_host, aid: 1
	});
}));
router.get('/admins/sl/list', vhost(host, async(req, res, next) => {
	if(req.bs.data.user == null) return res.redirect('/authorization?redirect=admins/sl/all');
	const adminData = await adminsData.findOne({ id: req.bs.data.user.id });
	if(adminData == null || adminData == undefined) return next();
	if(!AdminsModule.ItsSlAdmin(adminData)) return next();
	let allData = await adminsData.find();
	res.render("settings/admins/list.ejs", {
		admdata: adminData,
		adata: allData.filter(x => AdminsModule.ItsSlAdmin(x)),
		cdn_host, ra: '/ra-logs', aid: 1
	});
}));

router.get('/admins/hrp/stats', vhost(host, async(req, res, next) => {
	if(req.bs.data.user == null) return res.redirect('/authorization?redirect=admins/hrp/stats');
	const adminData = await adminsData.findOne({ id: req.bs.data.user.id });
	if(adminData == null || adminData == undefined) return next();
	if(!AdminsModule.ItsHrpSlAdmin(adminData)) return next();
	const allData = await adminsData.find();
	res.render("settings/admins/stats.ejs", {
		admdata: adminData,
		adata: allData.filter(x => AdminsModule.ItsHrpSlAdmin(x)),
		cdn_host, aid: 2
	});
}));
router.get('/admins/hrp/list', vhost(host, async(req, res, next) => {
	if(req.bs.data.user == null) return res.redirect('/authorization?redirect=admins/hrp/all');
	const adminData = await adminsData.findOne({ id: req.bs.data.user.id });
	if(adminData == null || adminData == undefined) return next();
	if(!AdminsModule.ItsHrpSlAdmin(adminData)) return next();
	let allData = await adminsData.find();
	res.render("settings/admins/list.ejs", {
		admdata: adminData,
		adata: allData.filter(x => AdminsModule.ItsHrpSlAdmin(x)),
		cdn_host, ra: '/ra-logs/hrp', aid: 2
	});
}));

module.exports = router;