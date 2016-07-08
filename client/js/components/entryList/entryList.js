import React from 'react';

import TimeEntry from '../timeEntry/timeEntry.js';
import style from './entryList.scss';

class EntryList extends React.Component {
	render() {
		var entries = this.props.entries.map(function(element, index) {
			return <TimeEntry key={index} 
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
			<table className={style.time_list}>
				<tbody>
					{entries}
				</tbody>
			</table>
		);
	}

	shouldComponentUpdate(nextProps, nextState) {
		return this.props.entries !== nextProps.entries;
	}
}

export default EntryList;