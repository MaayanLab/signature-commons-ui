import React from 'react'
import Card from '@material-ui/core/Card'
import { withStyles } from '@material-ui/core/styles'
import BlurOn from '@material-ui/icons/BlurOn'
import Assessment from '@material-ui/icons/Assessment'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import ListItem from '@material-ui/core/ListItem'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import CircularProgress from '@material-ui/core/CircularProgress'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import { DonutChart } from './VXpie.js'
import { BarChart } from './VXbar.js'
import { withScreenSize } from '@vx/responsive'

import { cardIconStyle } from '../../styles/jss/components/CardIconStyle.js'
import { cardChartStyle } from '../../styles/jss/components/ChartStyle.js'
import { landingStyle } from '../../styles/jss/theme.js'

import { LibraryBooks,
  Fingerprint,
  Web,
  Blur } from 'mdi-material-ui'

Array.prototype.sum = function(prop) {
  let total = 0
  for ( let i = 0, _len = this.length; i < _len; i++ ) {
    total += this[i][prop]
  }
  return total
}

const icon_mapper = {
  Libraries: LibraryBooks,
  Signatures: Fingerprint,
  Entities: Blur,
  Resources: Web,
}


export const ListItemLink = (props) => (
  <ListItem button component="a" {...props} />
)

export const CardIcon = withStyles(cardIconStyle)(({ Icon, classes, type }) => (
  <Card className={`${classes.cardIcon} ${classes[type]}`}>
    <Icon className={classes.icon} />
  </Card>
))

const db_vals = (db, props) => {
  const vals = {
    Libraries: {
      fields: props.library_piefields,
      stats: props.libchart,
      selected_field: props.libselected,
      icon: LibraryBooks,
      num: props.LibraryNumber,
      title: 'Library Stats',
    },
    Signatures: {
      fields: props.signature_piefields,
      stats: props.sigchart,
      selected_field: props.sigselected,
      icon: Fingerprint,
      num: props.SignatureNumber,
      title: 'Signature Stats',
    },
    Entities: {
      fields: props.entity_fields,
      stats: props.entchart,
      selected_field: props.entselected,
      icon: BlurOn,
      num: props.EntityNumber,
    },
  }
  return (vals[db])
}

