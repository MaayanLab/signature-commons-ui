import React, {useState} from 'react';
import dynamic from 'next/dynamic'
import PropTypes from 'prop-types'

import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from '@material-ui/core/styles';

const Box = dynamic(()=>import('@material-ui/core/Box'));
const Button = dynamic(()=>import('@material-ui/core/Button'));
const Typography = dynamic(()=>import('@material-ui/core/Typography'));
const Menu = dynamic(()=>import('@material-ui/core/Menu'));
const CircularProgress = dynamic(()=>import('@material-ui/core/CircularProgress'));

const useStyles = makeStyles((theme) => ({
	root: {
	  display: 'flex',
	  alignItems: 'center',
	},
	wrapper: {
	  margin: theme.spacing(1),
	  position: 'relative',
	},
	button: {
		'&:hover': {
			backgroundColor: '#fff',
			boxShadow: 'none',
		  },
		  '&:active': {
			backgroundColor: '#fff',
			boxShadow: 'none',
		  },
	  },
	buttonProgress: {
	  position: 'absolute',
	  top: '50%',
	  left: '50%',
	  marginTop: -12,
	  marginLeft: -12,
	},
  }));
export default function Options(props) {
	const [anchorEl, setAnchorEl] = useState(null);

	const [loading, setLoading] = useState(false);

	const {options} = props
  
	const handleClick = (event) => {
	  setAnchorEl(event.currentTarget);
	};
  
	const handleClose = () => {
	  setAnchorEl(null);
	};

	const classes = useStyles()
  
	return (
	  <Box className={classes.wrapper}>
		<Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick} className={classes.button}>
			<span className="mdi mdi-24px mdi-dots-vertical"></span>
		</Button>
		{loading && <CircularProgress size={24} className={classes.buttonProgress} />}
		<Menu
		  id="simple-menu"
		  anchorEl={anchorEl}
		  keepMounted
		  open={Boolean(anchorEl)}
		  onClose={handleClose}
		>
		  {options.map(option=>{
			  const { icon, href, src, alt, label, onClick } = option
			  if (href!==undefined) {
				return (
					<MenuItem key={label} component="a" href={href}>
						{icon===undefined ? 
							<img style={{width: 25, height: "auto"}} src={src} alt={alt}/>:
							<span className={`mdi mdi-24px ${icon || 'mdi-apps-box'}`}/>
						}
							&nbsp;
						<Typography style={{ fontSize: 15, textTransform: "capitalize" }} variant="caption" display="block">
							{label}
						</Typography>
					</MenuItem>
				) 
			  } else {
				  return (
					<MenuItem key={label} onClick={async ()=>{
						handleClose()
						setLoading(true)
						if (onClick !== undefined) await onClick()
						setLoading(false)
					}}>
						{icon===undefined ? 
							<img style={{width: 25, height: "auto"}} src={src} alt={alt}/>:
							<span className={`mdi mdi-24px ${icon || 'mdi-apps-box'}`}/>
						}
							&nbsp;
						<Typography style={{ fontSize: 15, textTransform: "capitalize" }} variant="caption" display="block">
							{label}
						</Typography>
					</MenuItem>
					)
			  }
		  })}
		</Menu>
	  </Box>
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