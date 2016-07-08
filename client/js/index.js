import React from 'react';
import ReactDOM from 'react-dom';

import Toggl from './components/toggl/toggl.js';
import style from './index.scss';

let root = document.querySelector('.container');

const url = "https://reaggle.herokuapp.com/api/entries/";

ReactDOM.render(
	<Toggl url={url}/>,
	root
);