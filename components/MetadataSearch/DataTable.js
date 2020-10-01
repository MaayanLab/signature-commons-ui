import React from 'react'
import dynamic from 'next/dynamic'

import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Chip from '@material-ui/core/Chip'
import Card from '@material-ui/core/Card'
import CardMedia from '@material-ui/core/CardMedia'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import CircularProgress from '@material-ui/core/CircularProgress'
import Modal from '@material-ui/core/Modal'
import Tooltip from '@material-ui/core/Tooltip'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'

import { Highlight } from '../Highlight'
import ShowMeta from '../ShowMeta'

import IconButton from '../IconButton'
import ScorePopper from '../ScorePopper'
import Collapse from '@material-ui/core/Collapse'
import DownloadButton from '../Downloads'

const Options = dynamic(() => import('../Options'), { ssr: false })

const styles = (theme) => ({
  chipRoot: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: '5px 10px 5px 0',
    maxWidth: 500,
  },
  chipLabel: {
    margin: '5px 10px 5px 0',
    maxWidth: 400,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'inline-block',
  },
  card: {
    width: '100%',
  },
  margin: {
    margin: theme.spacing.unit,
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  actions: {
    display: 'flex',
  },
  icon: {
    paddingBottom: 35,
    paddingLeft: 5,
  },
  menuIcon: {
    paddingBottom: 10,
  },
})


