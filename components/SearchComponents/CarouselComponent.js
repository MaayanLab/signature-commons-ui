import React from 'react'

import dynamic from 'next/dynamic'

const Grid = dynamic(()=>import('@material-ui/core/Grid'));
const Typography = dynamic(()=>import('@material-ui/core/Typography'));
const Paper = dynamic(()=>import('@material-ui/core/Paper'));
const Carousel = dynamic(()=>import('react-material-ui-carousel'));


const CarouselItem = (props) => {
	const {ContainerProps, ItemProps, ImageProps, CaptionProps, src, alt} = props
	return(
		<Grid
			container
			justify="center"
			alignItems="center"
			style={{height: 400}}
			{...ContainerProps}
		>
			<Grid item xs={12} style={{height:350}} align="center" {...ItemProps}>
				<img style={{maxHeight:350, maxWidth: 500}} src={src} alt={alt} {...ImageProps}></img>
			</Grid>
			{props.caption === undefined ? null:
				<Grid item xs={12}>
					<Typography variant="body1" align="center" {...CaptionProps}><b>{props.caption}</b></Typography>
				</Grid>
			}
		</Grid>
	)
}

export const CarouselComponent = (props) => {
	const {header, content, PaperProps} = props
	if (content === undefined || content.length === 0 ) return null
	return(
		<React.Fragment>
			<Typography variant={'h6'} style={{textTransform: "capitalize"}}>{header}</Typography>
			<Paper style={{padding: 20, width: 500}} {...PaperProps}>
				{ content.length === 1 ?
					<CarouselItem key={content[0].alt} {...content[0]} />:
					<Carousel interval={8000}>
						{
							content.map(props => <CarouselItem key={props.alt} {...props} /> )
						}
					</Carousel>
				}
			</Paper>
		</React.Fragment>
	)
}
