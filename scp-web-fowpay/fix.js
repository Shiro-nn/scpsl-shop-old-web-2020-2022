const BDupdate = async () => {
    let accountsData = require("./base/acctime");
    let adminsData = require("./base/admins");
    let users = await accountsData.find();
    users.forEach(async function(user) {
		if(user.id == 1){
			const adm = new adminsData({id:user.id});
			await adm.save();
		}
		if(user.sr || user.hr || user.ghr || user.ar || user.gar || user.asr){
			const adm = new adminsData({id:user.id});
			if(user.sr) adm.sl.trainee = true;
			else if(user.hr) adm.sl.helper = true;
			else if(user.ghr) adm.sl.mainhelper = true;
			else if(user.ar) adm.sl.admin = true;
			else if(user.gar) adm.sl.mainadmin = true;
			if(user.selection) adm.sl.mainadmin = true;
			adm.sl.bans = user.bans;
			adm.sl.kicks = user.kicks;
			adm.sl.punishments = user.mn;
			adm.sl.time = user.adminmin;
			adm.sl.slaves = user.asrc;
			await adm.save();
			console.log(user.user)
		}
	});
};

const BDupdate1 = async () => {
    let accountsData = require("./base/accounts");
    let OldaccountsData = require("./base/acctime");
    let users = await accountsData.find();
    
    users.forEach(async function(user) {
        let userData = await new OldaccountsData();
        userData.email = user.email;
        userData.id = user.id;
        userData.user = user.user;
        userData.pass = user.pass;
        userData.date = user.date;
        userData.balance = user.balance;
        userData.avatar = user.avatar;
        userData.banner = user.banner;
        userData.name = user.name;
        userData.clan = user.clan;
        userData.style = user.style;
        userData.steam = user.steam;
        userData.discord = user.discord;
        userData.prefix = user.prefix;
        userData.achievements = user.achievements;
        userData.ips = user.ips;
		
        userData.ip = user.ip;
        userData.cookie = user.cookie;
        userData.passKey = user.passKey;
        userData.time = user.time;
		
        userData.kicks = user.kicks;
        userData.bans = user.bans;
        userData.mn = user.mn;
        userData.adminmin = user.adminmin;
        userData.ytr = user.ytr;
        userData.sr = user.sr;
        userData.hr = user.hr;
        userData.ghr = user.ghr;
        userData.ar = user.ar;
        userData.gar = user.gar;
        userData.asr = user.asr;
        userData.dcr = user.dcr;
        userData.or = user.or;
        userData.asrc = user.asrc;
        userData.asrcm = user.asrcm;
        userData.asrch = user.asrch;
        userData.warnings = user.warnings;
        await userData.save();
        console.log(user.user);
    });
};
function DeleteLinks() {
    if(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig.test(user.user) ||
    /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig.test(user.name)){
        console.log(user.user)
        userdata.name = '[link deleted]';
        await userdata.save();
    }
    if(userdata.name == '[link deleted]') await userdata.remove();
}


