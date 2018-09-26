var keystone = require('keystone');
var stripeSecretKey = keystone.get('stripe secret key');
var Stripe = require('stripe')(stripeSecretKey);
var Order = keystone.list('Order');


exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	locals.products = [];
	var new_cartItem = req.user.cartItem;
	var new_cartAmount = req.user.cartAmount;
	var pos_delete = req.user.cartItem.indexOf(req.query.id);
	
	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'cart';
	locals.validationErrors = {};

	
	view.on('init', function (next) {
		if (pos_delete != -1) {
			new_cartItem.splice(pos_delete,1);
			new_cartAmount.splice(pos_delete,1);
			keystone.list('User').model.findOne({ "email": req.user.email }).exec(function (err, result) {
				result.cartItem = new_cartItem;
				result.cartAmount = new_cartAmount;
				result.save(function(err) { /* post has been updated */ });
			});
		}
			
		keystone.list('Gallery').model.find().sort({name: 'ascending'}).where('name').in(new_cartItem).exec(function (err, results) {
			locals.products = results;
			next(err);
		});
	});
	
	view.on('post', { action: 'checkout' }, function () {
		
		var test = req.body.checked_items.split(',');
		var test_count = [];
		var orderType = 'other';
		
		if (req.body.stripeToken === '') {
			orderType = 'cod';
			
		} else {
			orderType = 'paid';
			const token = req.body.stripeToken;
			var today = new Date();
			var charge = Stripe.charges.create({
				currency: 'VND',
				amount: req.body.total_price, 
				source: token,
				description: 'Tuan Anh Shop charge',
				metadata: {order_date: today},
				}, function(err, charge) {
					if (err && err.type === 'StripeCardError') {
						res.json({ accepted: false, message: 'Payment Declined'})
						// The card has been declined
					} else {
						if (err) {
							console.log("We have an error!")
							console.log(err)
							res.json({ accepted: false, message: 'Payment Declined'})
						} else {
							// The card has been accepted
							console.log("Charged");
							console.log(charge);
						}
					}
				});
		}
		test.forEach(function(element) {
			var pos_each = new_cartItem.indexOf(element);
			test_count.push(new_cartAmount[pos_each]);
			new_cartItem.splice(pos_each,1);
			new_cartAmount.splice(pos_each,1);
		});
		
		keystone.list('User').model.findOne({ "email": req.user.email }).exec(function (err, result) {
				result.cartItem = new_cartItem;
				result.cartAmount = new_cartAmount;
				result.save(function(err) { /* post has been updated */ });
			});
		
		var newOrder = new Order.model();
		req.body.author = req.user._id;
		req.body.orderItem = test;
		req.body.orderAmount = test_count;
		req.body.price = req.body.total_price;
		req.body.orderType = orderType;
		var updater = newOrder.getUpdateHandler(req);

		updater.process(req.body, {
			flashErrors: true,
			fields: 'author, orderItem, orderAmount, price, orderType',
			errorMessage: 'There was a problem submitting your order:',
		}, function (err) {
			if (err) {
				locals.validationErrors = err.errors;
			} 
		});
		
		return res.redirect('/cart');
		
	});
	
	
	// Render the view
	view.render('cart');
	
};