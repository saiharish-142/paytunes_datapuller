const express = require('express');
const app = express();
const port = process.env.PORT || 4000;
const mongoose = require('mongoose');
const cors = require('cors');
const { MONGOURI } = require('./config/dev');
const ObjectsToCsv = require('objects-to-csv');
const data = require('./data.json');
app.use(express.json());
const options = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverSelectionTimeoutMS: 900000000,
	socketTimeoutMS: 900000000,
	useCreateIndex: true,
	useFindAndModify: false,
	keepAlive: true,
	reconnectTries: 10
};

mongoose.connect(MONGOURI, options);
mongoose.connection.on('connected', () => {
	console.log('connected to database.....');
});
mongoose.connection.on('error', (err) => {
	console.log('error in connection', err);
});

require('./models/trackinglogs');
// dataGiver();
async function dataGiver() {
	console.log(data);
	const csv = new ObjectsToCsv(data);
	await csv.toDisk('./Data1.csv').then((sol) => console.log('sol')).catch((er) => console.log(er));
}
const trackinglogs = mongoose.model('trackinglogs_29jan22');
const phonemodel2reports = mongoose.model('phonemodel2reports');
const tempModel2 = mongoose.model('tempModel2');
const tempModel3 = mongoose.model('tempModel3');

app.get('/sho', (req, res) => {
	res.json('super');
});

app.get('/length', async (req, res) => {
	try {
		let data = await tempModel2.count();
		res.json(data);
	} catch (e) {
		res.status(422).json(e);
	}
});
console.log(new Date().getHours(), new Date().getMinutes());

app.get('/dataPuller2', async (req, res) => {
	// const { startDate, endDate } = req.body;
	console.log('Started');
	try {
		let data = await trackinglogs
			.aggregate([
				{
					$match: {
						type: {
							$in: [
								'impression',
								'complete',
								'click',
								'companionclicktracking',
								'clicktracking',
								'firstquartile',
								'thirdquartile',
								'midpoint',
								'start'
							]
						}
					}
				},
				{
					$project: {
						campaignId: '$campaignId',
						phoneModel: '$phoneModel',
						type: '$type'
					}
				},
				{
					$project: {
						campaignId: '$campaignId',
						phoneModel: '$phoneModel',
						type: '$type'
					}
				},
				{
					$group: {
						_id: { campaignId: '$campaignId', phoneModel: '$phoneModel', type: '$type' },
						count: { $sum: 1 }
					}
				},
				{
					$group: {
						_id: { campaignId: '$_id.campaignId', phoneModel: '$_id.phoneModel' },
						data: { $push: { k: '$_id.type', v: '$count' } }
					}
				},
				{
					$project: {
						campaignId: '$_id.campaignId',
						phoneModel: '$_id.phoneModel',
						data: { $arrayToObject: '$data' }
					}
				}
			])
			.allowDiskUse(true);
		var num = data.length;
		console.log(num);
		for (var i = 0; i < data.length; i++) {
			let tempo = await tempModel2.findOne({
				phoneModel: data[i].phoneModel,
				campaignId: data[i].campaignId
			});
			if (tempo) {
				if (tempo.start) {
					tempo.start += data[i].data.start ? data[i].data.start : 0;
				} else {
					tempo.start = data[i].data.start ? data[i].data.start : 0;
				}
				if (tempo.firstquartile) {
					tempo.firstquartile += data[i].data.firstquartile ? data[i].data.firstquartile : 0;
				} else {
					tempo.firstquartile = data[i].data.firstquartile ? data[i].data.firstquartile : 0;
				}
				if (tempo.midpoint) {
					tempo.midpoint += data[i].data.midpoint ? data[i].data.midpoint : 0;
				} else {
					tempo.midpoint = data[i].data.midpoint ? data[i].data.midpoint : 0;
				}
				if (tempo.thirdquartile) {
					tempo.thirdquartile += data[i].data.thirdquartile ? data[i].data.thirdquartile : 0;
				} else {
					tempo.thirdquartile = data[i].data.thirdquartile ? data[i].data.thirdquartile : 0;
				}
				if (tempo.complete) {
					tempo.complete += data[i].data.complete ? data[i].data.complete : 0;
				} else {
					tempo.complete = data[i].data.complete ? data[i].data.complete : 0;
				}
				if (tempo.impression) {
					tempo.impression += data[i].data.impression ? data[i].data.impression : 0;
				} else {
					tempo.impression = data[i].data.impression ? data[i].data.impression : 0;
				}
				if (tempo.click) {
					tempo.click += data[i].data.click
						? data[i].data.click
						: 0 + data[i].data.companionclicktracking
							? data[i].data.companionclicktracking
							: 0 + data[i].data.clicktracking ? data[i].data.clicktracking : 0;
				} else {
					tempo.click = data[i].data.click
						? data[i].data.click
						: 0 + data[i].data.companionclicktracking
							? data[i].data.companionclicktracking
							: 0 + data[i].data.clicktracking ? data[i].data.clicktracking : 0;
				}
				tempo
					.save()
					.then((ress) => {
						console.log('Updated', i);
					})
					.catch((err) => console.log(err, 'error'));
			} else {
				const storer = new tempModel2({
					phoneModel: data[i].phoneModel,
					campaignId: data[i].campaignId,
					firstquartile: data[i].data.firstquartile ? data[i].data.firstquartile : 0,
					thirdquartile: data[i].data.thirdquartile ? data[i].data.thirdquartile : 0,
					midpoint: data[i].data.midpoint ? data[i].data.midpoint : 0,
					start: data[i].data.start ? data[i].data.start : 0,
					impression: data[i].data.impression ? data[i].data.impression : 0,
					click: data[i].data.click
						? data[i].data.click
						: 0 + data[i].data.companionclicktracking
							? data[i].data.companionclicktracking
							: 0 + data[i].data.clicktracking ? data[i].data.clicktracking : 0,
					complete: data[i].data.complete ? data[i].data.complete : 0
				});
				storer
					.save()
					.then((result) => {
						console.log('saved', i);
					})
					.catch((err) => {
						console.log('err', i);
					});
			}
		}
	} catch (e) {
		console.log(e);
		res.status(422).json({ err: e });
	}
});

