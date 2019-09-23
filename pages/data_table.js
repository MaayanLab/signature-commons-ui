import React from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Chip from '@material-ui/core/Chip';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';

import { fetch_meta_post } from '../util/fetch/meta'
import { makeTemplate } from '../util/makeTemplate'
import { Highlight } from '../components/Highlight'
import {findMatchedSchema} from '../util/objectMatch'

import { get_ui_values } from './index'
import ShowMeta from '../components/ShowMeta'

import sample_data from '../examples/sample_data.json'
import IconButton from '../components/IconButton'
import ScorePopper from '../components/ScorePopper'

const Options = dynamic(() => import('../components/Options'), { ssr: false })

const styles = theme => ({
  chip: {
    margin: "5px 10px 5px 0",
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
  icon: {
    paddingBottom: 35,
    paddingLeft: 5,
  },
  menuIcon: {
    paddingBottom: 10,
  },
});

export const value_by_type = {
  text: ({label, prop, data}) => {
    let val = makeTemplate(prop.text, data)
    if (val === 'undefined'){
      return null
    } else {
      return val
      // return (
      //   <Highlight
      //     text={val}
      //     highlight={highlight}
      //   />
      // )
    }
  },
  object: ({label, prop, data}) => {
    let val = makeTemplate(prop.subfield, data)
    if (val === 'undefined'){
      return null
    } else {
      return val
      // return (
      //   <Highlight
      //     text={val}
      //     highlight={highlight}
      //   />
      // )
    }
  },
  'img': ({label, prop, data }) => {
    const src = makeTemplate(prop.src, data)
    const alt = makeTemplate(prop.alt, data)
    if ( alt === 'undefined'){
      return null
    } else {
      // return {src, alt}
      return {alt, src}
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

export const get_card_data = (data, schemas, highlight=undefined) => {
  const schema = findMatchedSchema(data, schemas)
  const { properties } = schema
  let scores= {}
  let tags = []
  const processed = {id: data.id}
  for (const label of Object.keys(properties)){
    const prop = properties[label]
    console.log(prop)
    const val = value_by_type[prop.type]({label, prop, data, highlight})
    if (prop.name){
      processed.name = val || data.id
    }else if (prop.subtitle){
      if (val!==null) processed.subtitle = val
    }else if (prop.icon){
      if (val!==null){
        processed.icon = {...val}
      }
    }else if (prop.score){
      if (val!==null) scores[label] = {
        label,
        value: val,
        icon: prop.MDI_Icon || 'mdi-star'
      }
    }else {
      if ( val !== null) tags = [...tags, {
        label,
        value: val,
        icon: prop.MDI_Icon || 'mdi-arrow-top-right-thick',
        priority: prop.priority
      }]
    }
  }
  tags = tags.sort((a, b) => a.priority - b.priority)
  if (Object.keys(scores).length>0) processed.scores = scores
  if (tags.length>0) processed.tags = tags
  return {original: data, processed}
}

export const InfoCard = ({data, schemas, ui_values, classes, highlight, ...props}) => {
  const score_icon = ui_values.score_icon || 'mdi-trophy-award'
  const default_tag_icon = 'mdi-arrow-top-right-thick'
  return(
    <Card>
      <CardContent>
        <Grid container>
          <Grid item md={11} sm={10} xs={9}>
            <Grid container>
              <Grid item lg={1} sm={2} xs={3} style={{textAlign: "center"}}>
                <CardMedia style={{marginTop:-30}} {...data.processed.icon}>
                  <IconButton {...data.processed.icon} title={' '}/>
                </CardMedia>
              </Grid>
              <Grid item lg={11} sm={10} xs={9}>
                <Grid container>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      {data.processed.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">
                      {data.processed.subtitle}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                  </Grid>
                  <Grid item xs={12}>
                    {data.processed.tags.map(tag=><Chip className={classes.chip}
                      avatar={<Icon className={`${classes.icon} mdi ${tag.icon || default_tag_icon} mdi-18px`} />}
                      label={<Highlight
                          Component={(props) => <span {...props}>{props.children}</span>}
                          text={`${tag.label}: ${tag.value}`}
                          highlight={highlight}
                        />}
                      />)}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item md={1} sm={2} xs={3} style={{textAlign: "right"}}>
            <Grid container direction={"column"}>
              <Grid item>
                <Options type={"signatures"} item={data.original} ui_values={ui_values}
                  submit={()=>{console.log(submitted)}} schemas={schemas}/>
              </Grid>
              { data.processed.scores !== undefined ?
                <Grid item>
                  <ScorePopper scores={data.processed.scores}
                    score_icon={score_icon}
                    sorted={props.sorted}
                    sortBy={props.sortBy}
                    classes={classes}
                    />
                </Grid>: null
              }
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

class DataTable extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      schemas: [],
      collection: [],
      sorted: null,
    }
  }
  async componentDidMount(){
    const {ui_values} = await get_ui_values()
    const schemas = await this.get_schemas()
    const collection = sample_data[0].signatures.map(data=>get_card_data(data, schemas))
    this.setState({
      schemas,
      ui_values,
      collection,
    }, ()=> this.sortBy("P-Value"))
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

  sortBy = (sorted) => {
    let collection = this.state.collection
    collection = collection.sort((a, b) => a.processed.scores[sorted].value - b.processed.scores[sorted].value)
    this.setState({
      sorted,
      collection
    })
  }

  render() {
    const {schemas, collection} = this.state
    const {classes} = this.props
    if (collection.length===0 || schemas.length===0){
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
            {this.state.collection.map((data,ind)=><InfoCard key={data.id}
              highlight={["heart"]}
              classes={classes}
              data={data}
              ui_values={this.state.ui_values}
              schemas={this.state.schemas}
              sortBy={this.sortBy}
              sorted={this.state.sorted}
            />)}
          </div>
        </main>
      </div>
    )
  }
}

export default withStyles(styles)(DataTable)