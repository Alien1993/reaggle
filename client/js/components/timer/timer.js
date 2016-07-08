import React from 'react';

import style from './timer.scss'

class Timer extends React.Component {
	constructor(props) {
		super(props);

		this.onDescChange = this.onDescChange.bind(this);
		this.onProjChange = this.onProjChange.bind(this);
		this.onBillChange = this.onBillChange.bind(this);
		this.onFormSubmit = this.onFormSubmit.bind(this);
	}

	onDescChange(element) {
		this.props.updateParentState({ desc: element.target.value });
	}

	onProjChange(element) {
		this.props.updateParentState({ proj: element.target.value });
	}

	onBillChange() {
		this.props.updateParentState({ bill: !this.props.bill });
	}

	onFormSubmit(event) {
		event.preventDefault();
		this.props.handleFormSubmit();
	}

	render() {
		var elapsedTime = this.props.elapsedTime.format("mm:ss");

		return (
			<form className={style.timer} onSubmit={this.onFormSubmit}>
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
				<p className={this.props.bill ? style.bill : style.not_bill} onClick={this.onBillChange}>$</p>
				<p className="elapsed-time">{elapsedTime}</p>
				<input className={this.props.running ? style.btn_running : style.btn_not_running}
					type="submit"
					value={this.props.running ? "Stop" : "Start"}
					/>
			</form>
		);
	}
}

export default Timer;