import React from 'react'
import PropTypes from 'prop-types';
import ChipInput from 'material-ui-chip-input'
import { withStyles } from '@material-ui/core/styles'
import Chip from '@material-ui/core/Chip'
import Typography from '@material-ui/core/Typography'

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
    let chip_prop = this.props.andProps
    if (value.startsWith('!') || value.startsWith('-')) {
      // not
      chip_prop = this.props.notProps
      chip_value = value.substring(1)
    } else if (value.toLowerCase().startsWith('or ')) {
      // or
      chip_prop = this.props.orProps
      chip_value = value.substring(3)
    } else if (value.startsWith('|')) {
      // or
      chip_prop = this.props.orProps
      chip_value = value.substring(1)
    }
    return (
      <Chip
        key={key}
        avatar={<span className={`mdi ${chip_prop.icon} mdi-24px`}/>}
        label={chip_value}
        onDelete={handleDelete}
        style={{
          pointerEvents: isDisabled ? 'none' : undefined,
          color: '#000',
          ...this.props.ChipStyle,
          backgroundColor: chip_prop.backgroundColor,
        }}
        className={className}
      />
    )
  }

  render = () => {
    return (
      <form action="javascript:void(0);">
        <div className="input-field">
          <span className="mdi mdi-magnify mdi-36px"></span>
          <ChipInput
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
          <button className="btn waves-effect waves-light" type="submit" name="action"
            style={{ marginBottom: 20 }}
            onClick={() =>
              this.props.searchFunction(this.props.search)
            }
          >
          { this.props.loading ? 
            <React.Fragment>
              Searching
              <i className="mdi mdi-spin mdi-loading right" />
            </React.Fragment>: 
            <React.Fragment>
              Search
              <i className="material-icons right">send</i>
            </React.Fragment>
          }
          </button>
        </div>
      </form>
    )
  }
}

SearchBox.propTypes = {
  search: PropTypes.array.isRequired,
  searchFunction: PropTypes.func.isRequired,
  renderChips: PropTypes.func,
  loading: PropTypes.bool,
  placeholder: PropTypes.string,
  andProps: PropTypes.shape({
    icon: PropTypes.string,
    backgroundColor: PropTypes.string
  }),
  orProps: PropTypes.shape({
    icon: PropTypes.string,
    backgroundColor: PropTypes.string
  }),
  orProps: PropTypes.shape({
    icon: PropTypes.string,
    backgroundColor: PropTypes.string
  }),
  ChipStyle: PropTypes.object,
  ChipInputStyle: PropTypes.object,
  InputProps: PropTypes.object,
};

SearchBox.defaultProps = {
  andProps: {
    icon: 'mdi-code-equal',
    backgroundColor: '#e0e0e0',
  },
  notProps: {
    icon: 'mdi-code-not-equal',
    backgroundColor: '#FFBABA',
  },
  orProps: {
    icon: 'mdi-equal-box mdi-rotate-90',
    backgroundColor: '#FFEAD9',
  },
  placeholder: 'Search',
}