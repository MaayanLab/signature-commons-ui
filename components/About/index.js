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
import CircularProgress from '@material-ui/core/CircularProgress'
import MarkdownComponent from '../Markdown/MarkdownComponent'
import {getSummary} from '../../util/ui/fetch_ui_props'
import { withTheme } from '@material-ui/core/styles';
import Carousel from 'react-material-ui-carousel';

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
      <Grid item xs={12} md={md} key={m.name}>
        <IconComponentButton
          title={m.count}
          subtitle={m.name}
          icon={m.icon}
          href={`#${nav.MetadataSearch.endpoint}/${preferred_name[m.model]}`}
          description={`Explore ${preferred_name[m.model]}`}/>
      </Grid>
    ))
    return (
      <Grid container>
        {models}
      </Grid>
    )
  }

  pie_charts = () => {
    const { pie } = this.state.stats.count_charts
    if (Object.keys(pie).length === 0) return null
    const { nav, preferred_name } = this.props.ui_values
    return (
      <Carousel>
            {
                Object.keys(pie).map(k => {
                  const p = pie[k]
                  const data = p.stats.sort((a,b)=>(b.count-a.count))
                  return (
                    <React.Fragment key={k}>
                      <DonutChart
                        data={data}
                        pie_chart_style={{Pie: {fill: this.props.theme.palette.primaryVisualization.main}}}
                        onClick={(data)=>{
                          const search = data.payload.name
                          this.props.history.push({
                            pathname: `${nav.MetadataSearch.endpoint}/${preferred_name[p.model]}`,
                            search: `?query={"filters":{"${p.field}":["${search}"]}}`,
                          })
                        }}
                      />
                      <Typography variant={'button'} align="center">{p.name}</Typography>
                    </React.Fragment>
                )})
            }
        </Carousel>
    )

  }

  render() {
    if (this.state === null) return <CircularProgress/>
    return (
      <Grid container spacing={1} style={{marginBottom: 50}}>
          <Grid item xs={12} lg={6}>
            <Typography align="justify">
              <MarkdownComponent url={this.props.ui_values.about_md || this.props.ui_values.about} />
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

export default withTheme(About)