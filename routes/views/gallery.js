var keystone = require('keystone');
var async = require('async');
var Gallery = keystone.list('Gallery');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;
	locals.galleries = [];

	// Set locals
	locals.section = 'gallery';

	// Load the galleries by sortOrder
	view.on('init', function (next) {
		req.session.cat = (req.session.cat === undefined || req.query.cat == 'tatca') ? ['dientu','phukien','thoitrang'] : ((req.query.cat === undefined) ? req.session.cat : [req.query.cat]);
		req.session.sort = (req.query.sort === undefined) ? req.session.sort : req.query.sort;
		if (JSON.stringify(req.session.cat) == JSON.stringify(['dientu'])) {
			res.locals.showcat = 'Sản phẩm điện tử: ';
		} else if (JSON.stringify(req.session.cat) == JSON.stringify(['phukien'])) {
			res.locals.showcat = 'Sản phẩm phụ kiện: ';
		} else if (JSON.stringify(req.session.cat) == JSON.stringify(['thoitrang'])) {
			res.locals.showcat = 'Sản phẩm thời trang: ';
		} else if (JSON.stringify(req.session.cat) == JSON.stringify(['dientu','phukien','thoitrang'])) {
			res.locals.showcat = 'Tất cả sản phẩm: ';
		} else {
			res.locals.showcat = 'Sản phẩm: '+req.session.cat;
		}
			
		var q = Gallery.paginate({
				page: req.query.page || 1,
 				perPage: 8,
 				maxPages: 10,
				filters: {'categories':{$in:req.session.cat}}
			})
			.sort(req.session.sort);
	//		.populate('author categories');

		q.exec(function (err, results) {
			locals.galleries = results;
			next(err);
		});

	});
	
	// Render the view
	view.render('gallery');
};
