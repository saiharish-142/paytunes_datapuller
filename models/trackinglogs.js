const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const trackinglogs29jan22Schema = new mongoose.Schema({
	id: String,
	appId: { type: String },
	campaignId: { type: String },
	type: { type: String },
	region: { type: String },
	ifa: { type: String },
	date: { type: String },
	rtbreqid: { type: ObjectId },
	url: { type: String },
	zip: { type: String },
	rtbType: { type: String },
	phoneMake: { type: String },
	phoneModel: { type: String },
	platformType: { type: String },
	osVersion: { type: String },
	language: { type: String },
	pptype: { type: String },
	bundle: { type: String },
	bundlename: { type: String },
	createdOn: { type: Date, default: Date.now },
	citylanguage: { type: String }
});

const tempModel1Schema = new mongoose.Schema({
	zip: { type: String },
	startDate: { type: String },
	impression: { type: Number },
	click: { type: Number },
	complete: { type: Number }
});
tempModel1Schema.index({ zip: 1 });

const tempModel2Schema = new mongoose.Schema({
	phoneModel: { type: String },
	campaignId: { type: String },
	impression: { type: Number },
	click: { type: Number },
	firstquartile: { type: Number },
	thirdquartile: { type: Number },
	midpoint: { type: Number },
	start: { type: Number },
	complete: { type: Number }
});
tempModel2Schema.index({ campaignId: 1, time: 1 });

const trackinglogs8oct21Schema = new mongoose.Schema({
	id: String,
	appId: { type: String },
	campaignId: { type: String },
	type: { type: String },
	region: { type: String },
	ifa: { type: String },
	date: { type: String },
	rtbreqid: { type: ObjectId },
	url: { type: String },
	zip: { type: String },
	rtbType: { type: String },
	phoneMake: { type: String },
	phoneModel: { type: String },
	platformType: { type: String },
	osVersion: { type: String },
	language: { type: String },
	pptype: { type: String },
	bundle: { type: String },
	bundlename: { type: String },
	createdOn: { type: Date, default: Date.now },
	citylanguage: { type: String }
});

var phonemodel2reportsSchema = new mongoose.Schema({
	cost: Number,
	make_model: String,
	cumulative: String,
	release: String,
	rtbType: String,
	company: String,
	type: String,
	total_percent: String,
	model: String,
	combined_make_model: String,
	impression: Number,
	click: Number
});
phonemodel2reportsSchema.index({ make_model: 1 });

phonemodel2reportsSchema.statics.load = function(id, cb) {
	this.findOne({
		_id: id
	}).exec(cb);
};

mongoose.model('phonemodel2reports', phonemodel2reportsSchema);
mongoose.model('trackinglogs8oct21', trackinglogs8oct21Schema);
mongoose.model('trackinglogs_29jan22', trackinglogs29jan22Schema);
mongoose.model('tempModel1', tempModel1Schema);
mongoose.model('tempModel2', tempModel2Schema);
