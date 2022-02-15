const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const mongoose = require('mongoose');
const cors = require('cors');
const { MONGOURI } = require('./config/dev');
const ObjectsToCsv = require('objects-to-csv');
const data = require('./data.json');

// dataGiver();
async function dataGiver() {
	console.log(data);
	const csv = new ObjectsToCsv(data);
	await csv.toDisk('./Data1.csv').then((sol) => console.log('sol')).catch((er) => console.log(er));
}

app.listen(port, () => console.log(`app listening on port ${port}!`));