router.get('/signup/discord', async(req, res) => {
	let cdn_host = cdn_host_link;
	if (req.cookies.cdn != undefined) cdn_host = cdn_reserve;
	if(req.session.discord === null || req.session.discord === undefined){
		res.redirect('/auth/discord')
	}else if(req.session.user == null || req.session.user == undefined){
		res.render("login/connect.ejs", {
			email : req.session.discord.email,
			user: `${req.session.discord.username}#${req.session.discord.discriminator}`,
			cdn_host
		});
	}else{
		res.redirect('/profile');
	}
});
router.post('/signup/discord', async(req, res) => {
	try{
		if(req.session.discord === null || req.session.discord === undefined){
			res.redirect('/auth/discord')
			return;
		}
		accountsData.findOne({ user: req.body['user'] }, async function(e, o) {
			if(o){
				res.status(400).send('username-taken');
			}else{
				accountsData.findOne({ email: req.body['email'] }, async function(e, o) {
					if(o){
						res.status(400).send('email-taken');
					}else{
						let steam;
						if(req.session.discord.connections === null || req.session.discord.connections === undefined) steam = '';
						else{
							req.session.discord.connections.forEach(connection => {
								if(connection.type === 'steam') steam = connection.id;
							});
						}
						let pass = req.body['pass'];
						saltAndHash(req.body['pass'], function(hash){
							pass = hash;
						});
						let counts = await countsData.findOne();
						if(counts === null || counts === undefined) {
							counts = new countsData();
							counts.save();
						}
						counts.accounts++;
						await counts.save();
						let link = `https://cdn.discordapp.com/avatars/${req.session.discord.id}/${req.session.discord.avatar}.png`;
						let name = 'png';
						let hash = guid();
						let dir = `scpsl.store/users/avatars/${counts.accounts}`;
						let _name = `${hash}.${name}`.replace("#", '').replace("?", '');
						axios.post(`${cdn_host_link}/upload/link`, {}, {
							params: {link, name: _name, dir}
						});
						let cdn_link = `${cdn_host_link}/${dir}/${_name}`;
						let ip = (req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress).replace('::ffff:', '');
						let accountData = new accountsData({
							email 	: req.body['email'],
							user 	: req.body['user'],
							name 	: req.body['nickname'],
							pass	: pass,
							avatar	: cdn_link,
							discord	: req.session.discord.id,
							steam	: steam,
							date    : GetDateTime(),
							id		: counts.accounts
						});
						req.session.user = accountData;
						accountData.ips.push({ip});
						await accountData.save();
						res.redirect('/profile');
					}
				});
			}
		});
	}catch{
		res.redirect('/login');
	}
});

router.get('/signup/steam', async(req, res) => {
	let cdn_host = cdn_host_link;
	if (req.cookies.cdn != undefined) cdn_host = cdn_reserve;
	if(req.session.steam === null || req.session.steam === undefined){
		res.redirect('/steam');
	}else if(req.session.user == null || req.session.user == undefined){
		res.render("login/connect.ejs", {
			email : '',
			user : req.session.steam.username,
			cdn_host
		});
	}else{
		res.redirect('/profile');
	}
});
router.post('/signup/steam', async(req, res) => {
	try{
		if(req.session.steam === null || req.session.steam === undefined){
			res.redirect('/steam')
			return;
		}
		accountsData.findOne({ user: req.body['user'] }, async function(e, o) {
			if(o){
				res.status(400).send('username-taken');
			}else{
				accountsData.findOne({ email: req.body['email'] }, async function(e, o) {
					if(o){
						res.status(400).send('email-taken');
					}else{
						let pass = req.body['pass'];
						saltAndHash(req.body['pass'], function(hash){
							pass = hash;
						});
						let counts = await countsData.findOne();
						if(counts === null || counts === undefined) {
							counts = new countsData();
							counts.save();
						}
						counts.accounts++;
						await counts.save();
						let link = req.session.steam.avatar.large;
						let name = link.split('.')[link.split('.').length - 1];
						let hash = guid();
						let dir = `scpsl.store/users/avatars/${counts.accounts}`;
						let _name = `${hash}.${name}`.replace("#", '').replace("?", '');
						axios.post(`${cdn_host_link}/upload/link`, {}, {
							params: {link, name: _name, dir}
						});
						let cdn_link = `${cdn_host_link}/${dir}/${_name}`;
						let ip = (req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress).replace('::ffff:', '');
						let accountData = new accountsData({
							email 	: req.body['email'],
							user 	: req.body['user'],
							name 	: req.body['nickname'],
							pass	: pass,
							avatar	: cdn_link,
							steam	: req.session.steam.steamid,
							date	: GetDateTime(),
							id		: counts.accounts
						});
						req.session.user = accountData;
						accountData.ips.push({ip});
						await accountData.save();
						res.redirect('/profile');
					}
				});
			}
		});
	}catch{
		res.redirect('/login');
	}
});