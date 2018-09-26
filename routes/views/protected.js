var keystone = require('keystone');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'protected';
	if (req.user.isAdmin){
		view.render('protectedAdmin');
	} else {
		
		
	
	view.render('protected');}
};