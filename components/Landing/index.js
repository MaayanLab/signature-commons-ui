import React from 'react'

import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

import { landingStyle } from '../../styles/jss/theme.js'


import { SearchCard, StatDiv, CountsDiv, BottomLinks, WordCloud } from './Misc'
import { ChartCard, Selections } from '../Admin/dashboard.js'
import { BarChart } from '../Admin/VXbar.js'

export default withStyles(landingStyle)(class LandingPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      search: '',
      input: {},
      searchType: 'metadata',
      type: 'Overlap',
    }
    this.handleChange = this.handleChange.bind(this)
    this.searchChange = this.searchChange.bind(this)
  }

  handleChange(event, searchType) {
    if (searchType) {
      this.setState({ searchType }, () => {
        const element = document.getElementById('topcard')
        element.scrollIntoView({ block: 'start', inline: 'center', behavior: 'smooth' })
      })
    }
  }
  searchChange(e) {
    this.setState({ search: e.target.value })
  }


  render() {
    return (
      <div>
        <Grid container
          spacing={24}
          alignItems={'center'}
          direction={'column'}>
          <Grid item xs={12} className={this.props.classes.stretched} id='topcard'>
            <SearchCard search={this.state.search}
              searchChange={this.searchChange}
              handleChange={this.handleChange}
              type={this.state.type}
              searchType={this.state.searchType}
              submit={this.submit}
              {...this.props} />
          </Grid>
          <Grid item xs={12} className={this.props.classes.stretched}>
            <StatDiv {...this.props}/>
          </Grid>
          <Grid item xs={12} className={this.props.classes.stretched}>
            <Grid container
              spacing={24}
              alignItems={'center'}>
              <Grid item xs={12} sm={6}>
                <ChartCard cardheight={300} pie_stats={this.props.resource_signatures} resources color={'Blue'}/>
                <div className={this.props.classes.centered}>
                  <Typography variant="caption">
                    {this.props.ui_content.content.resource_pie_caption || 'Signatures per Resource'}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={12} sm={6}>
                { this.props.ui_content.content['bar-chart'] !== undefined ? (
                  <div className={this.props.classes.centered}>
                    {this.props.barcounts[this.props.ui_content.content['bar-chart'].Field_Name] !== undefined ? (
                    <BarChart width={300} height={320} meta_counts={this.props.barcounts[this.props.ui_content.content['bar-chart'].Field_Name]}
                      fontSize={this.props.ui_content.content['bar-chart'].font_size || 11}/>) : (
                    null
                    )}
                    <Typography variant="caption">
                      {this.props.ui_content.content['bar-chart'].Caption}
                    </Typography>
                  </div>
                ) : (
                  <div className={this.props.classes.centered}>
                    {this.props.barcounts[Object.keys(this.props.barcounts)[0]] !== undefined ?
                    <BarChart width={300} height={320} meta_counts={this.props.barcounts[Object.keys(this.props.barcounts)[0]]} fontSize={11}/> :
                      null
                    }
                    <Typography variant="caption">
                      Bar Chart
                    </Typography>
                  </div>
                )}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} className={this.props.classes.stretched}>
          </Grid>
          <Grid item xs={12} className={this.props.classes.stretched}>
            <CountsDiv {...this.props}/>
          </Grid>
          <Grid item xs={12} className={this.props.classes.stretched}>
            <Grid container
              spacing={24}
              alignItems={'center'}>
              <Grid item xs={12}>
                <div className={this.props.classes.centered}>
                  <span className={this.props.classes.vertical20}>{this.props.ui_content.content.text_3 || 'Examine metadata:'}</span>
                  <Selections
                    value={this.props.selected_field}
                    values={Object.keys(this.props.pie_fields_and_stats).sort()}
                    onChange={(e) => this.props.handleSelectField(e)}
                  />
                </div>
              </Grid>
              <Grid item xs={12} sm={6}>
                <div className={this.props.classes.centered}>
                  <ChartCard cardheight={300} pie_stats={this.props.pie_stats} color={'Blue'}/>
                  <Typography variant="caption">
                    Signatures per {this.props.selected_field.replace(/_/g, ' ')}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={12} sm={6}>
                <div className={this.props.classes.centered}>
                  <WordCloud classes={this.props.classes} stats={this.props.pie_stats}/>
                  <Typography variant="caption">
                    Top {this.props.selected_field.replace(/_/g, ' ')} terms
                  </Typography>
                </div>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <BottomLinks handleChange={this.handleChange}
              {...this.props} />
          </Grid>
          <Grid item xs={12}>
          </Grid>
        </Grid>
      </div>
    )
  }
})
