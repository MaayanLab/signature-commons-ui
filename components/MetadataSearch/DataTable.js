import React from 'react'
import dynamic from 'next/dynamic'

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
import CircularProgress from '@material-ui/core/CircularProgress';
import Modal from '@material-ui/core/Modal';
import Tooltip from '@material-ui/core/Tooltip';

import { makeTemplate } from '../../util/makeTemplate'
import { Highlight } from '../Highlight'
import {findMatchedSchema} from '../../util/objectMatch'
import ShowMeta from '../ShowMeta'

import IconButton from '../IconButton'
import ScorePopper from '../ScorePopper'


const Options = dynamic(() => import('../Options'), { ssr: false })

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
    margin: "5px 10px 5px 0",
    maxWidth: 500,
  },
  chipLabel: {
    margin: "5px 10px 5px 0",
    maxWidth: 400,
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "inline-block"
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




export const InfoCard = ({data, schemas, ui_values, classes, search, ...props}) => {
  const score_icon = ui_values.score_icon || 'mdi-trophy-award'
  const default_tag_icon = 'mdi-arrow-top-right-thick'
  return(
    <Card>
      <CardContent>
        <Grid container>
          <Grid item md={11} sm={10} xs={9}>
            <Grid container>
              <Grid item md={2} xs={4} style={{textAlign: "center"}}>
                <CardMedia style={{marginTop:-30}} {...data.processed.icon}>
                  <IconButton {...data.processed.icon} onClick={props.handleClick} value={data}/>
                </CardMedia>
              </Grid>
              <Grid item md={10} xs={8}>
                <Grid container>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      {data.processed.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">
                      <i>{data.processed.subtitle}</i>
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                  </Grid>
                  <Grid item xs={12}>
                    {data.processed.tags.map(tag=>
                      <Tooltip title={tag.value}
                        placement="bottom">
                        <Chip className={classes.chip} key={tag.label}
                          avatar={<Icon className={`${classes.icon} mdi ${tag.icon || default_tag_icon} mdi-18px`} />}
                          label={<Highlight
                              Component={(props) => <span {...props} className={classes.chipLabel}>{props.children}</span>}
                              text={`${tag.label}: ${tag.value}`}
                              highlight={search}
                            />}
                          onClick={()=>props.onChipClick(tag.value)}
                        />
                      </Tooltip>)}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item md={1} sm={2} xs={3} style={{textAlign: "right"}}>
            <Grid container direction={"column"}>
              <Grid item>
                { props.current_table === "libraries" || props.deactivate_download ? null:
                <Options type={props.current_table} item={data.original} ui_values={ui_values}
                    submit={()=>{console.log("submitted")}} schemas={schemas} history={props.history}/>
                }
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
      metadata: null,
      open: false
    }
  }
  handleClick = (metadata) => {
    this.setState({
      metadata,
      open: true
    })
  }
  handleClose = () => {
    this.setState({
      open: false
    })
  }
  render() {
    if (!this.props.loaded ){
      return <div style={{textAlign: "center", marginTop: 20}}><CircularProgress /></div>
    }
    if (this.props.collection.length===0)
      return(<span>No Results</span>)
    return(
      <div>
        {this.state.metadata!==null ? 
          <Modal
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
            open={this.state.open}
            onClose={this.handleClose}
          >
            <Card style={{minWidth:700,
              maxWidth: 1000,
              maxHeight: 700,
              overflow: "scroll",
              position: "absolute",
              float: "left",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}>
              <Grid
                container
                direction="row"
              >
                <Grid item xs={2} style={{textAlign: "right"}}>
                  <CardMedia style={{marginTop:-10}}>
                    <IconButton
                      {...this.state.metadata.processed.icon}
                    />
                  </CardMedia>
                </Grid>
                <Grid item xs={10}>
                  <CardContent>
                    <Grid
                      container
                      direction="row"
                    >
                      <Grid item xs={12}>
                        <ShowMeta
                          value={[
                            {
                              '@id': this.state.metadata.original.id,
                              '@name': this.state.metadata.processed.name,
                              'meta': this.state.metadata.original.meta,
                            }
                          ]}
                          highlight={this.props.search}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Grid>
              </Grid>
            </Card>
          </Modal>: null
        }
        <div style={{
          maxWidth: '100%',
        }}>
          {this.props.collection.map((data,ind)=><InfoCard key={data.original.id}
            {...this.props}
            handleClick={this.handleClick}
            data={data}
          />)}
        </div>
      </div>
    )
  }
}

export default withStyles(styles)(DataTable)