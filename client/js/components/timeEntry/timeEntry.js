import React from 'react';
import moment from 'moment';

import style from './timeEntry.scss';

class TimeEntry extends React.Component {
	constructor() {
		super();
		this.handleDelete = this.handleDelete.bind(this);
		this.handleContinue = this.handleContinue.bind(this);
	}

	handleDelete() {
		this.props.handleDelete(this.props.id);
	}

	handleContinue() {
		this.props.onContinue({
			desc: this.props.desc,
			proj: this.props.proj,
			bill: this.props.bill,
			startTime: moment(),
			elapsedTime: moment(0),
			running: true
		});
	}

	render() {
		var start = moment(this.props.startTime);
		var end = moment(this.props.endTime);
		var duration = moment.duration(end.diff(start));
		var elapsedTime = moment.utc(end.diff(start)).format('HH:mm:ss');

		return (
			<tr className={style.time_entry}>
				<td className={style.entry_desc}>{this.props.desc}</td>
				<td className={style.entry_proj}>{this.props.proj}</td>
				<td className={style.entry_billable}>{this.props.bill ? "$" : ""}</td>
				<td className={style.entry_continue} onClick={this.handleContinue}>▶</td>
				<td className={style.elapsed_time}>{elapsedTime}</td>
				<td className={style.entry_start}>{start.format("MMM DD, hh:mm:ss")}</td>
				<td className={style.entry_end}>{end.format("MMM DD, hh:mm:ss")}</td>
				<td className={style.entry_delete} onClick={this.handleDelete}>Delete</td>
			</tr>
		);
	}
}

export default TimeEntry;