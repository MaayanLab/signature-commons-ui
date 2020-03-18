import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { animateScroll as scroll } from 'react-scroll'

import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

import { landingStyle } from '../../styles/jss/theme.js'
import { connect } from 'react-redux'
import { resetSigcom } from '../../util/redux/actions'
import { SearchCard, StatDiv, CountsDiv, BottomLinks, WordCloud } from './Misc'
import { ChartCard, Selections } from '../Admin/dashboard.js'
import { BarChart } from '../Admin/BarChart.js'
import { searchTerm } from "./Misc"


const mapStateToProps = (state, ownProps) => {
  return {
    ...state.serverSideProps,
    ui_values: state.ui_values,
    nav: state.ui_values.nav,
    theme: state.theme
  }
}

function mapDispatchToProps(dispatch) {
  return {
    resetSigcom: () => dispatch(resetSigcom()),
  }
}

function sortCounts(values) {
  const sorted = values.sort((a,b)=>{
    const diff = (a[1].priority || 0) - (b[1].priority || 0)
    if (diff === 0){
      return a[0].localeCompare(b[0])
    }else {
      return diff
    }
  })
  return sorted
}

class LandingPage extends React.Component {
  constructor(props) {
    super(props)
    const selected_pie = (sortCounts(Object.entries(props.piecounts || {}))[0] || [])[0]
    const selected_word = (sortCounts(Object.entries(props.wordcounts || {}))[0] || [])[0]
    const selected_bar = (sortCounts(Object.entries(props.barcounts || {}))[0] || [])[0]
    const selected_histogram = (sortCounts(Object.entries(props.histogram || {}))[0] || [])[0]
    const selected_barscore = (sortCounts(Object.entries(props.barscores || {}))[0] || [])[0]
    this.state = {
      scroll: false,
      selected_pie,
      selected_word,
      selected_bar,
      selected_histogram,
      selected_barscore,
      histogram: props.histograms[selected_histogram],
      barscore: props.barscores[selected_barscore],
      bar_stats: props.barcounts[selected_bar],
      pie_stats: props.piecounts[selected_pie],
      word_stats: props.wordcounts[selected_word],
      total_sig_per_resource: 0,
    }
  }

  componentDidMount = () => {
    this.props.resetSigcom()
    const total_sig_per_resource = this.props.resource_signature_count.reduce((tot,item)=>{
      return tot + item.counts
    },0)
    this.setState({
      total_sig_per_resource
    })
  }

  // componentDidUpdate = (prevProps) => {
  //   const current_type = this.props.match.params.type
  //   const old_type = prevProps.match.params.type
  //   console.log(old_type,current_type)
  // }

  scrollToTop = () => {
    scroll.scrollToTop()
  }

  handleSelectPie = (e) => {
    const value = e.target.value
    const pie_stats = this.props.piecounts[value]
    this.setState({
      selected_pie: value,
      pie_stats,
    })
  }

  handleSelectWord = (e) => {
    const value = e.target.value
    const word_stats = this.props.wordcounts[value]
    this.setState({
      selected_word: value,
      word_stats,
    })
  }