const StatTable = withStyles(landingStyle)( function({ classes, record={}, ...props }) {
  const { fields, signature_counts, preferred_name } = props
  if (signature_counts === null) {
    return (
      <Table className={classes.table}>
        <TableBody>
          {Object.keys(fields).map((key) => (
            <TableRow key={`${key}_key`}>
              <TableCell component="th" scope="row">
                {key.replace('_', '')}
              </TableCell>
              <TableCell align="center">Loading...</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  } else {
    return (
      <Table className={classes.table}>
        <TableBody>
          {signature_counts.map((entry) => (
            <TableRow key={`${entry.name}_entry`}>
              <TableCell component="th" scope="row">
                {preferred_name[entry.name]}
              </TableCell>
              <TableCell align="center">{entry.counts}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }
})

export const Stat = withStyles(landingStyle)( function({ classes, record={}, ...props }) {
  if (props.type!=='Stats') {
    const { icon, num } = db_vals(props.type, props)
    return (
      <div className={classes.main}>
        <CardIcon Icon={icon} type={`${props.color}CardHeader`} />
        <Card className={classes.numcard}>
          <Typography className={classes.title} color="textSecondary">
            {props.type}
          </Typography>
          <Typography variant="headline" className={classes.statnum} component="h5">
            {num}
          </Typography>
        </Card>
      </div>
    )
  } else {
    const icon = Assessment
    if (props.fields!==null) {
      return (
        <div className={classes.main}>
          <CardIcon Icon={icon} type={`${props.color}CardHeader`} />
          <Card className={classes.longcard}>
            <Typography variant="headline" className={classes.namebox} component="h5">
                    Overview
            </Typography>
            <Divider />
            <StatTable {...props}/>
          </Card>
        </div>
      )
    } else {
      return (<div/>)
    }
  }
})

export const Selections = withStyles(landingStyle)( function({ classes, record={}, ...props }) {
  return (
    <TextField
      id="charts"
      select
      label={props.name}
      className={`${classes.textField} ${classes.unpadded}`}
      value={props.value}
      SelectProps={{
        MenuProps: {
          className: classes.menu,
        },
      }}
      margin="normal"
      onChange={props.onChange}
    >
      {props.values.map(function(k) {
        if (!['$validator', 'Original_String'].includes(k)) {
          return (
            <MenuItem key={k} value={k}>
              {k.replace(/_/g, ' ')}
            </MenuItem>
          )
        }
      })}
    </TextField>
  )
})

export const PieChart = withStyles(landingStyle)( function({ classes, record={}, ...props }) {
  const stats = Object.entries(props.stats).map(function(entry) {
    return ({ 'label': entry[0], 'value': entry[1] })
  })
  stats.sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
  const included = stats.slice(0, 14)
  const included_sum = included.sum('value')
  const other = stats.slice(14,).sum('value')
  const other_sum = included_sum > other || included_sum < included.length*10 ? other: included_sum*1.5
  const others = [{ 'label': 'others', 'value': other_sum }]
  const data = other_sum >0 ? included.concat(others): included
  let true_values = included.map((entry)=>(
    { label: entry.label, value: entry.value }
  ))
  true_values = true_values.concat({ label: 'others', value: other })

  data.sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
  true_values.sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
  let width = 220
  let height = 220
  let radius= 150
  let fontSize = 7
  if (props.cardheight ==300) {
    radius=200
    width=300
    height=300
    fontSize=10
  }
  return (
    <div><DonutChart width={width}
      height={height}
      radius={radius}
      fontSize={fontSize}
      margin={{
        'top': 10,
        'bottom': 10,
        'left': 10,
        'right': 10 }}
      data={data}
      true_values={true_values}
      {...props}/></div>

  )
})

export const ChartCard = withStyles(cardChartStyle)( function({ classes, ...props }) {
  const { pie_stats } = props
  return (
    <Grid container
      spacing={0}
      direction={'column'}
      align="center"
      justify="center">
      <Grid item xs={12}>
        {pie_stats===null ?
            <div className={classes.progress}>
              <CircularProgress />
            </div>:
            <PieChart stats={pie_stats} {...props}/>
        }
      </Grid>
    </Grid>
  )
})

const PieChartGroup = withScreenSize(function({ classes, record={}, ...props }) {
  const { name, selected_field, piefields } = props
  const pie_stats = name === 'Resource' ? props.resource_signatures: props.pie_stats
  const cardheight = props.screenWidth > 900 || props.screenWidth < 600 ? 300 : 250
  return (
    <Card className={classes.basicCard}>
      <Grid container
        spacing={24}
        direction={'column'}>
        <Grid item xs={12}>
          {name !== 'Resource' ?
              <div>
                <span className={classes.vertical20}>Signatures per </span>
                <Selections
                  value={ selected_field}
                  values={Object.keys( piefields).sort()}
                  onChange={(e) => props.handleSelectField(e)}
                />
              </div>:
              <span className={classes.vertical55}>Signatures per {name}</span>
          }
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <ChartCard cardheight={cardheight} pie_stats={pie_stats} color={'Blue'} selected_field={selected_field}/>
        </Grid>
      </Grid>
    </Card>
  )
})

const BarChartGroup = withScreenSize(function({ classes, record={}, ...props }) {
  const { bar_counts, name } = props
  const width = props.screenWidth > 900 ? 1000 : 700
  const height = props.screenWidth > 900 ? 400 : 300
  const fontSize = props.screenWidth > 900 ? 11 : 8
  return (
    <Card className={classes.basicCard}>
      <span className={classes.vertical55}>{name}</span>
      <Divider />
      <BarChart width={width} height={height} meta_counts={bar_counts} fontSize={fontSize}/>
    </Card>
  )
})

const StatCard = function({ classes, record={}, ...props }) {
  const { stat_type, counts, new_entries } = props
  const Icon = icon_mapper[stat_type]
  return (
    <Card className={`${classes.statCard} ${classes.GrayCardHeader}`}>
      <Grid container spacing={24}>
        <Grid item xs={7}>
          <Typography variant="title" className={classes.whiteText}>
            {counts}
          </Typography>
          <Typography variant="subheader">
            {stat_type}
          </Typography>
          <Typography variant="button" className={classes.whiteText}>
              ({new_entries} new)
          </Typography>
        </Grid>
        <Grid item xs={5}>
          <Icon className={classes.bigIcon} />
        </Grid>
      </Grid>
    </Card>
  )
}

const StatRow = function({ classes, record={}, ...props }) {
  return (
    <Grid container spacing={24}>
      <Grid item xs={6} md={3}>
        <StatCard counts={props.LibraryNumber} stat_type="Libraries" classes={classes} new_entries={props.LibraryNumber}/>
      </Grid>
      <Grid item xs={6} md={3}>
        <StatCard counts={props.SignatureNumber} stat_type="Signatures" classes={classes} new_entries={props.SignatureNumber}/>
      </Grid>
      <Grid item xs={6} md={3}>
        <StatCard counts={props.EntityNumber} stat_type="Entities" classes={classes} new_entries={props.EntityNumber}/>
      </Grid>
      <Grid item xs={6} md={3}>
        <StatCard counts={Object.keys(props.resource_signatures).length} stat_type="Resources" classes={classes} new_entries={Object.keys(props.resource_signatures).length}/>
      </Grid>
    </Grid>
  )
}

export const Dashboard = withStyles(landingStyle)( function({ classes, record={}, ...props }) {
  return (
    <div className={classes.root}>
      <Grid container spacing={24}>
        <Grid item xs={12}>
          <StatRow classes={classes} {...props}/>
        </Grid>
        <Grid item xs={12} sm={6}>
          <PieChartGroup name={'Resource'}
            classes={classes}
            {...props}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <PieChartGroup name={props.selected_field}
            classes={classes}
            {...props}/>
        </Grid>
        <Grid item xs={12}>
          <BarChartGroup classes={classes}
            name={'Unique terms per field'}
            bar_counts={props.meta_counts}
            {...props}/>
        </Grid>
        <Grid item xs={12}>
          <BarChartGroup classes={classes}
            name={'Libraries per year'}
            bar_counts={props.version_counts}
            {...props}/>
        </Grid>
      </Grid>
    </div>
  )
})
