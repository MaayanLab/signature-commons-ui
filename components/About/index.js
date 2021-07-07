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
const MarkdownComponent = dynamic(()=>import('../Markdown/MarkdownComponent'));
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
  constructor(props) {
    super(props)
    this.state = {
      pie: Object.keys(props.stats.count_charts.pie)[0],
      bar: Object.keys(props.stats.count_charts.bar)[0],
      word: Object.keys(props.stats.count_charts.word)[0]
    }
  }

  model_counts = () => {
    const { model_counts } = this.props.stats
    const { nav, preferred_name } = this.props.ui_values
    const md = 12/Object.keys(model_counts).length
    const models = model_counts.map(m=>{
    const url = m.model === "resources" ? `#${nav.Resources.endpoint}`: `#${nav.MetadataSearch.endpoint}/${preferred_name[m.model]}`
    return(
      <Grid item xs={12} key={m.name}>
        <IconComponentButton
          title={m.count}
          subtitle={m.name}
          icon={m.icon}
          href={url}
          description={`Explore ${preferred_name[m.model]}`}/>
      </Grid>
    )})
    return (
      <Grid container direction="column" align="center"> 
        {models}
      </Grid>
    )
  }

  charts = ({ignore_bar, ignore_pie, scale_bar=[], scale_pie=[]}) => {
    const ignore = {
      pie: ignore_pie || {},
      bar: ignore_bar || {},
    }
    const { pie, bar } = this.props.stats.count_charts
    const {scores = {}} = this.props.stats
    const charts = [...Object.values(pie), ...Object.values(bar), ...Object.values(scores)].sort((a,b)=>a.priority-b.priority)
    const { nav, preferred_name } = this.props.ui_values
    return charts.map(k => {
      const type = k.type || 'bar'
      let data = k.stats.filter(a=>a.count>0 && (ignore[type][k.name] || []).indexOf(a.name) === -1).sort((a,b)=>(b.count-a.count))
      if (type === 'pie'){
        if (scale_pie.indexOf(k.name)>-1) {
          data = data.map(d=>({
            ...d,
            count: Math.log(d.count),
            unscaled_count: d.count
          }))
        }
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
              scale={scale_bar.indexOf(k.name)>-1 ? "log": "auto"}//{k.scale || "auto"}
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
    const {about, ignore_bar, ignore_pie, scale_bar, scale_pie} = this.props.ui_values.nav.About.props
    return (
      <Grid container spacing={1} style={{marginBottom: 50}}>
          {this.props.location.pathname === this.props.ui_values.nav.About.endpoint &&
            <Grid item xs={12}>
              <Typography align="justify">
                <MarkdownComponent url={about} />
              </Typography>
            </Grid>
          }

          <Grid item xs={2} align="right">
            {this.model_counts()}
          </Grid>
          <Grid item xs={10} align="center">
            <Carousel>
              {this.charts({ignore_bar, ignore_pie, scale_bar, scale_pie})}
            </Carousel>
          </Grid>
      </Grid>
    )
  }
}

export default withRouter(withTheme(About))