import React from 'react'
import Head from 'next/head'
import Header from './Header'
import Footer from './Footer'
import { withStyles } from '@material-ui/core/styles'
import { initGA, logPageView } from '../../util/analytics'
import { styles } from '../../styles/jss/theme.js'
import { makeTemplate } from '../../util/ui/makeTemplate'
import Container from '@material-ui/core/Container'

export default withStyles(styles)(class Base extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      ga_code: undefined,
    }
  }

  async componentDidMount() {
    if (!window.GA_INITIALIZED) {
      const ga_code = await initGA()
      if (ga_code) this.setState({ga_code})
      window.GA_INITIALIZED = true
    }
    logPageView(this.props.location.pathname, this.state.ga_code)

    // const M = await import('materialize-css')
    // this.setState({ M }, () => this.state.M.AutoInit())
  }

  componentDidUpdate(prevProps) {
    // if (this.state.M !== undefined) {
    //   this.state.M.AutoInit()
    //   this.state.M.updateTextFields()
    // }
    if (prevProps.location.pathname !== this.props.location.pathname){
      logPageView(this.props.location.pathname, this.state.ga_code)
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
          <link href="https://cdn.jsdelivr.net/npm/@mdi/font@5.9.55/css/materialdesignicons.min.css" rel="stylesheet" />
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
          <script async defer src="https://buttons.github.io/buttons.js"></script>
          {this.state.ga_code===undefined && process.env.NODE_ENV === "development"?null:
            <React.Fragment>
              <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${this.state.ga_code}`}
              />
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${this.state.ga_code}', {
                    page_path: window.location.pathname,
                  });
              `
                }}
              />
            </React.Fragment>
          }
        </Head>
        <Header 
          location={this.props.location}
          ui_values={this.props.ui_values}
        />
        <main style={{ backgroundColor: theme.palette.background.main }} {...this.props.ui_values.background_props}>
          <Container>
            {this.props.children}
          </Container>
        </main>
        <Footer 
          ui_values={this.props.ui_values}  
          theme={this.props.theme}
        />
      </div>
    )
  }
})
