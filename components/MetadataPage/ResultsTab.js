import React from 'react'
import PropTypes from 'prop-types'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Link from '@material-ui/core/Link';
import { Divider } from '@material-ui/core';

export const ResultsTab = ({
	tabs,
	value,
	handleChange,
	tabsProps,
	tabProps,
	onClick,
	divider,
	TabsComponent=Tabs,
	TabComponent=Tab,
}) => {
	const allTabs = []
	for (const i in tabs){
		const t = tabs[i]
		if (t.count > 0 || t.count === undefined){
			const label = t.count ? `${t.label} (${t.count})`: `${t.label}`
			allTabs.push(
				<TabComponent 
					key={label}
					label={label.replace(/_/g, " ")} 
					value={t.value||t.label}
					onClick={() => {
						if (handleChange) handleChange(t)
					}}
					{...tabProps}
				/>
			)
			if (divider && i < tabs.length-1) {
				allTabs.push(
					<Divider orientation="vertical" flexItem />
				)
			}
		} 
	}
	return(
		<TabsComponent
          value={value}
		  onChange={handleChange}
		  textColor="primary"
          indicatorColor="primary"
		  {...tabsProps}
        >
			{allTabs}
		</TabsComponent>
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
	TabsComponent: PropTypes.node,
	TabComponent: PropTypes.node,
	divider: PropTypes.boolean,
}