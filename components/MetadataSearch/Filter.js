import React from 'react'
import PropTypes from 'prop-types'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import CircularProgress from '@material-ui/core/CircularProgress'


export default class Filter extends React.Component {
  render() {
    if (!this.props.loaded || this.props.data_count === undefined) {
      return (
        <Card style={{
          maxHeight: 300,
          width: '100%',
          overflow: 'auto',
        }}>
          <CardContent style={{ textAlign: 'center' }}>
            <CircularProgress />
          </CardContent>
        </Card>
      )
    }
    if (this.props.data_count.length === 0) {
      return (
        null
      )
    }
    const sorted = this.props.data_count.sort((a, b) => b.count - a.count)
    return (
      <Card style={{
        maxHeight: 300,
        width: '100%',
        overflow: 'auto',
      }}>
        <CardContent>
          <FormGroup>
            {sorted.map(({ name, count }) => (
              <FormControlLabel
                key={name}
                control={
                  <Checkbox checked={this.props.selected[name]}
                    onChange={() => this.props.toggleSelect(name)}
                    value={name} />
                }
                label={`${name || id} (${count})`}
              />
            ))}
          </FormGroup>
        </CardContent>
      </Card>
    )
  }
}

Filter.propTypes = {
  data_count: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        count: PropTypes.number.isRequired,
      })
  ).isRequired,
  selected: PropTypes.objectOf(PropTypes.bool).isRequired,
  loaded: PropTypes.bool.isRequired,
  toggleSelect: PropTypes.func,
}


