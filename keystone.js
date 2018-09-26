// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
"use strict";
require('dotenv').config();

// Require keystone
var keystone = require('keystone');
var mangUser = [];
var mangAdmin = [];

class user {
    constructor (email, socketid, sessionid) {
      this.email = email;
      this.socketid = socketid;
      this.sessionid = sessionid;
    }
}

Array.prototype.pos = function(property,value) {
  var i;
  for (i = 0; i < this.length; i++) {
    if (this[i][property] == value) {
      return i;
    }
  }
  return -1;
};

Array.prototype.list = function(property) {
  var i;
  var mang = [];
  for (i = 0; i < this.length; i++) {
    mang[i] = this[i][property];
  }
  return mang;
};

// Initialise Keystone with your project's configuration.
// See http://keystonejs.com/guide/config for available options
// and documentation.

keystone.init({
	'name': 'Eshop',
	'brand': 'Eshop',

	'less': 'public',
	'static': 'public',
	'favicon': 'public/favicon.ico',
	'views': 'templates/views',
	'view engine': 'pug',

	'auto update': true,
	'session': true,
	'auth': true,
	'user model': 'User',
});

// Load your project's Models
keystone.import('models');

// Setup common locals for your templates. The following are required for the
// bundled templates and layouts. Any runtime locals (that should be set uniquely
// for each request) should be added to ./routes/middleware.js
keystone.set('locals', {
	_: require('lodash'),
	env: keystone.get('env'),
	utils: keystone.utils,
	editable: keystone.content.editable,
});

// Setup Store Gateway
keystone.set('store gateway', 'stripe');
// Setup Default Country
keystone.set('store country', 'Vietnam');

// Setup Stripe keys
keystone.set('stripe secret key', process.env.STRIPE_SECRET_KEY || 'STRIPE_SECRET_KEY');
keystone.set('stripe publishable key', process.env.STRIPE_PUBLISHABLE_KEY || 'STRIPE_PUBLISHABLE_KEY');

// Load your project's Routes
keystone.set('routes', require('./routes'));

// Configure the navigation bar in Keystone's Admin UI
keystone.set('nav', {
	posts: ['posts', 'post-categories'],
	galleries: 'galleries',
	enquiries: 'enquiries',
	users: 'users',
	orders: 'orders',
});

// Start Keystone to connect to your database and initialise the web server

keystone.start({
  onHttpServerCreated : function() {
		var io = require('socket.io');   
		io = io.listen(keystone.httpServer);
		io.on('connection', function (socket) {
			socket.on('initUser',function(data){
				var isAdmin = data[1];
				var AdminOnline = (mangAdmin.length > 0) ? true : false;
				if (isAdmin==='false') {
					socket.join('user');
					if (mangUser.pos("sessionid", data[2]) === -1){                                               /*user moi*/
      			console.log(data[0] + " is connected!!!");
      			mangUser.push(new user(data[0],socket.id,data[2]));
    			} else {
						console.log(data[0] + " is refreshed!!!");
						mangUser[mangUser.pos("sessionid", data[2])].socketid = socket.id;
					}
					socket.emit('is-admin-online',AdminOnline);
				}
				
				console.log(mangUser);
			});
			socket.on('initAdmin',function(data){
				var isAdmin = data[1];
				if (isAdmin==='true') {
					socket.join('admin');
					if (mangAdmin.pos("sessionid", data[2]) === -1){                                              /*user moi*/
      			console.log("admin "+ data[0] + " is connected!!!");
      			mangAdmin.push(new user(data[0],socket.id,data[2]));
						if (mangAdmin.length === 1){
							socket.to('user').emit('is-admin-online',true);	
						}
						io.in('admin').emit('danh-sach-admin',mangAdmin.list('email'));
    			} else {
						console.log("admin "+ data[0] + " is refreshed!!!");
						mangAdmin[mangAdmin.pos("sessionid", data[2])].socketid = socket.id;
					}
				}
				console.log(mangAdmin);
			});
			socket.on('user-send-message',function(data){
				socket.to('admin').emit('relay-user-message', data);
			});
			socket.on('admin-send-allUser',function(data){
				socket.to('user').emit('relay-to-allUser', data);
			});
			socket.on('admin-send-user',function(data){
				if (mangUser.pos("sessionid", data[0]) !== -1){
					io.to(mangUser[mangUser.pos("sessionid", data[0])].socketid).emit('relay-to-user',data[1]);
				}
			});
			socket.on('admin-send-allAdmin',function(data){
				socket.to('admin').emit('relay-admin-message', [mangAdmin[mangAdmin.pos("socketid", socket.id)].email, data]);
			});
			socket.on('admin-send-admin',function(data){
				if (mangAdmin.pos("email", data[0]) !== -1){
					io.to(mangAdmin[mangAdmin.pos("email", data[0])].socketid).emit('relay-admin-message', [mangAdmin[mangAdmin.pos("socketid", socket.id)].email, data[1]]);
				}
			});			
			
			socket.on('disconnect',function(){
				console.log(socket.id+' is disconnected!!!');
				var socket_no = socket.id;
				setTimeout(function(){
					if (mangUser.pos('socketid',socket_no) !== -1){mangUser.splice(mangUser.pos('socketid',socket_no),1)}
					if (mangAdmin.pos('socketid',socket_no) !== -1){
						mangAdmin.splice(mangAdmin.pos('socketid',socket_no),1);
						if (mangAdmin.length === 0){
							socket.to('user').emit('is-admin-online',false);	
						} else {
							socket.to('admin').emit('danh-sach-admin',mangAdmin.list('email'));
						}
					}
					}, 3000);
			});
		});
	}
});
