import React from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'

import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import red from '@material-ui/core/colors/red';

import MUIDataTable from "mui-datatables"
import { fetch_meta_post } from '../util/fetch/meta'
import { makeTemplate } from '../util/makeTemplate'
import { Highlight } from './Highlight'
import { default_schemas, objectMatch } from './Label'

import { get_ui_values } from './index'
import ShowMeta from './ShowMeta'

import sample_data from '../examples/sample_data.json'

const Options = dynamic(() => import('./Options'), { ssr: false })

const styles = theme => ({
  expansion: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    margin: 20,
    overflowWrap: 'break-word',
    wordWrap: 'break-word',
    height: '300px',
    overflow: 'auto',
  },
  chipRoot: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: theme.spacing.unit,
  },
  card: {
    width: '100%',
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  actions: {
    display: 'flex',
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  avatar: {
    margin: 10,
  },
});

export const value_by_type = {
  text: ({label, prop, data, highlight}) => {
    let val = makeTemplate(prop.text, data)
    if (val === 'undefined'){
      return null
    } else {
      if (!(prop.title || prop.item || prop.parent || prop.icon)){
        val = `${label}: ${val}`
      }
      return val
      // return (
      //   <Highlight
      //     text={val}
      //     highlight={highlight}
      //   />
      // )
    }
  }, 
  object: ({label, prop, data, highlight}) => {
    let val = makeTemplate(prop.text, data, prop.subfield)
    if (val === 'undefined'){
      return null
    } else {
      if (!(prop.title || prop.item || prop.parent || prop.icon)){
        val = `${label}: ${val}`
      }
      return val
      // return (
      //   <Highlight
      //     text={val}
      //     highlight={highlight}
      //   />
      // )
    }
  }, 
  'img': ({label, prop, data, highlight }) => {
    const src = makeTemplate(prop.src, data)
    const alt = makeTemplate(prop.alt, data)
    if ( alt === 'undefined'){
      return null
    } else {
      return {src, alt}
      // return <Avatar alt={alt} src={src} />
      // return(
      //   <Chip
      //     avatar={<Avatar alt={alt} src={src} />}
      //     label={<Highlight
      //       Component={(props) => <span {...props}>{props.children}</span>}
      //       text={alt}
      //       highlight={highlight}
      //     />}
      //     className="grey white-text"
      //   />
      // )
    }
  },
}

export const CustomRowRender = withStyles(styles)((props) => {
    const {data,
      dataIndex,
      rowIndex,
      columns,
      classes,
      ui_values,
      schemas,
      submit,
      table_name,
      highlight,
      expanded_row,
      toggleExpanded,
    } = props
    const title_index = columns.findIndex(col=>col.title)
    const parent_index = columns.findIndex(col=>col.parent)
    const icon_index = columns.findIndex(col=>col.icon)
    const item_index = columns.findIndex(col=>col.item)
    const item = data[item_index]
    return (
      <tr>
        <td>
          <Card className={classes.card}>
            <CardHeader
              avatar={ icon_index > -1 ?
                <Avatar alt={data[icon_index].alt} 
                  src={data[icon_index].src} className={classes.avatar} />:
                <Avatar aria-label="row_icon" className={classes.avatar}>
                  <span className='mdi mdi-fingerprint'/>
                </Avatar>
              }
              action={
                  <Options type={table_name} item={item} ui_values={ui_values}
                            submit={submit} schemas={schemas}/>
              }
              title={title_index > -1 ? data[title_index]: item.id}
              subheader={parent_index > -1 ? data[parent_index]: null}
            />
            <CardContent>
              <div className={classes.chipRoot}>
              {
                columns.map((col,index)=>{
                  if([title_index, parent_index, icon_index, item_index].indexOf(index)>-1){
                    return null
                  }else if(data[index] === undefined){
                    return null
                  }else{
                    if (col.type==='img'){
                      return(
                        <Chip
                          key={col.name}
                          avatar={<Avatar alt={data[index].alt}
                                          src={data[index].src}
                                  />}
                          label={<Highlight
                            Component={(props) => <span {...props}>{props.children}</span>}
                            text={alt}
                            highlight={highlight}
                          />}
                        className={`${classes.chip} grey white-text`}
                        />
                      )
                    }
                    return(
                      <Chip
                        key={col.name}
                        label={
                          <Highlight
                            text={data[index]}
                            highlight={highlight}
                          />}
                        className={`${classes.chip} grey white-text`}
                      />
                    )
                  }
                })
              }
              </div>
            </CardContent>
            <CardActions className={classes.actions} disableActionSpacing>
              <IconButton
                className={`${classes.expand} ${expanded_row[rowIndex] ? classes.expandOpen: ''}`}
                onClick={()=>{
                  toggleExpanded(rowIndex)
                }}
                aria-expanded={expanded_row[rowIndex]}
                aria-label="Show more"
              >
                <span className="mdi mdi-chevron-down" />
              </IconButton>
            </CardActions>
            <Collapse in={expanded_row[rowIndex]} timeout="auto" unmountOnExit>
              <CardContent className={classes.expansion}>
                <ShowMeta
                  value={[
                    {
                      '@id': item.id,
                      '@type': 'Signature',
                      'meta': item.meta,
                    },
                    {
                      '@id': item.library.id,
                      '@type': 'Library',
                      'meta': item.library.meta,
                    }
                  ]}
                />
              </CardContent>
            </Collapse>
          </Card>
        </td>
      </tr>
    )
  })

