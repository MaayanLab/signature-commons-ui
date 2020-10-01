import React from 'react'
import PropTypes from 'prop-types'
import Tooltip from '@material-ui/core/Tooltip'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

export const IconComponent = ({
    title,
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
        <Grid container>
            <Grid item xs={12}>
                { icon === undefined ? 
                    <img style={{
                            height: 50,
                            maxWidth: 100
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
            <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom {...IconTypProps}>
                    {title}
                </Typography>
            </Grid>
        </Grid>
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
