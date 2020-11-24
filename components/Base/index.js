import React from 'react'
import Head from 'next/head'
import Header from './Header'
import Footer from './Footer'
import { withStyles } from '@material-ui/core/styles'
import { initGA, logPageView } from '../../util/analytics'
import { styles } from '../../styles/jss/theme.js'
import { connect } from 'react-redux'
import { makeTemplate } from '../../util/makeTemplate'

const mapStateToProps = (state, ownProps) => {
  return {
    ui_values: state.ui_values,
    theme: state.theme,
  }
}
export default connect(mapStateToProps)(withStyles(styles)(class Base extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      M: undefined,
    }
  }

  async componentDidMount() {
    if (!window.GA_INITIALIZED) {
      initGA()
      window.GA_INITIALIZED = true
    }
    logPageView()

    const M = await import('materialize-css')
    this.setState({ M }, () => this.state.M.AutoInit())
  }

  componentDidUpdate() {
    if (this.state.M !== undefined) {
      this.state.M.AutoInit()
      this.state.M.updateTextFields()
    }
  }

  render() {
    const { classes, theme } = this.props
    return (
      <div className="root">
        <Head>
          <meta charSet="utf-8" />
          <title>{this.props.ui_values.favicon.title}</title>
          <link rel="shortcut icon" alt={this.props.ui_values.favicon.alt} href={makeTemplate(this.props.ui_values.favicon.src, {})} />
          <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
          {this.props.ui_values.font_families.map((family, ind) => (
            <link href={family} key={ind} rel="stylesheet" type="text/css"/>
          ))}
          <link href="https://cdn.materialdesignicons.com/4.8.95/css/materialdesignicons.min.css" rel="stylesheet" />
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
          <script async defer src="https://buttons.github.io/buttons.js"></script>
        </Head>
        <Header location={this.props.location}/>
        <main style={{ backgroundColor: theme.palette.background.main }} {...this.props.ui_values.background_props}>
          <div className={classes.container}>
            {this.props.children}
          </div>
        </main>
        <Footer/>
      </div>
    )
  }
}))
