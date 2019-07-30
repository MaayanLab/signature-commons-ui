import React from 'react'
import ChipInput from 'material-ui-chip-input'
import { withStyles } from '@material-ui/core/styles'
import Chip from '@material-ui/core/Chip'

const styles = (theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  chip: {
    margin: theme.spacing.unit,
  },
})

class MetadataSearchBox extends React.Component {
  constructor(props) {
    super(props)
    this.renderChips = this.renderChips.bind(this)
  }

  renderChips(
      {
        value,
        isFocused,
        isDisabled,
        handleClick,
        handleDelete,
        className,
      },
      key
  ) {
    let backgroundColor = '#e0e0e0'
    const fontColor = '#000'
    let icon = 'mdi-code-equal' // mdi-code-not-equal
    let chip_value = value
    // if (value.startsWith("|!") || value.startsWith("!|")){
    //   // or not
    //   icon = "mdi-code-not-equal"
    //   chip_value = value.substring(2)
    //   backgroundColor = "#9e9e9e"
    //   fontColor = "#FFF"
    // } else if (value.startsWith("|")){
    //   // or
    //   chip_value = value.substring(1)
    //   backgroundColor = "#9e9e9e"
    //   fontColor = "#FFF"
    // } else
    if (value.startsWith('!') || value.startsWith('-')) {
      // not
      icon = 'mdi-code-not-equal'
      backgroundColor = '#FFBABA'
      chip_value = value.substring(1)
    } else if (value.toLowerCase().startsWith('or ')) {
      // or
      icon = 'mdi-equal-box mdi-rotate-90'
      backgroundColor = '#FFEAD9'
      chip_value = value.substring(3)
    } else if (value.startsWith('|')) {
      // not
      backgroundColor = '#FFEAD9'
      chip_value = value.substring(1)
    }
    return (
      <Chip
        key={key}
        avatar={<span className={`mdi ${icon} mdi-24px`}/>}
        label={chip_value}
        onDelete={() => {
          const chips = this.props.currentSearchArray.filter((term) => term != value)
          this.props.currentSearchArrayChange(chips)
        }}
        style={{
          pointerEvents: isDisabled ? 'none' : undefined,
          backgroundColor: backgroundColor,
          color: fontColor,
        }}
        className={className}
      />
    )
  }
  render() {
    const examples = this.props.ui_values.LandingText.search_terms
    return (
      <form action="javascript:void(0);">
        <div className="input-field">
          <span className="mdi mdi-magnify mdi-36px"></span>
          <ChipInput
            placeholder={this.props.currentSearchArray.length > 0 ? 'Add filter' :
                this.props.ui_values.LandingText.metadata_placeholder}
            value={this.props.currentSearchArray}
            chipRenderer={this.renderChips}
            disableUnderline
            alwaysShowPlaceholder
            InputProps={{
              inputProps: {
                style: {
                  border: 'none',
                },
              },
            }}
            style={{
              fontWeight: 500,
              color: 'rgba(0, 0, 0, 0.54)',
              borderRadius: '2px',
              border: 0,
              minheight: '35px',
              marginBottom: 0,
              width: '430px',
              padding: this.props.currentSearchArray.length === 0 ? '8px 8px 0 60px' : '8px 8px 0 8px',
              background: '#f7f7f7',
            }}
            onAdd={(chip) => {
              const chips = [...this.props.currentSearchArray, chip]
              this.props.currentSearchArrayChange(chips)
            }}
            onDelete={(chip, index) => {
              const chips = this.props.currentSearchArray.filter((term) => term != chip)
              this.props.currentSearchArrayChange(chips)
            }}
          />
          <span>&nbsp;&nbsp;</span>
          <button className="btn waves-effect waves-light" type="submit" name="action"
            style={{ marginBottom: 20 }}
            onClick={() =>
              this.props.currentSearchArrayChange(this.props.currentSearchArray)}
          >Search
            <i className="material-icons right">send</i>
          </button>
        </div>
        {examples.map((example) => (
          <a
            key={example}
            className="chip grey white-text waves-effect waves-light"

            onClick={() => this.props.currentSearchArrayChange([example])}
          >
            {example}
          </a>
        ))}
      </form>
    )
  }
}

export default withStyles(styles)(MetadataSearchBox)
