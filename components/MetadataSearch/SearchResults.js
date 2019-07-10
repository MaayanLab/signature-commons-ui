import React from 'react'
import NProgress from 'nprogress'
import { fetch_meta_post } from '../../util/fetch/meta'
import dynamic from 'next/dynamic'
import SwipeableViews from 'react-swipeable-views'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import TablePagination from '@material-ui/core/TablePagination'
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid'

const MetaItem = dynamic(() => import('../../components/MetadataSearch/MetaItem'))

function build_where(q) {
  if (q.indexOf(':') !== -1) {
    const [key, ...value] = q.split(':')
    return {
      ['meta.' + key]: {
        ilike: '%' + value.join(':') + '%',
      },
    }
  } else {
    return {
      meta: {
        fullTextSearch: q,
      },
    }
  }
}

const default_singular_names = {
  libraries: "Library",
  signatures: "Signature",
  entities: "Entities"
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
      entitiesRowsPerPage: 10,
      entitiesPage: 0,
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleChangeIndex = this.handleChangeIndex.bind(this)
    this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this)
    this.handleChangePage = this.handleChangePage.bind(this)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.search !== this.props.search) {
      this.setState({
        signaturesRowsPerPage: 10,
        signaturesPage: 0,
        librariesRowsPerPage: 10,
        librariesPage: 0,
        entitiesRowsPerPage: 10,
        entitiesPage: 0,
        index_value: 0,
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
      index_value: newValue,
    })
  }

  handleChangeRowsPerPage(e, name) {
    this.setState({
      [`${name}RowsPerPage`]: e.target.value,
    }, () => {
      this.props.performSearch(name, this.state[`${name}Page`], this.state[`${name}RowsPerPage`])
    })
  }

  handleChangePage(event, page, name) {
    this.setState({
      [`${name}Page`]: page,
    }, () => {
      this.props.performSearch(name, this.state[`${name}Page`], this.state[`${name}RowsPerPage`])
    })
  }

  search_div(name) {
    const default_name_singular = default_singular_names[name]
    if (this.props[name] === undefined){
      return <div />
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
            search={this.props.search}
            items={this.props[name]}
            type={this.props.ui_values.preferred_name_singular[name] || default_name_singular}
            table_name={name}
            preferred_name={this.props.ui_values.preferred_name_singular}
            deactivate_download={this.props.ui_values.deactivate_download}
            schemas={this.props.schemas}
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
    const defined_results = ["signatures", "libraries", "entities"].filter((name)=>this.props[`${name}_count`]!==undefined)
    const with_results = defined_results.filter((name)=>this.props[`${name}_count`] > 0)
    const total_results = defined_results.reduce((acc, name)=>{
      acc = acc + this.props[`${name}_count`]
      return acc
    }, 0)
    if (defined_results.length===3 && total_results===0){
      return(
        <Grid container
          spacing={24}
          alignItems={'center'}
          direction={'column'}>
          <Grid item>
            <Card style={{width:500, height: 100, margin: "50px 0", textAlign: "center", "verticalAlign": "middle"}}>
              <CardContent>
                <Typography variant="title" style={{padding:"20px 0"}}>
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
          variant="fullWidth"
          centered
        >
          {this.props.signatures !== undefined && this.props.signatures.length > 0 ? 
            <Tab label={ this.props.ui_values.preferred_name['signatures'] || 'Signatures' } />: null
          }
          {this.props.libraries !== undefined && this.props.libraries.length > 0 ? 
            <Tab label={ this.props.ui_values.preferred_name['libraries'] || 'Libraries' } />: null
          }
          {this.props.entities !== undefined && this.props.entities.length > 0 ? 
            <Tab label={ this.props.ui_values.preferred_name['entities'] || 'Entities' } />: null
          }
        </Tabs>
        <SwipeableViews
          index={this.state.index_value}
          onChangeIndex={this.handleChangeIndex}
        >
          {
            with_results.map((key)=>(this.search_div(key)))
          }
        </SwipeableViews>
      </div>
    )
  }
}
