import React from 'react'
import dynamic from 'next/dynamic'
import SwipeableViews from 'react-swipeable-views'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import TablePagination from '@material-ui/core/TablePagination'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Grid from '@material-ui/core/Grid'
import { similar_search_terms } from '../Home'

const MetaItem = dynamic(() => import('../../components/MetadataSearch/MetaItem'))

const default_singular_names = {
  libraries: 'Dataset',
  signatures: 'Signature',
  entities: 'Entities',
}

export default class SearchResults extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      librariescontroller: undefined,
      signaturescontroller: undefined,
      entitiescontroller: undefined,
      library_name: this.props.ui_values.library_name,
      index_value: 0,
      signaturesRowsPerPage: 10,
      signaturesPage: 0,
      librariesRowsPerPage: 10,
      librariesPage: 0,
      entitiesPage: 0,
      entitiesRowsPerPage: 10,
      pagination: false,
      tabs: ['signatures', 'libraries', 'entities'],
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleChangeIndex = this.handleChangeIndex.bind(this)
    this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this)
    this.handleChangePage = this.handleChangePage.bind(this)
  }

  componentDidMount() {
    this.setState({
      tabs: this.props.withMatches,
    })
  }

  componentDidUpdate(prevProps, prevState) {
    const unchanged = similar_search_terms(prevProps.currentSearchArray, this.props.currentSearchArray)
    if (!this.state.pagination){
      if ((this.props.withMatches.length > 0 && prevProps.withMatches.length !== this.props.withMatches.length) ||
        (prevProps.search_status !== '' && this.props.search_status === '')) {
        this.setState({
          tabs: this.props.withMatches,
          index_value: 0,
        })
      }
    }
    if (!unchanged) {
      this.setState({
        signaturesRowsPerPage: 10,
        signaturesPage: 0,
        librariesRowsPerPage: 10,
        librariesPage: 0,
        entitiesRowsPerPage: 10,
        entitiesPage: 0,
        pagination: false
      })
    }
  }

  handleChange(event, newValue) {
    this.setState({
      index_value: newValue,
    })
  }

  handleChangeIndex(index) {
    this.setState({
      index_value: index,
    })
  }

  handleChangeRowsPerPage(e, name) {
    this.setState({
      [`${name}RowsPerPage`]: e.target.value,
      pagination: true
    }, () => {
      this.props.performSearch(this.props.currentSearchArray, name, this.state[`${name}Page`], this.state[`${name}RowsPerPage`], true)
    })
  }

  handleChangePage(event, page, name) {
    this.setState({
      [`${name}Page`]: page,
      pagination: true
    }, () => {
      this.props.performSearch(this.props.currentSearchArray, name, this.state[`${name}Page`], this.state[`${name}RowsPerPage`], true)
    })
  }

  search_div(name) {
    const default_name_singular = default_singular_names[name]
    if (this.props[name] === undefined || this.props[name].length === 0) {
      return <div key={name} />
    }
    return (
      <div key={name}>
        <div className="col s12 center">
          {this.props[`${name}_count`] !== undefined ? (
            <div>
              <span className="grey-text">
                Found {this.props[`${name}_count`]}
                {this.props[`${name}_total_count`] !== undefined ? ` matches out of ${this.props[`${name}_total_count`]} ` : null}
                { this.props.ui_values.preferred_name[name].toLowerCase() || name }
                {this.props[`${name}_duration_meta`] !== undefined ? ` in ${this.props[`${name}_duration_meta`].toPrecision(3)} seconds` : null}
              </span>
            </div>
          ) : null}
        </div>
        <div className="col s12">
          <MetaItem
            search={this.props.currentSearchArray}
            items={this.props[name]}
            type={this.props.ui_values.preferred_name_singular[name] || default_name_singular}
            table_name={name}
            preferred_name={this.props.ui_values.preferred_name_singular}
            deactivate_download={this.props.ui_values.deactivate_download}
            schemas={this.props.schemas}
            submit={this.props.submit}
            ui_values={this.props.ui_values}
          />
          <div align="right">
            <TablePagination
              page={this.state[`${name}Page`]}
              rowsPerPage={this.state[`${name}RowsPerPage`]}
              count={this.props[`${name}_count`]}
              onChangePage={(event, page) => this.handleChangePage(event, page, name)}
              onChangeRowsPerPage={(event) => this.handleChangeRowsPerPage(event, name)}
              component="div"
            />
          </div>
        </div>
      </div>
    )
  }

  render() {
    if (this.props.search_status === '' && this.state.tabs.length === 0) { // zero results
      return (
        <Grid container
          spacing={24}
          alignItems={'center'}
          direction={'column'}>
          <Grid item>
            <Card style={{ 'width': 500, 'height': 100, 'margin': '50px 0', 'textAlign': 'center', 'verticalAlign': 'middle' }}>
              <CardContent>
                <Typography variant="title" style={{ padding: '20px 0' }}>
                  No matches found
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )
    }
    return (
      <div className="col s12">
        <Tabs
          value={this.state.index_value}
          onChange={this.handleChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          { this.state.tabs.map((key) => <Tab key={key} label={ this.props.ui_values.preferred_name[key] || key } />) }
        </Tabs>
        <SwipeableViews
          index={this.state.index_value}
          onChangeIndex={this.handleChangeIndex}
        >
          {
            this.state.tabs.map((key) => (this.search_div(key)))
          }
        </SwipeableViews>
      </div>
    )
  }
}
