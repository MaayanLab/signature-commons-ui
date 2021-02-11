import React from 'react'
import PropTypes from 'prop-types'
import Tooltip from '@material-ui/core/Tooltip'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'

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
    <Tooltip title={tooltip_title}
        placement="bottom"
        {...TooltipProps}
    >
        <Grid container style={{height: 50}}>
            <Grid item xs={12} style={{margin:"auto"}}>
                { icon === undefined ? 
                    <img style={{
                            maxHeight: 50,
                            maxWidth: 100,
                            }}
                            alt={alt}
                            src={src}
                            {...IconProps}
                    />:
                    <span className={`mdi mdi-36px ${icon}`}
                            {...IconProps}
                    />
                }
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
    </Tooltip>
    )
}

export const IconComponentButton = ({
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
    <Tooltip title={tooltip_title}
        placement="bottom"
        {...TooltipProps}
    >
        <Button href={href}>
            <Grid container>
                <Grid item xs={12} style={{margin:"auto"}}>
                    { icon === undefined ? 
                        <img style={{
                                maxHeight: 50,
                                maxWidth: 100,
                                }}
                                alt={alt}
                                src={src}
                                {...IconProps}
                        />:
                        <span className={`mdi mdi-36px ${icon}`}
                                {...IconProps}
                        />
                    }
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
        </Button>
    </Tooltip>
    )
}


IconComponent.propTypes = {
    title: PropTypes.string,
    alt: PropTypes.string,
    src: PropTypes.string,
    icon: PropTypes.string,
    description: PropTypes.string,
    TooltipTypProps: PropTypes.object,
    TooltipProps: PropTypes.object,
    IconProps: PropTypes.object,
IconTypProps: PropTypes.object,
}
