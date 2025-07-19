const config = require('../config');

module.exports = (router) => {
router.get('/', async(req, res, next) => {
	res.render('main/index.ejs', {cdn:config.cdn});
});
}