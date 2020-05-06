import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import Axios from 'axios';
let socket = io('localhost:8000');

const Room = ({ username }) => {
	const [ messages, setMessages ] = useState([]);
	const [ oldMessages, setOldMessages ] = useState([]);
	const [ message, setMessage ] = useState('');
	const scrollRef = useRef(null);

	const { userId, roomId } = useParams();

	useEffect(
		() => {
			if (!username) return;
			setMessages([]);
			Axios.get(`/user/${userId}/room/${roomId}`).then((response) => {
				console.log(response.data.messages, 'AXIOS GET');
				setOldMessages(response.data.messages);
			});
			socket.emit('join', { username, roomId }, (response) => {
				console.log(response, 'SOCKET EMIT JOIN');
			});
		},
		[ roomId, userId, username ]
	);

	useEffect(() => {
		socket.on('message', (data) => {
			setMessages((messages) => {
				return [ ...messages, data ];
			});
		});
	}, []);

	const send = (e) => {
		e.preventDefault();

		if (message.length >= 1) {
			socket.emit('new_message', {
				user: username,
				content: message,
				roomId: roomId
			});
			setMessages((messages) => [
				...messages,
				{
					content: message,
					user: username
				}
			]);

			setMessage('');
		}
	};

	if (!roomId) return null;
	return (
		<main className="Room">
			<div className="Room__messages">
				{!oldMessages ? null : (
					oldMessages.map((message, i) => (
						<p key={i}>
							{message.user}: {message.content}
						</p>
					))
				)}

				{messages.map((message, i) => (
					<p key={i}>
						{message.user}: {message.content}
					</p>
				))}
				<div ref={scrollRef} />
			</div>
			<form onSubmit={send} className="Room__form">
				<input
					placeholder="Write something funny"
					type="text"
					value={message}
					onChange={(e) => {
						setMessage(e.target.value);
					}}
				/>
			</form>
		</main>
	);
};

export default Room;