app.put('/dataPullerDatewiseDiv', async (req, res) => {
	const { startDate, endDate, collectionname } = req.body;
	if (!collectionname) {
		return res.json({ error: 'no collection name found' });
	}
	// const { startDate, endDate } = req.body;
	console.log('Started');
	console.log(startDate, endDate);
	try {
		const logsCollection = mongoose.model(collectionname);
		let data = await logsCollection
			.aggregate([
				{
					$project: {
						type: '$type',
						campaignId: '$campaignId',
						phoneModel: '$phoneModel',
						test: { $dateToString: { format: '%Y-%m-%d', date: '$createdOn' } }
					}
				},
				{
					$match: {
						test: { $gte: startDate, $lt: endDate },
						type: {
							$in: [
								'impression',
								'complete',
								'click',
								'companionclicktracking',
								'clicktracking',
								'firstquartile',
								'thirdquartile',
								'midpoint',
								'start'
							]
						}
					}
				},
				{
					$group: {
						_id: { phoneModel: '$phoneModel', campaignId: '$campaignId' },
						start: {
							$sum: {
								$cond: [ { $eq: [ '$type', 'start' ] }, 1, 0 ]
							}
						},
						firstquartile: {
							$sum: {
								$cond: [ { $eq: [ '$type', 'firstquartile' ] }, 1, 0 ]
							}
						},
						midpoint: {
							$sum: {
								$cond: [ { $eq: [ '$type', 'midpoint' ] }, 1, 0 ]
							}
						},
						thirdquartile: {
							$sum: {
								$cond: [ { $eq: [ '$type', 'thirdquartile' ] }, 1, 0 ]
							}
						},
						impression: {
							$sum: {
								$cond: [ { $eq: [ '$type', 'impression' ] }, 1, 0 ]
							}
						},
						complete: {
							$sum: {
								$cond: [ { $eq: [ '$type', 'complete' ] }, 1, 0 ]
							}
						},
						click: {
							$sum: {
								$cond: [
									{ $in: [ '$type', [ 'click', 'companionclicktracking', 'clicktracking' ] ] },
									1,
									0
								]
							}
						}
					}
				}
			])
			.allowDiskUse(true);
		var num = data.length;
		console.log(num);
		for (var i = 0; i < data.length; i++) {
			let tempo = await tempModel2.findOne({
				phoneModel: data[i]._id.phoneModel,
				campaignId: data[i]._id.campaignId
			});
			if (tempo) {
				if (tempo.start) {
					tempo.start += data[i].start ? data[i].start : 0;
				} else {
					tempo.start = data[i].start ? data[i].start : 0;
				}
				if (tempo.firstquartile) {
					tempo.firstquartile += data[i].firstquartile ? data[i].firstquartile : 0;
				} else {
					tempo.firstquartile = data[i].firstquartile ? data[i].firstquartile : 0;
				}
				if (tempo.midpoint) {
					tempo.midpoint += data[i].midpoint ? data[i].midpoint : 0;
				} else {
					tempo.midpoint = data[i].midpoint ? data[i].midpoint : 0;
				}
				if (tempo.thirdquartile) {
					tempo.thirdquartile += data[i].thirdquartile ? data[i].thirdquartile : 0;
				} else {
					tempo.thirdquartile = data[i].thirdquartile ? data[i].thirdquartile : 0;
				}
				if (tempo.complete) {
					tempo.complete += data[i].complete ? data[i].complete : 0;
				} else {
					tempo.complete = data[i].complete ? data[i].complete : 0;
				}
				if (tempo.impression) {
					tempo.impression += data[i].impression ? data[i].impression : 0;
				} else {
					tempo.impression = data[i].impression ? data[i].impression : 0;
				}
				if (tempo.click) {
					tempo.click += data[i].click
						? data[i].click
						: 0 + data[i].companionclicktracking
							? data[i].companionclicktracking
							: 0 + data[i].clicktracking ? data[i].clicktracking : 0;
				} else {
					tempo.click = data[i].click
						? data[i].click
						: 0 + data[i].companionclicktracking
							? data[i].companionclicktracking
							: 0 + data[i].clicktracking ? data[i].clicktracking : 0;
				}
				tempo
					.save()
					.then((ress) => {
						console.log('Updated', i);
					})
					.catch((err) => console.log(err, 'error'));
			} else {
				const storer = new tempModel2({
					phoneModel: data[i]._id.phoneModel,
					campaignId: data[i]._id.campaignId,
					firstquartile: data[i].firstquartile ? data[i].firstquartile : 0,
					thirdquartile: data[i].thirdquartile ? data[i].thirdquartile : 0,
					midpoint: data[i].midpoint ? data[i].midpoint : 0,
					start: data[i].start ? data[i].start : 0,
					impression: data[i].impression ? data[i].impression : 0,
					click: data[i].click
						? data[i].click
						: 0 + data[i].companionclicktracking
							? data[i].companionclicktracking
							: 0 + data[i].clicktracking ? data[i].clicktracking : 0,
					complete: data[i].complete ? data[i].complete : 0
				});
				storer
					.save()
					.then((result) => {
						console.log('saved', i);
					})
					.catch((err) => {
						console.log('err', i);
					});
			}
		}
	} catch (e) {
		console.log(e);
		res.status(422).json({ err: e });
	}
});

