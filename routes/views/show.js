var keystone = require('keystone');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;
	
     
  if (req.session.newShow){
    keystone.list('Gallery').model.findOne({ "name": req.query.id }).exec(function(err, post) {
      post.views = post.views + 1;
      post.save(function(err) { /* post has been updated */ });
    });
    
  }
  
  req.session.newShow = false;
	
	view.on('init', function (next) {
		keystone.list('Gallery').model.findOne({ "name": req.query.id }).exec(function (err, result) {
			locals.item = result;
			next(err);
		});
	});
	
		// On POST requests, add the Enquiry item to the database
	view.on('post', { action: 'show' }, function () {
		var new_cartItem = req.user.cartItem;
		var new_cartAmount = req.user.cartAmount;
		
		if (req.user.cartItem.length === 0) {
			new_cartItem.push(req.query.id);
			new_cartAmount.push(req.body.itemcount);
		} else if (req.user.cartItem.indexOf(req.query.id) == -1) {
			var index = req.user.cartItem.length;
			var item = req.query.id;
			var compare = 0;			
			do {
				index = index - 1;
				compare = item.localeCompare(req.user.cartItem[index]);
			}
			while (compare === -1 && index > -1)
	
			
			new_cartItem.splice(index+1,0,req.query.id);
			new_cartAmount.splice(index+1,0,req.body.itemcount);
		} else {
			new_cartAmount[req.user.cartItem.indexOf(req.query.id)] = new_cartAmount[req.user.cartItem.indexOf(req.query.id)] - (-req.body.itemcount);
		}
		
		keystone.list('User').model.findOne({ "email": req.user.email }).exec(function (err, result) {
			result.cartItem = new_cartItem;
			result.cartAmount = new_cartAmount;
			result.save(function(err) { /* post has been updated */ });
		});
		return res.redirect('/cart');
	});
  
  // Render the view
	view.render('show');
  
};