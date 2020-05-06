import React, { useEffect, useState } from 'react';

import axios from 'axios';
import Room from '../Room/Room';
import Menu from '../Menu/Menu';
import { useParams, Route } from 'react-router-dom';

export default function Chat(props) {
	const [ rooms, setRooms ] = useState([]);
	const [ username, setUsername ] = useState('');
	const { userId } = useParams();

	useEffect(
		() => {
			axios.get('/rooms').then((response) => {
				setRooms(response.data);
			});
			axios.get(`/user/${userId}`).then((response) => {
				console.log(response.data.username);

				setUsername(response.data.username);
			});
		},
		[ userId ]
	);

	return (
		<React.Fragment>
			<main className="Chat">
				<Menu rooms={rooms} setRooms={setRooms} username={username} />
				<div className="Chat__room">
					<Route exact path="/user/:userId/room/:roomId">
						<Room username={username} rooms={rooms} />
					</Route>
				</div>
			</main>
		</React.Fragment>
	);
}