export const InfoCard = ({ data, schemas, ui_values, classes, search, expandRenderer, ...props }) => {
  const score_icon = ui_values.score_icon || 'mdi-trophy-award'
  const default_tag_icon = 'mdi-arrow-top-right-thick'
  return (
    <Card style={{
      overflow: 'auto',
    }}>
      <CardContent style={{ paddingBottom: 3 }}>
        <Grid container>
          <Grid item md={11} sm={10} xs={9}>
            <Grid container>
              <Grid item md={2} xs={4} style={{ textAlign: 'center' }}>
                <CardMedia style={{ marginTop: -30 }} {...data.processed.icon}>
                  <IconButton {...data.processed.icon} onClick={props.handleClick} value={data}/>
                </CardMedia>
                <Tooltip title={'See more'}
                  placement="bottom">
                  <Button aria-label="Expand"
                    onClick={() => props.handleClick(data)}
                    className={classes.margin}
                    style={{ minWidth: 5, paddingTop: 0, paddingBottom: 0 }}
                  >
                    <span className={`mdi mdi-chevron-${props.expanded ? 'up' : 'down'} mdi-24px`}/>
                  </Button>
                </Tooltip>
              </Grid>
              <Grid item md={10} xs={8}>
                <Grid container>
                  <Grid item xs={12}>
                    <Highlight
                      Component={(props) => {
                        if (data.processed.name.hyperlink !== undefined) {
                          return (
                            <Typography variant="subtitle1">
                              <a href={data.processed.name.hyperlink} target="_blank" rel="noopener noreferrer" >{props.children}</a>
                            </Typography>
                          )
                        } else {
                          return (
                            <Typography variant="subtitle1">
                              {props.children}
                            </Typography>
                          )
                        }
                      }}
                      text={data.processed.name.text}
                      highlight={search}
                    />
                  </Grid>
                  {data.processed.subtitle === undefined ? null :
                    <Grid item xs={12}>
                      <Highlight
                        Component={(props) => {
                          if (data.processed.subtitle.hyperlink !== undefined) {
                            return (
                              <Typography variant="subtitle2">
                                <i><a href={data.processed.subtitle.hyperlink} target="_blank" rel="noopener noreferrer" >{props.children}</a></i>
                              </Typography>
                            )
                          } else {
                            return (
                              <Typography variant="subtitle2">
                                {props.children}
                              </Typography>
                            )
                          }
                        }}
                        text={data.processed.subtitle.text}
                        highlight={search}
                      />
                    </Grid>
                  }
                  {Object.entries(data.processed.display).map(([label, value]) => {
                    if (value.hyperlink === undefined) {
                      return (
                        <Grid item xs={12} key={value.label}>
                          <Typography variant="caption" style={{ textTransform: 'uppercase' }}>
                            {value.label}: {value.text}
                          </Typography>
                        </Grid>
                      )
                    } else {
                      return (
                        <Grid item xs={12} key={value.label}>
                          <Typography variant="caption" style={{ textTransform: 'uppercase' }}>
                            {value.label}: <a href={value.hyperlink} target="_blank" rel="noopener noreferrer">{value.text}</a>
                          </Typography>
                        </Grid>
                      )
                    }
                  })}
                  <Grid item xs={12}>
                  </Grid>
                  <Grid item xs={12}>
                    {data.processed.tags.map((tag) =>
                      <Tooltip title={tag.text}
                        key={tag.text}
                        placement="bottom">
                        <Chip className={classes.chip} key={tag.label}
                          avatar={<Icon className={`${classes.icon} mdi ${tag.icon || default_tag_icon} mdi-18px`} />}
                          label={<Highlight
                            Component={(props) => <span {...props} className={classes.chipLabel}>{props.children}</span>}
                            text={`${tag.label}: ${tag.text}`}
                            highlight={search}
                          />}
                          onClick={() => {
                            if (tag.clickable) {
                              props.onChipClick(tag.text)
                            }
                          }}
                        />
                      </Tooltip>)}
                  </Grid>
                  {Object.entries(data.processed.keywords).map(([label, value]) => (
                    <Grid item xs={12} key={value.label}>
                      <Typography variant="caption">
                        {value.label}:
                      </Typography>
                      {value.value.map((v) => (
                        <Tooltip title={v}
                          key={v}
                          placement="bottom">
                          <Chip className={classes.chip} key={v}
                            avatar={<Icon className={`${classes.icon} mdi ${value.icon || default_tag_icon} mdi-18px`} />}
                            label={<Highlight
                              Component={(props) => <span {...props} className={classes.chipLabel}>{props.children}</span>}
                              text={`${v}`}
                              highlight={search}
                            />}
                            onClick={() => {
                              props.onChipClick(v)
                            }}
                          />
                        </Tooltip>
                      ))}
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item md={1} sm={2} xs={3}>
            <Grid container direction={'column'}>
              { props.current_table === 'libraries' || props.deactivate_download ? null :
                <Grid item>
                  <Options type={props.current_table} item={data.original} ui_values={ui_values}
                    submit={() => {
                      console.log('submitted')
                    }} schemas={schemas} history={props.history}/>
                </Grid>
              }
              { data.processed.scores !== undefined ?
                <Grid item>
                  <ScorePopper scores={data.processed.scores}
                    score_icon={score_icon}
                    sorted={props.sorted}
                    sortBy={props.sortBy}
                    classes={classes}
                  />
                </Grid> : null
              }
              { !props.deactivate_download && data.processed.download !== undefined && data.processed.download.length > 0 ?
                <Grid item style={{ textAlign: 'center' }}>
                  <DownloadButton data={data.processed.download} {...props} />
                </Grid> : null
              }
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
      <Collapse in={props.expanded} timeout="auto" unmountOnExit>
        <CardContent>
          {expandRenderer({ data, ...props })}
          {/* <ExpandedMeta data={data} {...props}/> */}
        </CardContent>
      </Collapse>
    </Card>
  )
}

class DataTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      expanded: null,
    }
  }
  handleClick = (metadata) => {
    this.setState((prevState) => ({
      expanded: prevState.expanded === metadata.original.id ? null : metadata.original.id,
    }))
  }
  handleClose = () => {
    this.setState({
      expanded: null,
    })
  }
  render() {
    if (!this.props.loaded) {
      return <div style={{ textAlign: 'center', marginTop: 20 }}><CircularProgress /></div>
    }
    if (this.props.collection.length === 0) {
      return (<span>No Results</span>)
    }
    return (
      <div>
        <Grid container>
          {this.props.sortBy !== undefined && Object.keys(this.props.sort_tags).length > 0 ?
            <Grid item style={{ marginLeft: 'auto', marginRight: 0, marginBottom: 10 }}>
              <FormControl>
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={this.props.sorted}
                  onChange={(e) => this.props.sortBy(e.target.value)}
                >
                  {Object.entries(this.props.sort_tags).map(([field_name, values]) => (
                    <MenuItem value={field_name} key={field_name}>{values.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid> : null
          }
          <Grid item style={{ width: '100%' }}>
            {this.props.collection.map((data, ind) => <InfoCard key={data.original.id}
              {...this.props}
              handleClick={this.handleClick}
              data={data}
              expanded={this.state.expanded === data.original.id}
            />)}
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(styles)(DataTable)
