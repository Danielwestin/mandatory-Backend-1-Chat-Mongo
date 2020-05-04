const express = require('express');
const uuid = require('uuid').v4;
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const fs = require('fs');

const config = require('./config.json');
const port = config.port;

const { getClient, getDB, createObjectId } = require('./mongoDB');

app.use(express.json());

app.post('/create', (req, res) => {
	const type = req.query.type;
	const db = getDB();

	switch (type) {
		case 'user':
			const user = {
				...req.body
				// id: uuid()
			};

			db
				.collection('users')
				.insertOne(user)
				.then((result) => {
					// user._id = result.insertId;
					res.status(201).send(user);
				})
				.catch((e) => {
					console.error(e);
					res.status(500).end();
				});
			break;

		case 'room':
			const room = {
				...req.body,
				messages: []
			};

			db
				.collection('rooms')
				.insertOne(room)
				.then((result) => {
					res.status(201).send(room);
				})
				.catch((e) => {
					console.error(e);
					res.status(500).end();
				});
			break;
		default:
			res.status(400).send('invalig querystring');
	}
});

app.get('/rooms', (req, res) => {
	const db = getDB();
	db
		.collection('rooms')
		.find({})
		.toArray()
		.then((data) => {
			res.send(data);
		})
		.catch((e) => {
			console.error(e);
			res.status(500).end();
		});
});

app.get('/user/:id', (req, res) => {
	const id = req.params.id;
	const db = getDB();

	db
		.collection('users')
		.findOne({ _id: createObjectId(id) })
		.then((user) => {
			res.status(200).send(user);
		})
		.catch((e) => {
			console.error(e);
			res.status(500).end();
		});
});

app.get('/user/:userId/room/:roomId', (req, res) => {
	const roomId = req.params.roomId;
	const db = getDB();
	db
		.collection('rooms')
		.findOne({ _id: createObjectId(roomId) })
		.then((room) => {
			res.status(200).send(room);
		})
		.catch((e) => {
			console.error(e);
			res.status(400).end();
		});
});

app.delete('/room/:id', (req, res) => {
	const id = req.params.id;
	const db = getDB();

	db
		.collection('rooms')
		.remove({ _id: createObjectId(id) })
		.then(() => {
			res.status(204).end();
		})
		.catch((e) => {
			console.error(e);
			res.status(500).end();
		});
});

http.listen(port, () => {
	console.log('listening on port ' + port);
});