app.get('/datareturnerTemp2', async (req, res) => {
	try {
		var temp2 = await tempModel2.find({ impression: { $gte: 600 } });
		var modelsprice = await phonemodel2reports.find({ cost: { $exists: true } });
		var modelJson = {};
		modelsprice.map((x) => {
			if (x.cost) {
				modelJson[x.make_model] = x.cost;
			}
		});
		var data = [];
		temp2.map((x) => {
			if (x.phoneModel && modelJson[x.phoneModel.toUpperCase()]) {
				data.push({
					phoneModel: x.phoneModel,
					cost: modelJson[x.phoneModel.toUpperCase()],
					firstquartile: x.firstquartile,
					start: x.start,
					thirdquartile: x.thirdquartile,
					midpoint: x.midpoint,
					impression: x.impression,
					complete: x.complete,
					click: x.click
				});
			} else {
				data.push({
					phoneModel: x.phoneModel,
					cost: null,
					firstquartile: x.firstquartile,
					start: x.start,
					thirdquartile: x.thirdquartile,
					midpoint: x.midpoint,
					impression: x.impression,
					complete: x.complete,
					click: x.click
				});
			}
		});
		res.json(data);
	} catch (e) {
		console.log(e);
		return res.status(400).json({ error: e });
	}
});

app.get('/datareturnerTemp3', async (req, res) => {
	try {
		var temp2 = await tempModel3.find({ impression: { $gte: 600 } });
		var modelsprice = await phonemodel2reports.find({ cost: { $exists: true } });
		var modelJson = {};
		modelsprice.map((x) => {
			if (x.cost) {
				modelJson[x.make_model] = x.cost;
			}
		});
		var data = [];
		temp2.map((x) => {
			if (x.phoneModel && modelJson[x.phoneModel.toUpperCase()]) {
				data.push({
					phoneModel: x.phoneModel,
					phoneMake: x.phoneMake,
					dayOfWeek:x.dayOfWeek,
					cost: modelJson[x.phoneModel.toUpperCase()],
					impression: x.impression,
					complete: x.complete,
					click: x.click
				});
			} else {
				data.push({
					phoneModel: x.phoneModel,
					phoneMake: x.phoneMake,
					dayOfWeek:x.dayOfWeek,
					cost: null,
					impression: x.impression,
					complete: x.complete,
					click: x.click
				});
			}
		});
		res.json(data);
	} catch (e) {
		console.log(e);
		return res.status(400).json({ error: e });
	}
});

