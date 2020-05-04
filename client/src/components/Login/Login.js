import React, { useState } from 'react';
import axios from 'axios';
import { Redirect } from 'react-router-dom';

export default function Login(props) {
	const [ user, setUser ] = useState({ username: '' });
	const [ online, setOnline ] = useState({ status: false, id: '' });

	const set = (e) => {
		setUser({
			...user,
			[e.target.name]: e.target.value
		});
	};

	const submitUser = (e) => {
		e.preventDefault();

		if (user.username.length > 1) {
			axios
				.post('/create?type=user', user)
				.then((response) => {
					console.log(response.data, 'USER CREATED');

					setOnline({ status: true, id: response.data._id });
				})
				.catch((error) => {
					console.log(error);
				});
		}
	};

	console.log(user);

	return (
		<main className="Login">
			{online.status && <Redirect to={'/' + online.id} />}

			<section className="Login__section">
				<h1>Login</h1>
				<form onSubmit={submitUser} className="Login__form">
					<input
						type="text"
						name="username"
						value={user.username}
						onChange={set}
						placeholder="Användarnamn"
					/>
					<button type="submit">Submit</button>
				</form>
			</section>
		</main>
	);
}
