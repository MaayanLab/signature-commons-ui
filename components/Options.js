import React from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import PropTypes from 'prop-types'

export default function Options(props) {
	const [anchorEl, setAnchorEl] = React.useState(null);
  
	const handleClick = (event) => {
	  setAnchorEl(event.currentTarget);
	};
  
	const handleClose = () => {
	  setAnchorEl(null);
	};
  
	return (
	  <div>
		<Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
			<span className="mdi mdi-24px mdi-dots-vertical"></span>
		</Button>
		<Menu
		  id="simple-menu"
		  anchorEl={anchorEl}
		  keepMounted
		  open={Boolean(anchorEl)}
		  onClose={handleClose}
		>
		  {props.options.map(option=>{
			  if (option.href!==undefined) {
				return (
					<MenuItem key={option.label} component="a" href={option.href}>
						<span className={`mdi mdi-24px ${option.icon || 'mdi-apps-box'}`}></span>
							&nbsp;
						<Typography style={{ fontSize: 15, textTransform: "capitalize" }} variant="caption" display="block">
							{option.label}
						</Typography>
					</MenuItem>
				) 
			  } else {
				  return (
					<MenuItem key={option.label} onClick={()=>{
						option.onClick()
						handleClose()
					}}>
						<span className={`mdi mdi-24px ${option.icon || 'mdi-apps-box'}`}></span>
							&nbsp;
						<Typography style={{ fontSize: 15, textTransform: "capitalize" }} variant="caption" display="block">
							{option.label}
						</Typography>
					</MenuItem>
					)
			  }
		  })}
		</Menu>
	  </div>
	);
  }

Options.propTypes = {
	options: PropTypes.arrayOf(
		PropTypes.oneOf([
			PropTypes.shape({
				label: PropTypes.string.isRequired,
				onClick: PropTypes.func.isRequired,
			}),
			PropTypes.shape({
				href: PropTypes.string.isRequired,
				label: PropTypes.string.isRequired
			})
		])
	)
}