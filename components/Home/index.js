import { Set } from 'immutable'
import M from 'materialize-css'
import Base from '../../components/Base'
import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { call } from '../../util/call'
import Landing from '../Landing'
import MetadataSearch from '../MetadataSearch'
import Resources from '../Resources'
import SignatureSearch from '../SignatureSearch'
import Upload from '../Upload'


export default class Home extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      cart: Set(),
      pie_stats: null,
      selected_field: Object.keys(props.pie_fields_and_stats)[0],
      metadata_search: {
        controller: undefined,
        signatures_total_count: undefined,
        libraries_total_count: undefined,
        entities_total_count: undefined,
        search: '',
        currentSearch: '',
      },
    }
    this.updateCart = this.updateCart.bind(this)
    this.CartActions = this.CartActions.bind(this)
    this.handleSelectField = this.handleSelectField.bind(this)

    // metadata search
    this.searchChange = this.searchChange.bind(this)
    this.currentSearchChange = this.currentSearchChange.bind(this)
  }

  async componentDidMount() {
    M.AutoInit()
    // const elems = document.querySelectorAll('.sidenav');
    // const instances = M.Sidenav.init(elems, {edge:"right"});
    if (this.state.pie_stats === null) {
      this.fetch_stats(this.state.selected_field)
    }
    const signatures_table_stats = this.props.table_counts.filter((item) => item.table === "signatures")
    const libraries_table_stats = this.props.table_counts.filter((item) => item.table === "libraries")
    const entities_table_stats = this.props.table_counts.filter((item) => item.table === "entities")
    this.setState( prevState => ({
      metadata_search: {
        ...prevState.metadata_search,
        signatures_total_count: signatures_table_stats.length > 0 ? signatures_table_stats[0].counts : undefined,
        libraries_total_count: libraries_table_stats.length > 0 ? libraries_table_stats[0].counts : undefined,
        entities_total_count: entities_table_stats.length > 0 ? entities_table_stats[0].counts : undefined,
      }
    }))
  }

  componentDidUpdate() {
    M.AutoInit()
    M.updateTextFields()

  }

  searchChange(search) {
    this.setState( prevState => ({
      metadata_search: {
        ...prevState.metadata_search,
        search
      }
    }))
  }

  currentSearchChange(currentSearch) {
    this.setState( prevState => ({
      metadata_search: {
        ...prevState.metadata_search,
        currentSearch,
        search: currentSearch
      }
    }))
  }

  updateCart(cart) {
    this.setState({ cart })
  }

  CartActions() {
    return this.state.cart.count() <= 0 ? null : (
      <div className="fixed-action-btn">
        <a
          href="javascript:void(0);"
          className="btn-floating btn-large"
        >
          <i className="large material-icons">shopping_cart</i>
        </a>
        <span style={{
          position: 'absolute',
          top: '-0.1em',
          fontSize: '150%',
          left: '1.4em',
          zIndex: 1,
          color: 'white',
          backgroundColor: 'blue',
          borderRadius: '50%',
          width: '35px',
          height: '35px',
          textAlign: 'center',
          verticalAlign: 'middle',
        }}>
          {this.state.cart.count()}
        </span>
        <ul>
          <li>
            <a
              href="javascript:void(0);"
              className="btn-floating red"
              onClick={call(this.download, undefined)}
            >
              <i className="material-icons">file_download</i>
            </a>
          </li>
          <li>
            <a
              href="#SignatureSearch"
              className="btn-floating green"
            >
              <i className="material-icons">functions</i>
            </a>
          </li>
          <li>
            <a
              href="javascript:void(0);"
              className="btn-floating grey"
              onClick={call(alert, 'Comming soon')}
            >
              <i className="material-icons">send</i>
            </a>
          </li>
        </ul>
      </div>
    )
  }

  async fetch_stats(selected_field) {
    this.setState({
      pie_stats: this.props.pie_fields_and_stats[selected_field] || {},
    })
  }

  handleSelectField(e) {
    const field = e.target.value
    this.setState({
      selected_field: field,
      pie_stats: null,
    }, () => {
      this.fetch_stats(this.state.selected_field)
    })
  }

  signature_search = (props) => (
    <SignatureSearch
      cart={this.state.cart}
      updateCart={this.updateCart}
      signature_keys={this.props.signature_keys}
      libraries={this.props.libraries}
      resources={this.props.resources}
      library_resource={this.props.library_resource}
      ui_values={this.props.ui_values}
      schemas={this.props.schemas}
      {...props}
    />
  )

  metadata_search = (props) => (
    <MetadataSearch
      cart={this.state.cart}
      updateCart={this.updateCart}
      ui_values={this.props.ui_values}
      schemas={this.props.schemas}
      searchChange={this.searchChange}
      currentSearchChange={this.currentSearchChange}
      {...props}
      {...this.state.metadata_search}
    />
  )

  resources = (props) => (
    <Resources
      cart={this.state.cart}
      updateCart={this.updateCart}
      libraries={this.props.libraries}
      resources={this.props.resources}
      library_resource={this.props.library_resource}
      ui_values={this.props.ui_values}
      schemas={this.props.schemas}
      {...props}
    />
  )

  upload = (props) => (
    <Upload
      cart={this.state.cart}
      updateCart={this.updateCart}
      {...props}
    />
  )

  render() {
    const CartActions = this.CartActions

    return (
      <Base ui_values={this.props.ui_values}>
        <style jsx>{`
        #Home {
          background-image: url('${process.env.PREFIX}/static/images/arrowbackground.png');
          background-attachment: fixed;
          background-repeat: no-repeat;
          background-position: left bottom;
        }
        `}</style>
        <CartActions />
        <Switch>
          <Route
            exact path="/"
            render={(router_props) => <Landing handleSelectField={this.handleSelectField}
            searchChange={this.searchChange}
            currentSearchChange={this.currentSearchChange}
            {...this.state}
            {...this.props}
            {...router_props}/>}
          />
          {this.props.ui_values.nav.signature_search ?
            <Route
              path="/SignatureSearch"
              component={this.signature_search}
            /> : null
          }
          {this.props.ui_values.nav.metadata_search ?
            <Route
              path="/MetadataSearch"
              component={this.metadata_search}
            /> : null
          }
          {this.props.ui_values.nav.resources ?
            <Route
              path={`/${this.props.ui_values.preferred_name.resources || 'Resources'}`}
              component={this.resources}
            /> : null
          }
        </Switch>
      </Base>
    )
  }
}
