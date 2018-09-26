var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Order Model
 * =============
 */

var Order = new keystone.List('Order', {
	noedit: false,
  nocreate: true,
  nodelete: true,
	map: { name: 'createdAt' },
	autokey: { path: 'slug', from: 'createdAt', unique: true },
});

Order.add({
	createdAt: { type: Date, default: Date.now },
	author: { type: Types.Relationship, ref: 'User', index: true},
	orderItem: { type: Types.TextArray },
	orderAmount: { type: Types.NumberArray },
	price: { type: Types.Number },
	orderType: { type: Types.Select, options: 'paid, cod, other', default: 'cod', index: true},
	orderStatus: { type: Types.Select, options: 'processing, packing and shipping, cancelled, returned, completed', default: 'processing', index: true},
	note: { type: Types.Markdown },
});

Order.defaultSort = '-createdAt';
Order.defaultColumns = 'createdAt, author, orderItem, orderAmount, price, orderType, orderStatus, note';
Order.register();
