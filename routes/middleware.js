/**
 * This file contains the common middleware used by your routes.
 *
 * Extend or replace these functions as your application requires.
 *
 * This structure is not enforced, and just a starting point. If
 * you have more middleware you may want to group it as separate
 * modules in your project's /lib directory.
 */
var _ = require('lodash');

/**
	Initialises the standard view locals

	The included layout depends on the navLinks array to generate
	the navigation in the header, you may wish to change this array
	or replace it with your own templates / logic.
*/
exports.initLocals = function (req, res, next) {
	res.locals.navLinks = [
		{ label: 'Gallery', key: 'gallery', href: '/gallery' },
		{ label: 'Contact', key: 'contact', href: '/contact' },
		{ label: 'Protected', key: 'protected', href: '/protected' },
		{ label: 'Cart', key: 'cart', href: '/cart' },
		{ label: 'Sign Up', key: 'signup', href: '/signup' },
	];
	if (!req.user) {
		res.locals.user = {'email':req.sessionID,'isAdmin':false, 'isMimic':true};
	} else {
		res.locals.user = req.user;
		res.locals.user.isMimic = false;
	}
	res.locals.sessionID = req.sessionID;
	if (req.path !== '/show') { req.session.newShow = true; }
	if (req.path !== '/gallery') { 
		req.session.cat = ['dientu','phukien','thoitrang'];
		req.session.sort = 'name';
	} 

	
	next();
};


/**
	Fetches and clears the flashMessages before a view is rendered
*/
exports.flashMessages = function (req, res, next) {
	var flashMessages = {
		info: req.flash('info'),
		success: req.flash('success'),
		warning: req.flash('warning'),
		error: req.flash('error'),
	};
	res.locals.messages = _.some(flashMessages, function (msgs) { return msgs.length; }) ? flashMessages : false;
	next();
};


/**
	Prevents people from accessing protected pages when they're not signed in
 */
exports.requireUser = function (req, res, next) {
	if (!req.user) {
		req.flash('error', 'Please sign in to access this page.');
		res.redirect('/signup');
	} else {
		next();
	}
};