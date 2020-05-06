import React from 'react';
import Chat from './components/Chat/Chat';
import Login from './components/Login/Login';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import './App.css';

export default function App() {
	return (
		<Router>
			<Route path="/" exact component={Login} />
			<Route path="/user/:userId" component={Chat} />
		</Router>
	);
}
