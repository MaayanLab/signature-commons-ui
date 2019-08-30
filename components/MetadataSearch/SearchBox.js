import React from 'react'
import PropTypes from 'prop-types';
import ChipInput from 'material-ui-chip-input'
import { withStyles } from '@material-ui/core/styles'
import Chip from '@material-ui/core/Chip'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip'
import Icon from '@material-ui/core/Icon';

  const Info = (props) => {
    const { classes } = props
    return (
      <div>
        <Typography variant="h5">
            Search operators
        </Typography>
        <ul>
          <li>
            <div>
              <Typography variant="h6">
                  Exclude word from search
              </Typography>
              <Typography variant="body2">
                {'Prefix query with "-" or "!", e.g.'} &nbsp;
              </Typography>
              <Typography variant="overline" gutterBottom>
                <Chip
                  label={'Imatinib'}
                  onDelete={() => {}}
                /> -Stat3
              </Typography>
            </div>
          </li>
          <li>
            <div>
              <Typography variant="h6">
                  Combine searches
              </Typography>
              <Typography variant="body2">
                {'Prefix query "or " or "|", e.g.'} &nbsp;
              </Typography>
              <Typography variant="overline" gutterBottom>
                <Chip
                  label={'Imatinib'}
                  onDelete={() => {}}
                /> or Stat3
              </Typography>
            </div>
          </li>
          <li>
            <div>
              <Typography variant="h6">
                  Search for specific field
              </Typography>
              <Typography variant="body2">
                {'Prefix query with "[desired_field]:", e.g.'}
              </Typography>
              <Typography variant="overline" gutterBottom>
                <Chip
                  label={'Disease: neuropathy'}
                  onDelete={() => {}}
                /> {'PMID: 12345'}
              </Typography>
            </div>
          </li>
        </ul>
      </div>
    )
  }


export class SearchBox extends React.Component {

  renderChips = (
      {
        value,
        isDisabled,
        className,
        handleDelete,
      },
      key
  ) => {
    let chip_value = value
    let chip_class = this.props.classes.defaultLightChip
    let chip_icon = this.props.andIcon
    if (value.startsWith('!') || value.startsWith('-')) {
      // not
      chip_icon = this.props.notIcon
      chip_value = value.substring(1)
      chip_class = this.props.classes.notChip
    } else if (value.toLowerCase().startsWith('or ')) {
      // or
      chip_icon = this.props.orIcon
      chip_value = value.substring(3)
      chip_class = this.props.classes.orChip
    } else if (value.startsWith('|')) {
      // or
      chip_icon = this.props.orIcon
      chip_value = value.substring(1)
      chip_class = this.props.classes.orChip
    }
    return (
      <Chip
        key={key}
        avatar={<Icon className={`${this.props.classes.icon} mdi ${chip_icon} mdi-18px`} />}
        label={chip_value}
        onDelete={handleDelete}
        className={`${className} ${chip_class}`}
      />
    )
  }

  render = () => (
    <Grid container
      spacing={24}
      alignItems={'center'}>
      <Grid item xs={12}>
        <Grid container
          spacing={24}
          alignItems={'center'}>
          <Grid item xs={12}>
            <Tooltip title={this.props.Info || <Info {...this.props}/>}
              interactive placement="left-start" 
              classes={{ tooltip: this.props.classes.tooltip }}>
              <Button className={this.props.classes.tooltipButton} >
                <span className="mdi mdi-information mdi-24px" />
              </Button>
            </Tooltip>
            <ChipInput
              className={this.props.classes.ChipInput}
              placeholder={this.props.search.length > 0 ? 'Add filter' :
                  this.props.placeholder}
              value={this.props.search}
              chipRenderer={this.props.renderChips || this.renderChips}
              disableUnderline
              alwaysShowPlaceholder
              InputProps={{
                inputProps: {
                  style: {
                    border: 'none',
                  },
                },
                ...this.props.InputProps
              }}
              style={{
                fontWeight: 500,
                color: 'rgba(0, 0, 0, 0.54)',
                borderRadius: '2px',
                border: 0,
                minheight: '35px',
                marginBottom: 0,
                width: '430px',
                padding: this.props.search.length === 0 ? '8px 8px 0 60px' : '8px 8px 0 8px',
                background: '#f7f7f7',
                ...this.props.ChipInputStyle
              }}
              onAdd={(chip) => {
                const search = [...this.props.search, chip]
                this.props.searchFunction(search)
              }}
              onDelete={(chip, index) => {
                const search = this.props.search.filter((term) => term != chip)
                this.props.searchFunction(search)
              }}
              blurBehavior="add"
            />
            <span>&nbsp;&nbsp;</span>
            <Button variant="contained"
              color="primary"
              style={{ marginTop: 10 }}
              onClick={() =>
                this.props.searchFunction(this.props.search)
              }>
              { this.props.loading ? 
                <React.Fragment>
                  Searching &nbsp;
                  <span className="mdi mdi-spin mdi-loading right" />
                </React.Fragment>: 
                <React.Fragment>
                  Search &nbsp;
                  <span className="mdi mdi-send right" />
                </React.Fragment>
              }
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        {this.props.examples.map((example) => (
          <Chip label={example} className={this.props.classes.defaultChip}
            onClick={() => this.props.searchFunction([example])}/>
        ))}
      </Grid>
    </Grid>
  )
}

SearchBox.propTypes = {
  search: PropTypes.array.isRequired,
  searchFunction: PropTypes.func.isRequired,
  renderChips: PropTypes.func,
  loading: PropTypes.bool,
  placeholder: PropTypes.string,
  andIcon: PropTypes.string,
  orIcon: PropTypes.string,
  notIcon: PropTypes.string,
  ChipStyle: PropTypes.object,
  ChipInputStyle: PropTypes.object,
  InputProps: PropTypes.object,
  classes: PropTypes.object,
  examples: PropTypes.array,
  Info: PropTypes.elementType
};

SearchBox.defaultProps = {
  andIcon: 'mdi-code-equal',
  orIcon: 'mdi-equal-box mdi-rotate-90',
  notIcon: 'mdi-code-not-equal',
  placeholder: 'Search',
}