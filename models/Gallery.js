var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Gallery Model
 * =============
 */

var Gallery = new keystone.List('Gallery', {
	autokey: { from: 'name', path: 'key', unique: true },
});

Gallery.add({
	name: { type: String, required: true },
	publishedDate: { type: Date, default: Date.now },
	heroImage: { type: Types.CloudinaryImage },
	images: { type: Types.CloudinaryImages },
	price: { type: Types.Number, required: true, default: 999999 },
	sale: { type: Types.Number, default: 0 },
  views: { type: Types.Number, default: 0 },
	categories: { type: Types.TextArray },
});

Gallery.register();
