var TimeEntry = React.createClass({
	handleDelete: function() {
		this.props.handleDelete(this.props.id);
	},

	handleContinue: function() {
		this.props.onContinue({
			desc: this.props.desc,
			proj: this.props.proj,
			bill: this.props.bill,
			startTime: moment(),
			elapsedTime: moment(0),
			running: true
		});
	},

	render: function() {
		var start = moment(this.props.startTime);
		var end = moment(this.props.endTime);
		var duration = moment.duration(end.diff(start));
		var elapsedTime = moment.utc(end.diff(start)).format('HH:mm:ss');

		return (
			<tr className="time-entry">
				<td className="entry-desc">{this.props.desc}</td>
				<td className="entry-proj">{this.props.proj}</td>
				<td className="entry-billable">{this.props.bill ? "$" : ""}</td>
				<td className="entry-continue" onClick={this.handleContinue}>▶</td>
				<td className="elapsed-time">{elapsedTime}</td>
				<td className="entry-start">{start.format("MMM DD, hh:mm:ss")}</td>
				<td className="entry-end">{end.format("MMM DD, hh:mm:ss")}</td>
				<td className="entry-delete" onClick={this.handleDelete}>Delete</td>
			</tr>
		);
	}
});

var EntryList = React.createClass({
	render: function() {
		var entries = this.props.entries.map(function(element) {
			return <TimeEntry key={element.id} 
				id={element.id}
				desc={element.description} 
				proj={element.project} 
				bill={element.billable} 
				startTime={element.from_date} 
				endTime={element.to_date}
				handleDelete={this.props.handleDelete}
				onContinue={this.props.onContinue}/>
		}.bind(this));

		return (
			<table className="time-list">
				<tbody>
					{entries}
				</tbody>
			</table>
		);
	},

	shouldComponentUpdate: function(nextProps, nextState) {
		return this.props.entries !== nextProps.entries;
	}
});

var Timer = React.createClass({
	onDescChange: function(element) {
		this.props.updateParentState({ desc: element.target.value });
	},

	onProjChange: function(element) {
		this.props.updateParentState({ proj: element.target.value });
	},

	onBillChange: function() {
		this.props.updateParentState({ bill: !this.props.bill });
	},

	onFormSubmit: function(event) {
		event.preventDefault();
		this.props.handleFormSubmit(event);
	},

	render: function() {
		var elapsedTime = this.props.elapsedTime.format("mm:ss");

		return (
			<form className="timer" onSubmit={this.onFormSubmit}>
				<input
					type="text"
					placeholder="Description"
					value={this.props.desc}
					onChange={this.onDescChange} />
				<input
					type="text"
					placeholder="Project"
					value={this.props.proj}
					onChange={this.onProjChange} />
				<p className={this.props.bill ? "bill" : "not-bill"} onClick={this.onBillChange}>$</p>
				<p className="elapsed-time">{elapsedTime}</p>
				<input className={this.props.running ? "btn-running" : "btn-not-running"}
					type="submit"
					value={this.props.running ? "Stop" : "Start"}
					/>
			</form>
		);
	}
});

var Toggl = React.createClass({
	getInitialState: function() {
		return { 
			data: [],
			desc: "",
			proj: "",
			bill: false,
			startTime: moment(0),
			elapsedTime: moment(0),
			running: false
		};
	},

	updateState: function(newState) {
		this.setState(newState);
	},

	componentDidMount: function() {
		this.fetchTimeList();
	},

	orderByDate: function(a, b) {
		var dateA = moment(a.from_date);
		var dateB = moment(b.from_date);

		if (dateA.isBefore(dateB)) {
			return 1;
		}
		if (dateA.isAfter(dateB)) {
			return -1;
		}
		return 0;
	},

	fetchTimeList: function() {
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
	},

	sendTime: function(time) {
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
			error: function(xhr, status, err) {
				console.log(err);
				this.setState({ data: oldState });
			}
		});
	},

	deleteEntry: function(entryId) {
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
	},

	onContinue: function(entry) {
		this.setState(entry);
		this.startTimer();
	},

	updateElapsedTime: function() {
		this.setState({ elapsedTime: this.state.elapsedTime.add(1, 'second') });
	},

	startTimer: function() {
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
	},

	render: function() {
		return (
			<div className="toggl">
				<h1>Reaggl</h1>
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
});

var url = "https://reaggle.herokuapp.com/api/entries/";

ReactDOM.render(
	<Toggl url={url}/>,
	document.getElementById('content')
);