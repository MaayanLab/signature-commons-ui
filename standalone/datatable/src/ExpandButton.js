import React from 'react'
import PropTypes from 'prop-types'
import Tooltip from '@material-ui/core/Tooltip'
import Button from '@material-ui/core/Button'

export const ExpandButton = (props) => {
    const {expanded, ButtonProps, IconProps} = props
    return(
    <Tooltip title={'See more'}
      placement="bottom">
      <Button aria-label="Expand"
        {...ButtonProps}
      >
        <span className={`mdi mdi-chevron-${expanded ? 'up': 'down'} mdi-24px`} {...IconProps}/>
      </Button>
    </Tooltip>
  )}
ExpandButton.propTypes = {
    expanded: PropTypes.bool,
    ButtonProps: PropTypes.object,
    IconProps: PropTypes.object,
}