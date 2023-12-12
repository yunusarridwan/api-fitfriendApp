const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');

// middlewares
const { getResponseAuth } = require('./middlewares/userAuth');
const saveDataUser = require('./middlewares/saveDataUser');

// get env data
require('dotenv').config();

// create connection to mongodb
require('./model-db/db');

// get model-db
const User = require('./model-db/model');

const app = express();
const upload = multer();
const PORT = process.env.PORT || 8080;

// get data user login
app.put('/user', getResponseAuth, saveDataUser, (req, res) => {
	const { uid, userEmail, userName } = req.user;
	res
		.status(200)
		.json({ status: 'success', data: { uid, userEmail, userName } });
});

// change data user
app.put('/user/updateuser', getResponseAuth, (req, res) => {
	try {
		const { uid, email, name, data } = req.body;
		User.updateOne(
			{ _id: req.user._id },
			{
				$set: {
					name: name,
					email: email,
					data: {
						gender: req.body.gender,
						height: req.body.height,
						weight: req.body.weight,
					},
				},
			}
		).then(res.status(200).send(`Data ${uid} changed `));
	} catch (error) {
		res
			.status(500)
			.json({ error: `Failed to update data ${uid}. Error: ${error.message}` });
	}
});

// endpoint for upload and receive video
app.post(
	'/user/uploadvideo',
	getResponseAuth,
	upload.single('video'),
	async (req, res) => {
		if (req.file) {
		} else {
			res.status(400).send('Terjadi kesalahan saat mengunggah video.');
		}
	}
);

app.listen(PORT, () => {
	console.log(`app listening on port ${PORT}`);
});