  handleSelectBar = (e) => {
    const value = e.target.value
    const bar_stats = this.props.barcounts[value]
    this.setState({
      selected_bar: value,
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
    for (const n in this.props.nav) {
      if (this.props.nav[n].active) {
        const endpoint_trimmed = this.props.nav[n].endpoint.substring(1)
        if (['MetadataSearch', 'SignatureSearch'].indexOf(n) > -1) {
          searchTypes = [...searchTypes, endpoint_trimmed]
        }
      }
    }
    if (searchTypes.indexOf(props.match.params.searchType) === -1) {
      return (<Redirect to='/not-found' />)
    }
    return (
      <SearchCard
        ui_values={this.props.ui_values}
        classes={this.props.classes}
        {...props}
      />
    )
  }

  searchResource = (ui_values, searchTable, term) => {
    const {preferred_name, nav} = ui_values
     location.href = `#${nav.MetadataSearch.endpoint}/${preferred_name[searchTable]}?q={"${preferred_name[searchTable]}":{"filters":{"resource": ["${term.id}"]}}}`
  }

  pie_charts_stats = (props) => {
    if (Object.keys(this.props.piecounts).length === 0 || this.state.pie_stats.stats.length === 0) return null
    if (this.props.resource_signature_count.length === 0  || this.state.total_sig_per_resource === 0 ) {
      if (Object.keys(this.props.piecounts).length < 3){
        // Do not create selection
        const all_charts = Object.entries(this.props.piecounts).map(([key,val])=>(
          <Grid item key={key} xs={12} md={Object.keys(this.props.piecounts).length > 1 ? 6: 12}
            className={this.props.classes.stretched}>
            <Grid container
              alignItems={'center'}>
              <Grid item xs={12}>
                <div className={this.props.classes.centered}>
                  <ChartCard
                    cardheight={300}
                    pie_stats={val.stats}
                    ui_values={this.props.ui_values}
                    searchTable={val.table}
                    searchTerm={searchTerm}
                  />
                </div>
              </Grid>
              <Grid item xs={12}>
                <div className={this.props.classes.centered}>
                  <span>{this.props.ui_values.text_3} {key}</span>
                </div>
              </Grid>
            </Grid>
          </Grid>
        ))
        return all_charts
      }else {
        return (
          <Grid item xs
            className={this.props.classes.stretched}>
            <Grid container
              alignItems={'center'}>
              <Grid item xs>
                <div className={this.props.classes.centered}>
                  <ChartCard
                    cardheight={300}
                    pie_stats={this.state.pie_stats.stats}
                    color={'Blue'}
                    ui_values={this.props.ui_values}
                    searchTable={this.state.pie_stats.table}
                    searchTerm={searchTerm}
                  />
                </div>
              </Grid>
              <Grid item xs={12}>
                <div className={this.props.classes.centered}>
                  <span>{this.props.ui_values.text_3 || 'Examine metadata:'}</span>
                  {Object.keys(this.props.piecounts).length>1?
                    <Selections
                      value={this.state.selected_pie}
                      values={Object.keys(this.props.piecounts).sort()}
                      onChange={(e) => this.handleSelectPie(e)}
                    />: this.state.selected_pie
                  }
                  
                </div>
              </Grid>
            </Grid>
          </Grid>
        )
      }
    }
    return (
      <Grid item xs={12} md={6}
        className={this.props.classes.stretched}>
        <Grid container
          alignItems={'center'}>
          <Grid item xs>
            <div className={this.props.classes.centered}>
              <ChartCard
                cardheight={300}
                pie_stats={this.state.pie_stats.stats}
                color={'Blue'}
                ui_values={this.props.ui_values}
                searchTable={this.state.pie_stats.table}
                searchTerm={searchTerm}
              />
            </div>
          </Grid>
          <Grid item xs={12}>
            <div className={this.props.classes.centered}>
              <span>{this.props.ui_values.text_3 || 'Examine metadata:'}</span>
              {Object.keys(this.props.piecounts).length>1?
                <Selections
                  value={this.state.selected_pie}
                  values={Object.keys(this.props.piecounts).sort()}
                  onChange={(e) => this.handleSelectPie(e)}
                />: <span> {this.state.selected_pie}</span>
              }
            </div>
          </Grid>
        </Grid>
      </Grid>
    )
  }

  render = () => {
    return (
      <div>
        <Grid container
          spacing={24}
          alignItems={'center'}>
          <Grid item xs={12} className={this.props.classes.stretched}>
            <Switch>
              <Route
                exact path="/"
                component={(props) => <Redirect to={`${this.props.nav.MetadataSearch.endpoint || '/MetadataSearch'}`} />}// {this.landing}
              />
              <Route
                path="/:searchType"
                component={(props) => this.searchCard(props)}
              />
              <Route component={(props) => {
                return <Redirect to='/not-found' />
              }} />
            </Switch>
          </Grid>
          { this.props.table_counts.length === 0 ? null :
            <Grid item xs={12} className={this.props.classes.stretched}>
              <StatDiv {...this.props}/>
            </Grid>
          }
          { this.props.resource_signature_count.length > 0 && this.state.total_sig_per_resource > 0 ?
            <Grid item xs={12} md={Object.keys(this.props.piecounts).length === 0 || this.state.pie_stats.stats.length === 0 ? 12 : 6}
              className={this.props.classes.stretched}>
              <Grid container
                alignItems={'center'}>
                <Grid item xs>
                  <div className={this.props.classes.centered}>
                    <ChartCard
                      cardheight={300}
                      pie_stats={this.props.resource_signature_count.filter(r=>r.counts>0)}
                      color={'Blue'}
                      ui_values={this.props.ui_values}
                      searchTable={"signatures"}
                      searchTerm={this.searchResource}
                    />
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <div className={this.props.classes.centered}>
                    <span className={this.props.classes.vertical20}>{this.props.ui_values.resource_pie_caption || 'Signatures per Resource'}</span>
                  </div>
                </Grid>
              </Grid>
            </Grid>
            : null
          }
          { this.pie_charts_stats() }
          { Object.keys(this.props.meta_counts).length === 0 ? null :
            <Grid item xs={12} className={this.props.classes.stretched}>
              <CountsDiv {...this.props}/>
            </Grid>
          }
          { Object.keys(this.props.wordcounts).length === 0 || this.state.word_stats.stats.length === 0 ? null :
            <Grid item xs={12} className={this.props.classes.stretched}>
              <Grid container
                spacing={24}
                alignItems={'center'}>
                <Grid item xs md={12}>
                  <div className={this.props.classes.centered}>
                    <WordCloud classes={this.props.classes}
                      ui_values={this.props.ui_values}
                      searchTable={this.state.word_stats.table}
                      stats={this.state.word_stats.stats}/>
                  </div>
                </Grid>

                <Grid item xs={12}>
                  <div className={this.props.classes.centered}>
                    <span className={this.props.classes.vertical20}>Top</span>
                    <Selections
                      value={this.state.selected_word}
                      values={Object.keys(this.props.wordcounts).sort()}
                      onChange={(e) => this.handleSelectWord(e)}
                    />
                  </div>
                </Grid>
              </Grid>
            </Grid>
          }
          { Object.keys(this.props.barcounts).length === 0 || this.state.bar_stats.stats.length ===0 ? null :
            <Grid item xs={12}
              className={this.props.classes.stretched}>
              <Grid container
                alignItems={'center'}>
                <Grid item xs={12}>
                  <div className={this.props.classes.centered}>
                    <BarChart meta_counts={this.state.bar_stats.stats}
                      searchTable={this.state.bar_stats.table}
                      ui_values={this.props.ui_values}
                      searchTerm={searchTerm}
                      XAxis
                    />
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <div className={this.props.classes.centered}>
                    {Object.keys(this.props.barcounts).length === 1 ?
                    <span>{this.state.selected_bar}</span> :
                    <React.Fragment>
                      <span>{'Top ' }</span>
                      <Selections
                        value={this.state.selected_bar}
                        values={Object.keys(this.props.barcounts).sort()}
                        onChange={(e) => this.handleSelectBar(e)}
                      />
                    </React.Fragment>
                    }
                  </div>
                </Grid>
              </Grid>
            </Grid>
          }
          { Object.keys(this.props.histograms).length === 0 || this.state.histogram.stats.length ===0 ? null :
                <Grid item xs={12} className={this.props.classes.stretched}>
                  <Grid container
                    spacing={24}
                    alignItems={'center'}>
                    <Grid item xs>
                      <div className={this.props.classes.centered}>
                        <BarChart meta_counts={this.state.histogram.stats}
                          ui_values={this.props.ui_values}
                          searchTable={this.state.histogram.table}
                          searchTerm={searchTerm}
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
          { Object.keys(this.props.barscores).length === 0 || this.state.barscore.stats.length ===0 ? null :
                <Grid item xs={12} className={this.props.classes.stretched}>
                  <Grid container
                    spacing={24}
                    alignItems={'center'}>
                    <Grid item xs>
                      <div className={this.props.classes.centered}>
                        <BarChart meta_counts={this.state.barscore.stats}
                          searchTable={this.state.barscore.table}
                          ui_values={this.props.ui_values}
                          searchTerm={searchTerm}
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
            <BottomLinks
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
