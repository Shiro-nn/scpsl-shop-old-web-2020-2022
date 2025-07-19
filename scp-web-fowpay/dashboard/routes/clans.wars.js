const express = require("express"),
router = express.Router();
router.post('/clans/wars/create', vhost(host, async(req, res) => {
	const clan_tag = req.params.tag.toUpperCase();
	if(req.bs.data.user == null) return res.redirect(`/clans?redirect=clans/${clan_tag}`);
	const data = req.body;
	const clan = await clansData.findOne({ tag: clan_tag });
	if(clan === null || clan === undefined) return res.status(404).send('404');
	if(clan.users.filter(x => x.user == req.bs.data.user.id).length > 0 && clan.users.filter(x => x.user == req.bs.data.user.id)[0].access >= 3){
		clan.desc = data.desc.substring(0, 300);
		await clan.save();
		res.status(200).send('ok');
	}
	else res.status(404).send('404');
}));
module.exports = router;