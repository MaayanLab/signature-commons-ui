import React from 'react'
import PropTypes from 'prop-types'
import Tooltip from '@material-ui/core/Tooltip'
import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles';
import Badge from '@material-ui/core/Badge';

const ImageBox = ({src, alt, icon, IconProps}) => {
    if (icon === undefined) {
        if (src === "undefined") return ( 
            <Avatar
                style={{
                    margin: "auto",
                    height: 50,
                    width: 50
                }}
                {...IconProps}> 
                {alt[0]} 
            </Avatar>
        )
        else return (
            <img style={{
                maxHeight: 50,
                maxWidth: 100,
                }}
                alt={alt}
                src={src}
                {...IconProps}
        />
        )
    } else {
        return(
            <span className={`mdi mdi-36px ${icon}`}
                {...IconProps}
            />
        )
    }
}

const CapTooltip = withStyles((theme) => ({
    tooltip: {
      textTransform: "capitalize"
    },
  }))(Tooltip);
export const IconComponent = ({
    title,
    subtitle,
    alt,
    src,
    icon,
    description,
    TooltipTypProps,
    TooltipProps,
    IconProps,
    IconTypProps,
    ...props    
}) => {
    let tooltip_title = ''
    if (description !== undefined || description === '') {
    tooltip_title = <Typography
                        variant="subtitle2"
                        style={{ color: '#FFF' }}
                        gutterBottom
                        {...TooltipTypProps}
                    >
                        {description}
                    </Typography>
    }
    return (
    <CapTooltip title={tooltip_title}
        placement="bottom"
        {...TooltipProps}
    >
        <Grid container style={{height: 50}}>
            <Grid item xs={12} style={{margin:"auto"}}>
                <ImageBox alt={alt} icon={icon} src={src} IconProps={IconProps}/>
            </Grid>
            { title===undefined ? null:
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom {...IconTypProps}>
                        {title}
                    </Typography>
                </Grid>
            }
            { subtitle===undefined ? null:
                <Grid item xs={12}>
                    <Typography variant="p" gutterBottom {...IconTypProps}>
                        {subtitle}
                    </Typography>
                </Grid>
            }
        </Grid>
    </CapTooltip>
    )
}

export const IconComponentButton = ({
    title,
    subtitle,
    alt,
    src,
    icon,
    count,
    description,
    TooltipTypProps,
    TooltipProps,
    IconProps,
    IconTypProps,
    href,
    ...props    
}) => {
    let tooltip_title = ''
    if (description !== undefined || description === '') {
    tooltip_title = <Typography
                        variant="subtitle2"
                        style={{ color: '#FFF' }}
                        gutterBottom
                        {...TooltipTypProps}
                    >
                        {description}
                    </Typography>
    }
    return (
    <CapTooltip title={tooltip_title}
        placement="bottom"
        {...TooltipProps}
    >
        <Button href={href}>
            <Grid container>
                <Grid item xs={12} style={{margin:"auto"}}>
                    <Badge badgeContent={count} color="error" max={999}>
                        <ImageBox alt={alt} icon={icon} src={src} IconProps={IconProps}/>
                    </Badge>
                </Grid>
                { title===undefined ? null:
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom style={{textTransform: "none"}} {...IconTypProps}>
                            {title}
                        </Typography>
                    </Grid>
                }
                { subtitle===undefined ? null:
                    <Grid item xs={12}>
                        <Typography variant="body1" gutterBottom style={{textTransform: "none"}} {...IconTypProps}>
                            {subtitle}
                        </Typography>
                    </Grid>
                }
            </Grid>
        </Button>
    </CapTooltip>
    )
}


IconComponent.propTypes = {
    title: PropTypes.string,
    alt: PropTypes.string,
    src: PropTypes.string,
    icon: PropTypes.string,
    count: PropTypes.number,
    description: PropTypes.string,
    TooltipTypProps: PropTypes.object,
    TooltipProps: PropTypes.object,
    IconProps: PropTypes.object,
IconTypProps: PropTypes.object,
}
