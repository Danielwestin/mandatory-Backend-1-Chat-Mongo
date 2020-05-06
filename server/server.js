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
					console.log('username already exists');

					console.error(e);
					res.status(500).end();
				});
			break;

		case 'room':
			const room = {
				...req.body,
				messages: [
					{
						user: 'Admin',
						content: 'Hello'
					}
				]
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

app.get('/user/:userId', async (req, res) => {
	const id = req.params.userId;
	const db = getDB();

	db
		.collection('users')
		.findOne({ _id: createObjectId(id) })
		.then((user) => {
			res.status(200).send(user);
		})
		.catch((e) => {
			console.log('ERROR IN GET USER ID');

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

app.delete('/room/:id', async (req, res) => {
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

io.on('connection', (socket) => {
	console.log('a user connected');
	socket.on('join', ({ username, roomId }) => {
		socket.join(roomId);

		const adminMessage = {
			user: 'Admin',
			content: `${username}, welcome to the room`
		};

		socket.emit('message', adminMessage);
		socket.broadcast.to(roomId).emit('message', {
			user: 'Admin',
			content: `${username} has joined`
		});
	});

	socket.on('disconnect', () => {
		console.log('A user just left!');
	});

	socket.on('new_message', ({ user, content, roomId }) => {
		const message = {
			user,
			content
		};
		socket.to(roomId).emit('message', message);

		// Rooms.saveMessage(roomId, message);
		const db = getDB();
		db
			.collection('rooms')
			.updateOne(
				{ _id: createObjectId(roomId) },
				{ $push: { messages: message } }
			)
			.then((result) => {})
			.catch((e) => {
				console.error(e, 'error in db catch');
			});
	});
});

http.listen(port, () => {
	console.log('listening on port ' + port);
});
