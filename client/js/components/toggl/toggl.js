import React from 'react';
import moment from 'moment';
import $ from 'jquery';

import Timer from '../timer/timer.js';
import EntryList from '../entryList/entryList.js';

class Toggl extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			desc: "",
			proj: "",
			bill: false,
			startTime: moment(0),
			elapsedTime: moment(0),
			running: false
		}

		this.updateState = this.updateState.bind(this);
		this.startTimer = this.startTimer.bind(this);
		this.updateElapsedTime = this.updateElapsedTime.bind(this);
		this.onContinue = this.onContinue.bind(this);
		this.deleteEntry = this.deleteEntry.bind(this);
	}

	updateState(newState) {
		this.setState(newState);
	}

	componentDidMount() {
		this.fetchTimeList();
	}

	orderByDate(a, b) {
		var dateA = moment(a.from_date);
		var dateB = moment(b.from_date);

		if (dateA.isBefore(dateB)) {
			return 1;
		}
		if (dateA.isAfter(dateB)) {
			return -1;
		}
		return 0;
	}

	fetchTimeList() {
		$.ajax({
			method: "GET",
			url: this.props.url,
			success: function(data) {
				this.setState({ data: data.sort(this.orderByDate) });
			}.bind(this),
			error: function(xhr, status, err) {
				console.log(err);
			}
		});
	}

	sendTime(time) {
		var oldState = this.state.data;

		var trackedTime = { project: time.proj, 
			description: time.desc, 
			billable: time.bill, 
			from_date: time.startTime.format(), 
			to_date: time.endTime.format() };
		
		this.setState({ data: this.state.data.concat(trackedTime).sort(this.orderByDate) });

		$.ajax({
			method: "POST",
			url: this.props.url,
			data: trackedTime,
			success: function(data) {
				this.setState({ data: oldState.concat(data).sort(this.orderByDate) });
			}.bind(this),
			error: function(xhr, status, err) {
				console.log(err);
				this.setState({ data: oldState });
			}
		});
	}

	deleteEntry(entryId) {
		var oldState = this.state.data;

		var deleteEntryIndex = this.state.data.findIndex(function(element, index, array) {
			return element.id === entryId;
		});

		var newData = this.state.data.slice();
		newData.splice(deleteEntryIndex, 1);

		this.setState({ data: newData });

		$.ajax({
			method: "DELETE",
			url: this.props.url + entryId + "/",
			error: function(xhr, status, err) {
				console.log(err);
				this.setState({ data: oldState });
			}.bind(this)
		});
	}

	onContinue(entry) {
		this.setState(entry);
		this.startTimer();
	}

	updateElapsedTime() {
		this.setState({ elapsedTime: this.state.elapsedTime.add(1, 'second') });
	}

	startTimer() {
		if (!this.state.running) {
			this.timeHandler = setInterval(this.updateElapsedTime, 1000);
			this.setState({ running: true, startTime: moment() });
		} else {
			if (!this.state.desc || !this.state.proj) {
				return;
			}
			this.sendTime({ desc: this.state.desc, proj: this.state.proj, bill: this.state.bill, startTime: this.state.startTime, endTime: moment() });
			clearInterval(this.timeHandler);
			this.setState({
				desc: "", 
				proj: "", 
				bill: false, 
				startTime: moment(0), 
				elapsedTime: moment(0), 
				running: false
			});
		}
	}

	render() {
		return (
			<div className="toggl">
				<h1>ReagglE</h1>
				<Timer handleTimeStop={this.sendTime}
					desc={this.state.desc}
					proj={this.state.proj}
					bill={this.state.bill}
					startTime={this.state.startTime}
					elapsedTime={this.state.elapsedTime}
					running={this.state.running}
					handleFormSubmit={this.startTimer}
					updateParentState={this.updateState}/>
				<EntryList entries={this.state.data} handleDelete={this.deleteEntry} onContinue={this.onContinue}/>
			</div>
		);
	}
}

export default Toggl;