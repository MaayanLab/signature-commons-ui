import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { animateScroll as scroll } from 'react-scroll'

import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

import { landingStyle } from '../../styles/jss/theme.js'
import { connect } from 'react-redux';
import { resetSigcom } from "../../util/redux/actions";
import { SearchCard, StatDiv, CountsDiv, BottomLinks, WordCloud } from './Misc'
import { ChartCard, Selections } from '../Admin/dashboard.js'
import { BarChart } from '../Admin/BarChart.js'

const mapStateToProps = (state, ownProps) => {
  return { 
   ...state.serverSideProps,
   nav: state.serverSideProps.ui_values.nav
  }
};

function mapDispatchToProps(dispatch) {
  return {
    resetSigcom : () => dispatch(resetSigcom()),
  };
}


class LandingPage extends React.Component {
  constructor(props) {
    super(props)
    const selected_field = Object.keys(props.barcounts).filter(i=>i!==props.ui_values.bar_chart_solo.Field_Name)[0]
    const selected_histogram = Object.keys(props.histograms).sort()[0]
    const selected_barscore = Object.keys(props.barscores)[0]
    this.state = {
      scroll: false,
      selected_field,
      selected_histogram,
      selected_barscore,
      histogram: props.histograms[selected_histogram],
      barscore: props.barscores[selected_barscore],
      bar_stats: props.barcounts[selected_field],
    }
  }

  componentDidMount = () => {
    this.props.resetSigcom()
  }

  // componentDidUpdate = (prevProps) => {
  //   const current_type = this.props.match.params.type
  //   const old_type = prevProps.match.params.type
  //   console.log(old_type,current_type)
  // }

  scrollToTop = () => {
    scroll.scrollToTop()
  }

  handleSelectField = (e) => {
    const value = e.target.value
    const bar_stats = this.props.barcounts[value]
    this.setState({
      selected_field: value,
      bar_stats,
    })
  }

  handleSelectHistogram = (e) => {
    const value = e.target.value
    const histogram = this.props.histograms[value]
    this.setState({
      selected_histogram: value,
      histogram,
    })
  }

  handleSelectBarScore = (e) => {
    const value = e.target.value
    const barscore = this.props.barscores[value]
    this.setState({
      selected_barscore: value,
      barscore,
    })
  }

  searchCard = (props) => {
    let searchTypes = []
    for (const n in this.props.nav){
      if (this.props.nav[n].active){
        const endpoint_trimmed = this.props.nav[n].endpoint.substring(1)
        if (["MetadataSearch", "SignatureSearch"].indexOf(n) > -1){
          searchTypes = [...searchTypes, endpoint_trimmed]
        }
      }
    }
    if (searchTypes.indexOf(props.match.params.searchType) === -1){
      return (<Redirect to='/not-found' />)
    }
    return(
      <SearchCard
        ui_values={this.props.ui_values}
        classes={this.props.classes}
        {...props}
      />
    )
  }

