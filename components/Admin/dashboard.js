import React from 'react'
import Card from '@material-ui/core/Card'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import ListItem from '@material-ui/core/ListItem'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import CircularProgress from '@material-ui/core/CircularProgress'
import DonutChart from './PieChart.js'
import { BarChart } from './BarChart.js'
import { withScreenSize } from '@vx/responsive'

import { cardChartStyle } from '../../styles/jss/components/ChartStyle.js'
import { landingStyle } from '../../styles/jss/theme.js'

function sum(arr, prop) {
  let total = 0
  for (let i = 0, _len = arr.length; i < _len; i++) {
    total += arr[i][prop]
  }
  return total
}

export const ListItemLink = (props) => (
  <ListItem button component="a" {...props} />
)


export const Selections = withStyles(landingStyle)(function({ classes, record = {}, ...props }) {
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
      style={{marginTop:-5}}
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

export const PieChart = withStyles(landingStyle)(function({ classes, record = {}, ...props }) {
  const stats = Object.entries(props.stats).map(function(entry) {
    return ({ 'label': entry[0], 'value': entry[1] })
  })
  const slice = props.slice || 14
  stats.sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
  const included = stats.slice(0, slice)
  const included_sum = sum(included, 'value')
  const other = sum(stats.slice(slice), 'value')
  const other_sum = included_sum > other || included_sum < included.length * 10 ? other : included_sum * 1.5
  const others = [{ 'label': 'others', 'value': other_sum }]
  const data = other_sum > 0 ? included.concat(others) : included
  let true_values = included.map((entry) => (
    { label: entry.label, value: entry.value }
  ))
  true_values = true_values.concat({ label: 'others', value: other })

  data.sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
  true_values.sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
  return (
    <div><DonutChart
      data={data}
      {...props}/></div>

  )
})

export const ChartCard = withStyles(cardChartStyle)(function({ classes, ...props }) {
  const { pie_stats } = props
  return (
    <Grid container
      spacing={0}
      direction={'column'}
      align="center"
      justify="center">
      <Grid item xs={12}>
        {pie_stats === null ?
            <div className={classes.progress}>
              <CircularProgress />
            </div> :
            <PieChart stats={pie_stats} {...props}/>
        }
      </Grid>
    </Grid>
  )
})

const PieChartGroup = withScreenSize(function({ classes, record = {}, ...props }) {
  const { name, selected_field } = props
  const pie_stats = name === 'Resource' ? props.resource_signatures : props.pie_stats
  const cardheight = props.screenWidth > 900 || props.screenWidth < 600 ? 300 : 250
  return (
    <Card className={classes.basicCard}>
      <Grid container
        spacing={24}
        direction={'column'}>
        <Grid item xs={12}>
          {name !== 'Resource' ?
              <div>
                <span className={classes.vertical20}>Examine: </span>
                <Selections
                  value={ selected_field}
                  values={Object.keys(props.pie_fields_and_stats).sort()}
                  onChange={(e) => props.handleSelectField(e)}
                />
              </div> :
              <span className={classes.vertical55}>{props.ui_values.LandingText.resource_pie_caption || 'Signatures per Resource'}</span>
          }
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <ChartCard cardheight={cardheight} pie_stats={pie_stats} color={'Blue'} slice={props.pie_slice} ui_values={props.ui_values} selected_field={selected_field} disabled/>
        </Grid>
      </Grid>
    </Card>
  )
})

const BarChartGroup = withScreenSize(function({ classes, record = {}, ...props }) {
  const { bar_counts, name } = props
  return (
    <Card className={classes.basicCard}>
      <span className={classes.vertical55}>{name}</span>
      <Divider />
      { bar_counts !== undefined ?
      <BarChart meta_counts={bar_counts} ui_values={props.ui_values}/> : null
      }
    </Card>
  )
})

const StatCard = function({ classes, record = {}, ...props }) {
  const { stat_type, counts, icon } = props
  return (
    <Card className={`${classes.statCard} ${classes.GrayCardHeader}`}>
      <Grid container spacing={24}
        justify="space-between">
        <Grid item>
          <h5 style={{ marginBottom: 0 }}>{counts}</h5>
          <p style={{ marginTop: 0 }}>{stat_type}</p>
        </Grid>
        <Grid item>
          <span className={`mdi ${icon} mdi-48px`}></span>
        </Grid>
      </Grid>
    </Card>
  )
}

const StatRow = function({ classes, record = {}, ...props }) {
  return (
    <Grid container spacing={24}>
      {props.table_counts.filter((item) => item.Visible_On_Admin).map((item) => (
        <Grid
          key={`${item.preferred_name}-grid`}
          item xs={6} md
        >
          <StatCard
            counts={item.counts}
            icon={item.icon}
            stat_type={item.preferred_name}
            classes={classes}
            new_entries={item.counts}
          />
        </Grid>
      ))}
    </Grid>
  )
}

export const Dashboard = withStyles(landingStyle)(function({ classes, record = {}, ...props }) {
  return (
    <div className={classes.root}>
      <Grid container spacing={24}>
        { props.table_counts.length === 0 ? null :
          <Grid item xs={12}>
            <StatRow classes={classes} {...props}/>
          </Grid>
        }
        { props.resource_signatures === undefined ? null :
          <Grid item xs={12} sm>
            <PieChartGroup name={'Resource'}
              classes={classes}
              {...props}
            />
          </Grid>
        }
        { Object.keys(props.pie_fields_and_stats).length === 0 ? null :
          <Grid item xs={12} sm>
            <PieChartGroup name={props.selected_field}
              classes={classes}
              {...props}/>
          </Grid>
        }
        { Object.keys(props.meta_counts).length === 0 ? null :
          <Grid item xs={12}>
            <BarChartGroup classes={classes}
              name={'Unique terms per field'}
              bar_counts={props.meta_counts}
              {...props}/>
          </Grid>
        }
        { Object.keys(props.barcounts).length === 0 || props.barcounts === undefined ? null :
          <Grid item xs={12}>
            { props.ui_values.bar_chart !== undefined ?
                <BarChartGroup classes={classes}
                  name={props.ui_values.bar_chart.Caption}
                  bar_counts={props.barcounts[props.ui_values.bar_chart.Field_Name]}
                  {...props}/> :
                <BarChartGroup classes={classes}
                  name={'Bar Chart'}
                  bar_counts={props.barcounts[Object.keys(props.barcounts)[0]]}
                  {...props}/>
            }
          </Grid>
        }
      </Grid>
    </div>
  )
})
