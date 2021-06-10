import React from 'react'
import dynamic from 'next/dynamic'
import { makeStyles } from '@material-ui/core/styles';

const Grid = dynamic(()=>import('@material-ui/core/Grid'));
const Typography = dynamic(()=>import('@material-ui/core/Typography'));
const Paper = dynamic(()=>import('@material-ui/core/Paper'));
const Carousel = dynamic(()=>import('react-material-ui-carousel'));

const useStyles = makeStyles((theme) => ({
    paper: {
		padding: 20,
		width: "80%",
    },
	item: {
		height: 300,
        [theme.breakpoints.only('xl')]: {
            height: 350,
        }
	},
	image: {
        height: "100%",
	}
}));


const CarouselItem = (props) => {
	const {ContainerProps, ItemProps, ImageProps, CaptionProps, src, alt} = props
	const classes = useStyles()
	return(
		<Grid
			container
			justify="center"
			alignItems="center"
			className={classes.item}
			{...ContainerProps}
		>
			<Grid item xs={12} style={{height:"80%"}} align="center" {...ItemProps}>
				<img className={classes.image} src={src} alt={alt} {...ImageProps}></img>
			</Grid>
			{props.caption === undefined ? null:
				<Grid item xs={12}>
					<Typography variant="body2" align="center" {...CaptionProps}><b>{props.caption}</b></Typography>
				</Grid>
			}
		</Grid>
	)
}

export const CarouselComponent = (props) => {
	const {header, content, PaperProps, ContainerProps} = props
	const classes = useStyles()
	if (content === undefined || content.length === 0 ) return null
	return(
		<React.Fragment>
			<Typography variant={'h6'} style={{textTransform: "capitalize"}}>{header}</Typography>
			<Paper className={classes.paper} {...PaperProps}>
				{ content.length === 1 ?
					<CarouselItem key={content[0].alt} {...content[0]} />:
					<Carousel interval={5000}>
						{
							content.map(props => <CarouselItem key={props.alt} ContainerProps={ContainerProps} {...props} /> )
						}
					</Carousel>
				}
			</Paper>
		</React.Fragment>
	)
}
