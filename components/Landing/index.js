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
   ...state.serverSideProps
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
    const selected_field = Object.keys(props.pie_fields_and_stats)[0]
    this.state = {
      input: {},
      searchType: 'metadata',
      type: 'Overlap',
      scroll: false,
      selected_field,
      pie_meta: props.pie_fields_and_stats[selected_field] || {},
    }
  }

  componentDidMount() {
    this.props.resetSigcom()
  }

  scrollToTop = () => {
    scroll.scrollToTop()
  }

  handleSelectField = (e) => {
    const value = e.target.value
    console.log(value)
    const pie_meta = this.props.pie_fields_and_stats[value]
    this.setState({
      pie_meta,
    })
  }

  searchCard = (props, searchType) => {
    return(
    <SearchCard
      searchType={searchType}
      ui_values={this.props.ui_values}
      classes={this.props.classes}
      {...props}
    />
  )}

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
                component={(props)=><Redirect to='/MetadataSearch' />}//{this.landing}
              />
              <Route
                path="/MetadataSearch"
                component={props=>this.searchCard(props, "MetadataSearch")}
              />
              <Route
                exact path="/SignatureSearch"
                component={(props)=><Redirect to='/SignatureSearch/Overlap' />}//{this.landing}
              />
              <Route
                path="/SignatureSearch/:type"
                component={props=>this.searchCard(props, "SignatureSearch")}
              />
              <Route component={(props)=><Redirect to='/not-found' />} />
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
              { this.props.resource_signatures === undefined ? null :
                <Grid item xs={12} sm={this.props.barcounts === undefined || Object.keys(this.props.barcounts).length === 0 ? true : 6}>
                  <div className={this.props.classes.centered}>
                    <ChartCard cardheight={300} pie_stats={this.props.resource_signatures} resources color={'Blue'} ui_values={this.props.ui_values}/>
                    <Typography variant="caption">
                      {this.props.ui_values.LandingText.resource_pie_caption || 'Signatures per Resource'}
                    </Typography>
                  </div>
                </Grid>
              }
              { this.props.barcounts === undefined || Object.keys(this.props.barcounts).length === 0 ? null :
                <Grid item xs={12} sm={this.props.resource_signatures === undefined ? true : 6}>
                  { this.props.ui_values.bar_chart !== undefined ? (
                    <div className={this.props.classes.centered}>
                      {this.props.barcounts[this.props.ui_values.bar_chart.Field_Name] !== undefined ? (
                      <BarChart meta_counts={this.props.barcounts[this.props.ui_values.bar_chart.Field_Name]}
                        ui_values={this.props.ui_values}/>) : (
                      null
                      )}
                      <Typography variant="caption">
                        {this.props.ui_values.bar_chart.Caption}
                      </Typography>
                    </div>
                  ) : (
                    <div className={this.props.classes.centered}>
                      {this.props.barcounts[Object.keys(this.props.barcounts)[0]] !== undefined ?
                      <BarChart meta_counts={this.props.barcounts[Object.keys(this.props.barcounts)[0]]}
                        ui_values={this.props.ui_values}/> :
                        null
                      }
                      <Typography variant="caption">
                        Bar Chart
                      </Typography>
                    </div>
                  )}
                </Grid>
              }
            </Grid>
          </Grid>
          <Grid item xs={12} className={this.props.classes.stretched}>
          </Grid>
          { Object.keys(this.props.meta_counts).length === 0 ? null :
            <Grid item xs={12} className={this.props.classes.stretched}>
              <CountsDiv {...this.props}/>
            </Grid>
          }
          { Object.keys(this.props.pie_fields_and_stats).length === 0 ? null :
            <Grid item xs={12} className={this.props.classes.stretched}>
              <Grid container
                spacing={24}
                alignItems={'center'}>
                <Grid item xs={12}>
                  <div className={this.props.classes.centered}>
                    <span className={this.props.classes.vertical20}>{this.props.ui_values.LandingText.text_3 || 'Examine metadata:'}</span>
                    <Selections
                      value={this.state.selected_field}
                      values={Object.keys(this.props.pie_fields_and_stats).sort()}
                      onChange={(e) => this.handleSelectField(e)}
                    />
                  </div>
                </Grid>
                <Grid item xs md={this.props.ui_values.deactivate_wordcloud ? 12 : 6}>
                  <div className={this.props.classes.centered}>
                    <ChartCard cardheight={300} pie_stats={this.state.pie_meta.stats} slice={this.state.pie_meta.slice} color={'Blue'} ui_values={this.props.ui_values}/>
                    <Typography variant="caption">
                      {`${this.props.pie_table} per ${this.state.pie_meta.preferred_name}`}
                    </Typography>
                  </div>
                </Grid>
                { this.props.ui_values.deactivate_wordcloud ? null :
                  <Grid item xs md={6}>
                    <div className={this.props.classes.centered}>
                      <WordCloud classes={this.props.classes} stats={this.state.pie_meta.stats}/>
                      <Typography variant="caption">
                        Top {this.props.pie_preferred_name} terms
                      </Typography>
                    </div>
                  </Grid>
                }
              </Grid>
            </Grid>
          }
        </Grid>
      </div>
    )}

  // render = () => {
  //   return (
  //     <div>
  //       <Grid container
  //         spacing={24}
  //         alignItems={'center'}
  //         direction={'column'}>
  //         <Grid item xs={12} className={this.props.classes.stretched}>
  //           <SearchCard
  //             currentSearchArrayChange={this.props.currentSearchArrayChange}
  //             handleChange={this.props.handleChange}
  //             currentSearchArray={this.props.metadata_search.currentSearchArray}
  //             search_status={this.props.metadata_search.search_status}
  //             type={this.state.type}
  //             searchType={this.props.searchType}
  //             submit={this.props.submit}
  //             changeSignatureType={this.props.changeSignatureType}
  //             updateSignatureInput={this.props.updateSignatureInput}
  //             ui_values={this.props.ui_values}
  //             classes={this.props.classes}
  //             signature_search={this.props.signature_search}
  //           />
  //         </Grid>
  //         { this.props.table_counts.length === 0 ? null :
  //           <Grid item xs={12} className={this.props.classes.stretched}>
  //             <StatDiv {...this.props}/>
  //           </Grid>
  //         }
  //         <Grid item xs={12} className={this.props.classes.stretched}>
  //           <Grid container
  //             spacing={24}
  //             alignItems={'center'}>
  //             { this.props.resource_signatures === undefined ? null :
  //               <Grid item xs={12} sm={Object.keys(this.props.barcounts).length === 0 || this.props.barcounts === undefined ? true : 6}>
  //                 <div className={this.props.classes.centered}>
  //                   <ChartCard cardheight={300} pie_stats={this.props.resource_signatures} resources color={'Blue'} ui_values={this.props.ui_values}/>
  //                   <Typography variant="caption">
  //                     {this.props.ui_values.LandingText.resource_pie_caption || 'Signatures per Resource'}
  //                   </Typography>
  //                 </div>
  //               </Grid>
  //             }
  //             { Object.keys(this.props.barcounts).length === 0 || this.props.barcounts === undefined ? null :
  //               <Grid item xs={12} sm={this.props.resource_signatures === undefined ? true : 6}>
  //                 { this.props.ui_values.bar_chart !== undefined ? (
  //                   <div className={this.props.classes.centered}>
  //                     {this.props.barcounts[this.props.ui_values.bar_chart.Field_Name] !== undefined ? (
  //                     <BarChart meta_counts={this.props.barcounts[this.props.ui_values.bar_chart.Field_Name]}
  //                       ui_values={this.props.ui_values}/>) : (
  //                     null
  //                     )}
  //                     <Typography variant="caption">
  //                       {this.props.ui_values.bar_chart.Caption}
  //                     </Typography>
  //                   </div>
  //                 ) : (
  //                   <div className={this.props.classes.centered}>
  //                     {this.props.barcounts[Object.keys(this.props.barcounts)[0]] !== undefined ?
  //                     <BarChart meta_counts={this.props.barcounts[Object.keys(this.props.barcounts)[0]]}
  //                       ui_values={this.props.ui_values}/> :
  //                       null
  //                     }
  //                     <Typography variant="caption">
  //                       Bar Chart
  //                     </Typography>
  //                   </div>
  //                 )}
  //               </Grid>
  //             }
  //           </Grid>
  //         </Grid>
  //         <Grid item xs={12} className={this.props.classes.stretched}>
  //         </Grid>
  //         { Object.keys(this.props.meta_counts).length === 0 ? null :
  //           <Grid item xs={12} className={this.props.classes.stretched}>
  //             <CountsDiv {...this.props}/>
  //           </Grid>
  //         }
  //         { Object.keys(this.props.pie_fields_and_stats).length === 0 ? null :
  //           <Grid item xs={12} className={this.props.classes.stretched}>
  //             <Grid container
  //               spacing={24}
  //               alignItems={'center'}>
  //               <Grid item xs={12}>
  //                 <div className={this.props.classes.centered}>
  //                   <span className={this.props.classes.vertical20}>{this.props.ui_values.LandingText.text_3 || 'Examine metadata:'}</span>
  //                   <Selections
  //                     value={this.props.selected_field}
  //                     values={Object.keys(this.props.pie_fields_and_stats).sort()}
  //                     onChange={(e) => this.props.handleSelectField(e)}
  //                   />
  //                 </div>
  //               </Grid>
  //               <Grid item xs md={this.props.ui_values.deactivate_wordcloud ? 12 : 6}>
  //                 <div className={this.props.classes.centered}>
  //                   <ChartCard cardheight={300} pie_stats={this.props.pie_stats} slice={this.props.pie_slice} color={'Blue'} ui_values={this.props.ui_values}/>
  //                   <Typography variant="caption">
  //                     {`${this.props.pie_table} per ${this.props.pie_preferred_name}`}
  //                   </Typography>
  //                 </div>
  //               </Grid>
  //               { this.props.ui_values.deactivate_wordcloud ? null :
  //                 <Grid item xs md={6}>
  //                   <div className={this.props.classes.centered}>
  //                     <WordCloud classes={this.props.classes} stats={this.props.pie_stats}/>
  //                     <Typography variant="caption">
  //                       Top {this.props.pie_preferred_name} terms
  //                     </Typography>
  //                   </div>
  //                 </Grid>
  //               }
  //             </Grid>
  //           </Grid>
  //         }
  //         <Grid item xs={12}>
  //           <BottomLinks handleChange={this.props.handleChange}
  //             {...this.props} />
  //         </Grid>
  //         <Grid item xs={12}>
  //         </Grid>
  //       </Grid>
  //     </div>
  //   )
  // }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(landingStyle)(LandingPage))