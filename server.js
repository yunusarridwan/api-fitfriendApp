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
const port = process.env.PORT || 8080;

// get data user login
app.put('/user', getResponseAuth, saveDataUser, (req, res) => {
	const { uid, userEmail, userName } = req.user;
	res
		.status(200)
		.json({ status: 'success', data: { uid, userEmail, userName } });
});

// change data user
app.put('/user/updateUser', getResponseAuth, (req, res) => {
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
app.post('/upload', upload.single('video'), async (req, res) => {
	if (req.file) {
		const options = {
			method: 'POST',
			body: new FormData().append('video', req.file.buffer, {
				filename: req.file.originalname,
				contentType: req.file.mimetype,
			}),
		};

		try {
			const response = await fetch(
				'<flask-cloud-run-url>/process_video',
				options
			);
			if (response.ok) {
				console.log('Video berhasil diproses!');
				res.send('Video berhasil diunggah!');
			} else {
				console.log('Terjadi kesalahan saat memproses video.');
				res.status(400).send('Terjadi kesalahan saat memproses video.');
			}
		} catch (error) {
			console.log('Terjadi kesalahan saat mengirim permintaan.');
			res.status(400).send('Terjadi kesalahan saat mengirim permintaan.');
		}
	} else {
		res.status(400).send('Terjadi kesalahan saat mengunggah video.');
	}
});

app.listen(port, () => {
	console.log(`app listening on port ${port}`);
});