app.put('/dataPullerDatewiseDivmix', async (req, res) => {
	const { startDate, endDate, collectionname } = req.body;
	if (!collectionname) {
		return res.json({ error: 'no collection name found' });
	}
	try {
		const logsCollection = mongoose.model(collectionname);
		// const { startDate, endDate } = req.body;
		console.log('Started');
		console.log(startDate, endDate);
		let data = await logsCollection
			.aggregate([
				{
					$project: {
						type: '$type',
						campaignId: '$campaignId',
						phoneModel: '$phoneModel',
						phoneMake: '$phoneMake',
						dayOfWeek: { $dayOfWeek: '$createdOn' },
						test: { $dateToString: { format: '%Y-%m-%d', date: '$createdOn' } }
					}
				},
				{
					$match: {
						test: { $gte: startDate, $lt: endDate },
						type: {
							$in: [ 'impression', 'complete', 'click', 'companionclicktracking', 'clicktracking' ]
						}
					}
				},
				{
					$group: {
						_id: {
							phoneModel: '$phoneModel',
							campaignId: '$campaignId',
							phoneMake: '$phoneMake',
							dayOfWeek: '$dayOfWeek'
						},
						impression: {
							$sum: {
								$cond: [ { $eq: [ '$type', 'impression' ] }, 1, 0 ]
							}
						},
						complete: {
							$sum: {
								$cond: [ { $eq: [ '$type', 'complete' ] }, 1, 0 ]
							}
						},
						click: {
							$sum: {
								$cond: [
									{ $in: [ '$type', [ 'click', 'companionclicktracking', 'clicktracking' ] ] },
									1,
									0
								]
							}
						}
					}
				}
			])
			.allowDiskUse(true);
		var num = data.length;
		console.log(num);
		for (var i = 0; i < data.length; i++) {
			let tempo = await tempModel3.findOne({
				phoneModel: data[i]._id.phoneModel,
				phoneMake: data[i]._id.phoneMake,
				dayOfWeek: data[i]._id.dayOfWeek,
				campaignId: data[i]._id.campaignId
			});
			if (tempo) {
				if (tempo.complete) {
					tempo.complete += data[i].complete ? data[i].complete : 0;
				} else {
					tempo.complete = data[i].complete ? data[i].complete : 0;
				}
				if (tempo.impression) {
					tempo.impression += data[i].impression ? data[i].impression : 0;
				} else {
					tempo.impression = data[i].impression ? data[i].impression : 0;
				}
				if (tempo.click) {
					tempo.click += data[i].click
						? data[i].click
						: 0 + data[i].companionclicktracking
							? data[i].companionclicktracking
							: 0 + data[i].clicktracking ? data[i].clicktracking : 0;
				} else {
					tempo.click = data[i].click
						? data[i].click
						: 0 + data[i].companionclicktracking
							? data[i].companionclicktracking
							: 0 + data[i].clicktracking ? data[i].clicktracking : 0;
				}
				tempo
					.save()
					.then((ress) => {
						console.log('Updated', i);
					})
					.catch((err) => console.log(err, 'error'));
			} else {
				const storer = new tempModel3({
					phoneModel: data[i]._id.phoneModel,
					phoneMake: data[i]._id.phoneMake,
					dayOfWeek: data[i]._id.dayOfWeek,
					campaignId: data[i]._id.campaignId,
					impression: data[i].impression ? data[i].impression : 0,
					click: data[i].click
						? data[i].click
						: 0 + data[i].companionclicktracking
							? data[i].companionclicktracking
							: 0 + data[i].clicktracking ? data[i].clicktracking : 0,
					complete: data[i].complete ? data[i].complete : 0
				});
				storer
					.save()
					.then((result) => {
						console.log('saved', i);
					})
					.catch((err) => {
						console.log('err', i);
					});
			}
		}
	} catch (e) {
		console.log(e);
		res.status(422).json({ err: e });
	}
});

app.listen(port, () => console.log(`app listening on port ${port}!`));
