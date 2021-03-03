import React from 'react'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import {IconComponentButton} from '../DataTable'
import DonutChart from  './PieChart'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { withStyles } from '@material-ui/core/styles';
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import { getSummary } from '../../util/ui/fetch_ui_props'
import CircularProgress from '@material-ui/core/CircularProgress'

export const CustomTabs = withStyles(() => ({
	indicator: {
		opacity: 0
	}
  }))((props) => <Tabs {...props} />);


  export const CustomTab = withStyles(() => ({
	root: {
    minWidth: "unset",
    width: 40,
    paddingLeft: 10,
    paddingRight: 10
	},
  }))((props) => <Tab {...props} />);

export default class About extends React.PureComponent {
  
  componentDidMount = async () => {
    const stats = await getSummary()
    this.setState({
      stats,
      pie: Object.keys(stats.count_charts.pie)[0],
      bar: Object.keys(stats.count_charts.bar)[0],
      word: Object.keys(stats.count_charts.word)[0]
    })
  }

  model_counts = () => {
    const { model_counts } = this.state.stats
    const { nav, preferred_name } = this.props.ui_values
    const models = model_counts.map(m=>(
      <IconComponentButton
        title={m.count}
        subtitle={m.name}
        icon={m.icon}
        href={`#${nav.MetadataSearch.endpoint}/${preferred_name[m.model]}`}
        description={`Explore ${preferred_name[m.model]}`}/>
    ))
    return models
  }

  pie_charts = () => {
    const { pie } = this.state.stats.count_charts
    const { nav, preferred_name, pie_chart_style } = this.props.ui_values
    const p = pie[this.state.pie]
    const data = p.stats.sort((a,b)=>(b.count-a.count))
    return(
      <React.Fragment>
        <DonutChart
          data={data}
          pie_chart_style={pie_chart_style}
          onClick={(data)=>{
            const search = data.payload.name
            this.props.history.push({
              pathname: `${nav.MetadataSearch.endpoint}/${preferred_name[p.model]}`,
              search: `?query={"filters":{"${p.field}":["${search}"]}}`,
            })
          }}
        />
        <Typography variant={'button'} align="center">{p.name}</Typography>
        <CustomTabs
          value={this.state.pie}
          onChange={(event, pie)=>this.setState({pie})}
          indicatorColor="primary"
          textColor="primary"
          aria-label="icon tabs example"
          centered
        >
          {Object.keys(pie).map(p=>(
            <CustomTab value={p}
              key={p}
              icon={<FiberManualRecordIcon fontSize="small"/>}
            />
          ))}
        </CustomTabs>
      </React.Fragment>
    ) 
    

  }

  render() {
    if (this.state === null) return <CircularProgress/>
    const { model_counts, meta_counts, count_charts } = this.state.stats
    return (
      <Grid container spacing={1} style={{marginBottom: 50}}>
          <Grid item xs={12} lg={6}>
            <Typography variant={'h4'} gutterBottom>About</Typography>
            <Typography align="justify">
              <ReactMarkdown plugins={[gfm]} children={this.props.ui_values.about}/>
            </Typography>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Grid container spacing={3}>
              <Grid item xs={12} align="center">
                {this.model_counts()}
              </Grid>
              <Grid item xs={12} align="center">
                {this.pie_charts()}
              </Grid>
            </Grid>
          </Grid>
      </Grid>
    )
  }
}
