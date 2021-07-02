import React from 'react'
import dynamic from 'next/dynamic'
import { withStyles } from '@material-ui/core/styles';
import {getSummary} from '../../util/ui/fetch_ui_props'
import { withTheme } from '@material-ui/core/styles';
import { withRouter } from "react-router";

const Box = dynamic(()=>import('@material-ui/core/Box'));
const Grid = dynamic(()=>import('@material-ui/core/Grid'));
const Typography = dynamic(()=>import('@material-ui/core/Typography'));
const Tabs = dynamic(()=>import('@material-ui/core/Tabs'));
const Tab = dynamic(()=>import('@material-ui/core/Tab'));
const CircularProgress = dynamic(()=>import('@material-ui/core/CircularProgress'));
const Carousel = dynamic(()=>import('react-material-ui-carousel'));

const DonutChart = dynamic(()=>import('./PieChart'));
const HorizontalBarChart = dynamic(()=>import('./BarChart'));
// const MarkdownComponent = dynamic(()=>import('../Markdown/MarkdownComponent'));
const IconComponentButton = dynamic(async () => (await import('../DataTable')).IconComponentButton);


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

class About extends React.PureComponent {
  
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
    const md = 12/Object.keys(model_counts).length
    const models = model_counts.map(m=>(
      <Grid item xs={12} key={m.name}>
        <IconComponentButton
          title={m.count}
          subtitle={m.name}
          icon={m.icon}
          href={`#${nav.MetadataSearch.endpoint}/${preferred_name[m.model]}`}
          description={`Explore ${preferred_name[m.model]}`}/>
      </Grid>
    ))
    return (
      <Grid container direction="column" align="center"> 
        {models}
      </Grid>
    )
  }

  charts = () => {
    const { pie, bar } = this.state.stats.count_charts
    const {scores = {}} = this.state.stats
    const charts = [...Object.values(pie), ...Object.values(bar), ...Object.values(scores)].sort((a,b)=>a.priority-b.priority)
    const { nav, preferred_name } = this.props.ui_values
    return charts.map(k => {
      const type = k.type || 'bar'
      const data = k.stats.filter(a=>a.count>0).sort((a,b)=>(b.count-a.count))
      if (type === 'pie'){
        return(
          <Box key={k.name}>
            <DonutChart
              data={data}
              pie_chart_style={{Pie: {fill: this.props.theme.palette.primaryVisualization.main}}}
              onClick={(data)=>{
                const search = data.payload.name
                this.props.history.push({
                  pathname: `${nav.MetadataSearch.endpoint}/${preferred_name[k.model]}`,
                  search: `?query={"filters":{"${k.field}":["${search}"]}}`,
                })
              }}
            />
            <Typography variant={'subtitle2'} align="center">{k.name}</Typography>
          </Box>
        )
      }else{
        return(
          <Box key={k.name}>
            <HorizontalBarChart
              data={data}
              pie_chart_style={{Pie: {fill: this.props.theme.palette.primaryVisualization.main}}}
              color={this.props.theme.palette.primaryVisualization.main}
              onClick={(data)=>{
                const search = data.payload.name
                this.props.history.push({
                  pathname: `${nav.MetadataSearch.endpoint}/${preferred_name[k.model]}`,
                  search: `?query={"filters":{"${k.field}":["${search}"]}}`,
                })
              }}
            />
            <Typography variant={'subtitle2'} align="center">{k.name}</Typography>
          </Box>
        )
      }
    })

  }

  render() {
    if (this.state === null) return <CircularProgress/>
    return (
      <Grid container spacing={1} style={{marginBottom: 50}}>
          {/* <Grid item xs={12} lg={6}>
            <Typography align="justify">
              <MarkdownComponent url={this.props.ui_values.nav.About.props.about} />
            </Typography>
          </Grid> */}

          <Grid item xs={2} align="right">
            {this.model_counts()}
          </Grid>
          <Grid item xs={10} align="center">
            <Carousel>
              {this.charts()}
            </Carousel>
          </Grid>
      </Grid>
    )
  }
}

export default withRouter(withTheme(About))