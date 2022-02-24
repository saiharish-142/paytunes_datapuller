const express = require('express');
const app = express();
const port = process.env.PORT || 5321;
const mongoose = require('mongoose');
const cors = require('cors');
const { MONGOURI } = require('./config/dev');
const ObjectsToCsv = require('objects-to-csv');
const data = require('./data.json');

const options = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverSelectionTimeoutMS: 9000000,
	socketTimeoutMS: 9000000,
	useCreateIndex: true,
	useFindAndModify: false
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
const tempModel2 = mongoose.model('tempModel2');

app.get('/sho', (req, res) => {
	res.json('super');
});

app.get('/dataPuller2', async (req, res) => {
	const { startDate, endDate } = req.body;
	console.log(startDate, endDate, 'Started');
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

app.listen(port, () => console.log(`app listening on port ${port}!`));
