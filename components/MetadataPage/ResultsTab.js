import React from 'react'
import PropTypes from 'prop-types'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Link from '@material-ui/core/Link';

export const ResultsTab = (props) => {
	const { tabs, value, handleChange, tabsProps, tabProps, onClick } = props
	const allTabs = []
	for (const t of tabs){
		if (t.count > 0 || t.count === undefined){
			const label = t.count ? `${t.label} (${t.count})`: `${t.label}`
			allTabs.push(
				<Tab 
					key={label}
					label={label.replace(/_/g, " ")} 
					value={t.value||t.label}
					onClick={(event) => {
						event.preventDefault();
					}}
					{...tabProps}
				/>
			)
		} 
	}
	return(
		<Tabs
          value={value}
		  onChange={handleChange}
		  textColor="primary"
          indicatorColor="primary"
          {...tabsProps}
        >
			{allTabs}
		</Tabs>
	)
}

ResultsTab.propTypes = {
	tabs: PropTypes.arrayOf(PropTypes.shape({
		label: PropTypes.string.isRequired,
		href: PropTypes.string,
		count: PropTypes.number,
		value: PropTypes.string,
	})),
	value: PropTypes.string.isRequired,
	handleChange: PropTypes.func,
}