  render = () => {
    return(
      <div>
        <Grid container
          spacing={24}
          alignItems={'center'}
          direction={'column'}>
          <Grid item xs={12} className={this.props.classes.stretched}>
            <Switch>
              <Route
                exact path="/"
                component={(props)=><Redirect to={`${this.props.nav.MetadataSearch.endpoint || "/MetadataSearch"}`} />}//{this.landing}
              />
              <Route
                path="/:searchType"
                component={props=>this.searchCard(props)}
              />
              <Route component={(props)=>{
                return <Redirect to='/not-found' />}} />
            </Switch>
          </Grid>
          { this.props.table_counts.length === 0 ? null :
            <Grid item xs={12} className={this.props.classes.stretched}>
              <StatDiv {...this.props}/>
            </Grid>
          }
          <Grid item xs={12} className={this.props.classes.stretched}>
            <Grid container
              spacing={24}
              alignItems={'center'}>
              {
                Object.entries(this.props.pie_fields_and_stats).map(([key,value])=>(
                  <Grid item xs={12} key={key} sm>
                    <ChartCard cardheight={300} pie_stats={value.stats} resources color={'Blue'} ui_values={this.props.ui_values}/>
                    <div className={this.props.classes.centered}>
                      <Typography variant="overline">
                        Tool {value.Preferred_Name}
                      </Typography>
                    </div>
                  </Grid>
                ))
              }
            </Grid>
          </Grid>
          <Grid item xs={12} className={this.props.classes.stretched}>
          </Grid>
          { Object.keys(this.props.barcounts).length === 0 ? null :
            <Grid item xs={12} className={this.props.classes.stretched}>
              <Grid container
                spacing={24}
                alignItems={'center'}>
                <Grid item xs md={this.props.ui_values.deactivate_wordcloud ? 12 : 6}>
                  <div className={this.props.classes.centered}>
                    <BarChart meta_counts={this.state.bar_stats.stats}
                        ui_values={this.props.ui_values}
                        XAxis
                    />
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <div className={this.props.classes.centered}>
                    <span className={this.props.classes.vertical20}>{"Top " ||this.props.ui_values.LandingText.text_3 || 'Examine metadata:'}</span>
                    <Selections
                      value={this.state.selected_field}
                      values={Object.keys(this.props.barcounts).sort()}
                      onChange={(e) => this.handleSelectField(e)}
                    />
                  </div>
                </Grid>
              </Grid>
            </Grid>
          }
          { Object.keys(this.props.meta_counts).length === 0 ? null :
            <Grid item xs={12} className={this.props.classes.stretched}>
              <CountsDiv {...this.props}/>
            </Grid>
          }
          { Object.keys(this.props.histograms).length === 0 ? null :
                <Grid item xs={12} className={this.props.classes.stretched}>
                  <Grid container
                    spacing={24}
                    alignItems={'center'}>
                    <Grid item xs md={this.props.ui_values.deactivate_wordcloud ? 12 : 6}>
                      <div className={this.props.classes.centered}>
                        <BarChart meta_counts={this.state.histogram.stats}
                            ui_values={this.props.ui_values}
                            YAxis
                        />
                        <Typography variant="overline">
                          {`${this.state.histogram.Preferred_Name} Histogram`}
                        </Typography>
                      </div>
                    </Grid>
                    <Grid item xs={12}>
                      <div className={this.props.classes.centered}>
                        <span className={this.props.classes.vertical20}>{'Examine histograms:'}</span>
                        <Selections
                          value={this.state.selected_histogram}
                          values={Object.keys(this.props.histograms).sort()}
                          onChange={(e) => this.handleSelectHistogram(e)}
                        />
                      </div>
                    </Grid>
                  </Grid>
                </Grid>
              }
              { Object.keys(this.props.barscores).length === 0 ? null :
                <Grid item xs={12} className={this.props.classes.stretched}>
                  <Grid container
                    spacing={24}
                    alignItems={'center'}>
                    <Grid item xs md={this.props.ui_values.deactivate_wordcloud ? 12 : 6}>
                      <div className={this.props.classes.centered}>
                        <BarChart meta_counts={this.state.barscore.stats}
                            ui_values={this.props.ui_values}
                            XAxis
                        />
                      </div>
                    </Grid>
                    <Grid item xs={12}>
                      <div className={this.props.classes.centered}>
                        <span className={this.props.classes.vertical20}>{'Top'}</span>
                        <Selections
                          value={this.state.selected_barscore}
                          values={Object.keys(this.props.barscores).sort()}
                          onChange={(e) => this.handleSelectBarScore(e)}
                        />
                      </div>
                    </Grid>
                  </Grid>
                </Grid>
              }
          <Grid item xs={12}>
            <BottomLinks handleChange={this.props.handleChange}
              {...this.props} />
          </Grid>
          <Grid item xs={12}>
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(landingStyle)(LandingPage))