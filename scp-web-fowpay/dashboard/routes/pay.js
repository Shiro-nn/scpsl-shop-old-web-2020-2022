const Mails = require('./modules/mails/Manager');
const express = require("express"),
router = express.Router();
const vhost = require('vhost');
let accountsData = require("../../base/accounts");
let paymentsData = require("../../base/payments");
const config = require("../../config");
const host = config.dashboard.baseURL;
const APIhost = config.dashboard.api;
const { Webhook } = require('discord-webhook-node');
router.all('/api/fowpay/check', vhost(host, async(req, res) => CheckPayAPI(req, res)));
router.all('/fowpay/check', vhost(APIhost, async(req, res) => CheckPayAPI(req, res)));
async function CheckPayAPI(req, res){
	try{
		if(req._ip != '95.217.234.134') return res.sendStatus(403);
		let payData = await paymentsData.findOne();
		if(payData === null || payData === undefined) {
			payData = new paymentsData();
		}
		const payment = payData.payments.find(x => x.id == req.query.ORDER_ID);
		if(payment == null || payment == undefined) return res.sendStatus(403);
		const userdata = await accountsData.findOne({ user: payment.user });
		userdata.balance += parseInt(req.query.AMOUNT);
		await userdata.save();
		if(userdata.achievements.filter(x => x == 'donater').length < 1){
			userdata.achievements.push('donater');
			await userdata.save();
		}
		res.sendStatus(200);
		payData.payments.pull(payment);
		payData.markModified('payments')
		await payData.save();
		Mails.donates.balanceup(userdata, parseInt(req.query.AMOUNT), 'FowPay');
	}catch(err){
        const hook = new Webhook("https://discord.com/api/webhooks/");
        hook.send(`Произошла ошибка.\nМестоположение: \`${req.protocol}://${req.get("host")}${req.originalUrl}\`\nКод ошибки:\n${err}`);
		res.sendStatus(400);
    }
};
module.exports = router;