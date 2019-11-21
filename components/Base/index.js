import React from 'react'
import Head from 'next/head'
import Header from './Header'
import Footer from './Footer'
import { withStyles } from '@material-ui/core/styles'
import { initGA, logPageView } from '../../util/analytics'
import { styles } from '../../styles/jss/theme.js'

export default withStyles(styles)(class Base extends React.PureComponent {
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
    const { classes } = this.props
    return (
      <div className="root">
        <Head>
          <meta charSet="utf-8" />
          <link rel="shortcut icon" href={`${process.env.PREFIX}${this.props.ui_values.favicon.icon}`} />
          <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
          <link href="https://cdn.materialdesignicons.com/3.6.95/css/materialdesignicons.min.css" rel="stylesheet" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500"></link>
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
          <script async defer src="https://buttons.github.io/buttons.js"></script>
        </Head>
        <Header location={this.props.location}/>
        <main>
          <div className={classes.container}>
            {this.props.children}
          </div>
        </main>
        <Footer {...this.props}/>
      </div>
    )
  }
})
{/* <link href="https://fonts.googleapis.com/css?family=Lato:100,300,400,700,900" rel="stylesheet" type="text/css">
<link href="https://fonts.googleapis.com/css?family=Archivo+Narrow" rel="stylesheet" type="text/css"></link> */}