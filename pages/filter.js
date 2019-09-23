import React from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Checkbox from '@material-ui/core/Checkbox';
import { get_ui_values } from './index'

import { fetch_meta_post } from '../util/fetch/meta'
import count_per_parent from '../examples/sample_count.json'


class FilterCard extends React.Component{

  render() {
    const sorted = this.props.data_count.sort((a, b) => b.count - a.count)
    return(
      <Card style={{
        height: 300,
        width: 250,
        overflow: "scroll",
      }}>
        <CardContent>
          <FormLabel component="legend">{this.props.label}</FormLabel>
          <FormGroup>
            {sorted.map(({id, count})=>(
              <FormControlLabel
                control={
                  <Checkbox checked onChange={console.log(id)} value={id} />
                }
                label={`${id} (${count})`}
              />
            ))}
          </FormGroup>
        </CardContent>
      </Card>
    )
  }
}

export default class ParentFilter extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      count_per_parent: {},
      sig_counts: [],
      schemas: [],
    }
  }

  async componentDidMount(){
    const {ui_values} = await get_ui_values()
    const schemas = await this.get_schemas()
    const sig_counts = Object.entries(count_per_parent.signatures).filter(
      ([k,v])=>v.count>0).map(([k,v])=>({
      id: k,
      count: v.count
    }))
    this.setState({
      sig_counts,
      schemas
    })
  }

  async get_schemas() {
    const { response: schema_db } = await fetch_meta_post({
      endpoint: '/schemas/find',
      body: {
        filter: {
          where: {
            'meta.$validator': '/dcic/signature-commons-schema/v5/meta/schema/ui-schema.json',
          },
        },
      },
    })
    const schemas = schema_db.map((schema) => (schema.meta))
    return schemas
  }

  render() {
    const {schemas, sig_counts} = this.state
    if (schemas.length===0){
      return (<span>Loading...</span>)
    }
    return(
      <div className="root">
        <Head>
          <meta charSet="utf-8" />
          <link rel="shortcut icon" href={`${process.env.PREFIX}/static/favicon.ico`} />
          <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
          <link href="https://cdn.materialdesignicons.com/3.6.95/css/materialdesignicons.min.css" rel="stylesheet" />
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
          <script async defer src="https://buttons.github.io/buttons.js"></script>
        </Head>
        <main>
          <div style={{
            maxWidth: '100%',
          }}>
            <FilterCard
              data_count={sig_counts}
              ui_values={this.state.ui_values}
              schemas={schemas}
              label="libraries"
            />
          </div>
        </main>
      </div>
    )
  }
}