export default class DataTable extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      columns: [],
      data: [],
      table_name: "signatures",
      expanded_row: [],
    }
    this.toggleExpanded = this.toggleExpanded.bind(this)
  }
  async componentDidMount(){
    const {ui_values} = await get_ui_values()
    const schemas = await this.get_schemas()
    this.parse_rows(sample_data[0].signatures, schemas)
    this.setState({
      schemas,
      ui_values
    })
  }

  toggleExpanded(rowIndex){
    console.log(rowIndex)
    this.setState(prevState=>{
      let expanded_row = prevState.expanded_row
      expanded_row[rowIndex] = !expanded_row[rowIndex]
      return {
        expanded_row
      }
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

  options = {
     print: false,
     download: false,
     selectableRows: false,
     filter: false,
     viewColumns: false,
     filterType: 'multiselect',
     customRowRender: (data, dataIndex, rowIndex) => (
        <CustomRowRender
          key={rowIndex}
          {...this.state} 
          data={data}
          dataIndex={dataIndex}
          rowIndex={rowIndex}
          toggleExpanded={this.toggleExpanded}
        />
      ),
     onTableChange: (action, tableState) => {
      console.log(action)
      console.log(tableState)
     }
    }

  parse_rows(data, schemas){
    let matched_schemas = schemas.filter(
        (schema) => objectMatch(schema.match, data[0])
    )
    if (matched_schemas.length === 0){
      matched_schemas = default_schemas.filter(
        (schema) => objectMatch(schema.match, data[0])
      )
    }
    if (matched_schemas.length < 1) {
      console.error('Could not match ui-schema for', data[0])
      return null
    }
    const schema = matched_schemas[0]
    const sorted_schema = Object.entries(schema.properties).sort((a, b) => a[1].priority - b[1].priority)
    let columns_set = new Set()
    let columns = [{name: "data_item",
      priority: 0, 
      item: true,
      options: {
        display:false,
        viewColumns: false,
      }
    }]
    let values = []
    let expanded_row = []
    for (const item of data){
      const item_val = {data_item: item}
      expanded_row = [...expanded_row, false]
      for (const s of sorted_schema){
        const [key, prop] = s
        const val = value_by_type[prop.type]({label:key, prop, data: item})
        if (val !== null){
          if (!columns_set.has(key)){
            columns_set.add(key)
            columns = [...columns, {name: key,
              ...prop,
              options: {
                display:false,
                viewColumns: false,
                }
              }]
          }
          item_val = {...item_val, [key]: val}
        }
      }
      values = [...values, item_val]
    }
    // Make sure that column names are sorted based on priority
    columns = columns.sort((a, b) => a.priority - b.priority)
    this.setState({
      columns,
      expanded_row,
      data: values
    })
  }

  render() {
    const {columns, data} = this.state
    if (columns.length === 0 && data.length===0){
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
            <MUIDataTable
              columns={columns}
              data={data}
              options={this.options}
            />
          </div>
        </main>
      </div>
    )
  }
}