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
import NProgress from 'nprogress'
import { fetch_meta_post } from '../../util/fetch/meta'
import { animateScroll as scroll } from 'react-scroll'
import { resolve_entities } from '../SignatureSearch/resolve'
import { query_overlap, query_rank } from '../SignatureSearch/query'
import uuid5 from 'uuid5'


function build_where(q) {
  if (q.indexOf(':') !== -1) {
    const [key, ...value] = q.split(':')
    return {
      ['meta.' + key]: {
        ilike: '%' + value.join(':') + '%',
      },
    }
  } else {
    return {
      meta: {
        fullTextSearch: q,
      },
    }
  }
}

function parse_entities(input) {
  return Set(input.toUpperCase().split(/[ \t\r\n;]+/).reduce(
      (lines, line) => {
        const parsed = /^(.+?)(,(.+))?$/.exec(line)
        if (parsed !== null) {
          return [...lines, parsed[1]]
        }
        return lines
      }, []
  ))
}

export default class Home extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      cart: Set(),
      pie_stats: null,
      selected_field: Object.keys(props.pie_fields_and_stats)[0],
      searchType: props.ui_values.nav.metadata_search ?'metadata': "signature",
      metadata_search: {
        controller: undefined,
        signatures_total_count: undefined,
        libraries_total_count: undefined,
        entities_total_count: undefined,
        search: '',
        currentSearch: '',
        completed_search: 0,
        search_status: '',
      },
      signature_search: {
        input: {
          type: "Overlap",
          geneset: "",
        },
        controller: null,
      }
    }
    this.updateCart = this.updateCart.bind(this)
    this.CartActions = this.CartActions.bind(this)
    this.handleSelectField = this.handleSelectField.bind(this)
    this.handleChange = this.handleChange.bind(this)

    // metadata search
    this.searchChange = this.searchChange.bind(this)
    this.currentSearchChange = this.currentSearchChange.bind(this)
    this.performSearch = this.performSearch.bind(this)
    this.resetMetadataSearchStatus = this.resetMetadataSearchStatus.bind(this)
    this.resetCurrentSearch = this.resetCurrentSearch.bind(this)

    // signature search
    this.changeSignatureType = this.changeSignatureType.bind(this)
    this.updateSignatureInput = this.updateSignatureInput.bind(this)
  }

  async componentDidMount() {
    M.AutoInit()
    // const elems = document.querySelectorAll('.sidenav');
    // const instances = M.Sidenav.init(elems, {edge:"right"});
    if (this.state.pie_stats === null) {
      this.fetch_stats(this.state.selected_field)
    }
    const signatures_table_stats = this.props.table_counts.filter((item) => item.table === 'signatures')
    const libraries_table_stats = this.props.table_counts.filter((item) => item.table === 'libraries')
    const entities_table_stats = this.props.table_counts.filter((item) => item.table === 'entities')
    this.setState((prevState) => ({
      metadata_search: {
        ...prevState.metadata_search,
        signatures_total_count: signatures_table_stats.length > 0 ? signatures_table_stats[0].counts : undefined,
        libraries_total_count: libraries_table_stats.length > 0 ? libraries_table_stats[0].counts : undefined,
        entities_total_count: entities_table_stats.length > 0 ? entities_table_stats[0].counts : undefined,
      },
    }))
  }

  componentDidUpdate() {
    M.AutoInit()
    M.updateTextFields()
    if (this.state.metadata_search.search_status === 'Initializing') {
      NProgress.start()
    } else if (this.state.metadata_search.completed_search === 3) {
      NProgress.done()
    }
  }

  handleChange(event, searchType, scrolling = false) {
    console.log(searchType)
    if (searchType) {
      this.setState({ searchType }, () => {
        if (scrolling) {
          scroll.scrollToTop()
        }
      })
    }
  }

  changeSignatureType(type, input_data={}){
    const input = {
      type
    }
    if (type === 'Overlap') {
      input.geneset = input_data.geneset || ''
    } else if (type === 'Rank') {
      input.up_geneset = input_data.up_geneset || ''
      input.down_geneset = input_data.down_geneset || ''
    }
    this.setState((prevState) => ({
      signature_search: {
        ...prevState.signature_search,
        input,
      },
    }))
  }

  updateSignatureInput(input){
    this.setState((prevState) => ({
      signature_search: {
        ...prevState.signature_search,
        input,
      },
    }))
  }

  submit = (input) => {
    NProgress.start()
    // TODO: register signature with metadata ap`i`
    // libraries={this.props.libraries}
    //   resources={this.props.resources}
    //   library_resource={this.props.library_resource}
    const {libraries, resources, library_resource} = this.props
    const props = {libraries, resources, library_resource}

    let controller = this.state.signature_search.controller
    if (controller !== null) controller.abort()
    else controller = new AbortController()
    this.setState(() => ({
      signature_search:{
        ...this.state.signature_search,
        controller,
        input,
      }
    }), async () => {
      if (input.type === 'Overlap') {
        const unresolved_entities = parse_entities(input.geneset)
        const { matched: entities, mismatched } = await resolve_entities({ entities: unresolved_entities, controller })
        if (mismatched.count() > 0) {
          M.toast({
            html: `The entities: ${[...mismatched].join(', ')} were dropped because they could not be recognized`,
            classes: 'rounded',
            displayLength: 4000,
          })
        }

        const resolved_entities = [...(unresolved_entities.subtract(mismatched))].map((entity) => entities[entity])
        const signature_id = uuid5(JSON.stringify(resolved_entities))

        const results = await query_overlap({
          ...this.state.signature_search,
          ...props,
          input: {
            entities: resolved_entities,
          },
        })
        this.setState((prevState) => ({
          signature_search: {
            ...prevState.signature_search,
            ...results,
            mismatched
          },
        }), () => NProgress.done())
        this.props.history.push(`/SignatureSearch/${input.type}/${signature_id}`)
      } else if (input.type === 'Rank') {
        const unresolved_up_entities = parse_entities(input.up_geneset)
        const unresolved_down_entities = parse_entities(input.down_geneset)
        const unresolved_entities = unresolved_up_entities.union(unresolved_down_entities)
        const { matched: entities, mismatched } = await resolve_entities({ entities: unresolved_entities, controller })
        if (mismatched.count() > 0) {
          M.toast({
            html: `The entities: ${[...mismatched].join(', ')} were dropped because they could not be recognized`,
            classes: 'rounded',
            displayLength: 4000,
          })
        }

        const resolved_up_entities = [...unresolved_up_entities.subtract(mismatched)].map((entity) => entities[entity])
        const resolved_down_entities = [...unresolved_down_entities.subtract(mismatched)].map((entity) => entities[entity])
        const signature_id = uuid5(JSON.stringify([resolved_up_entities, resolved_down_entities]))
        const results = await query_rank({
          ...this.state.signature_search,
          ...props,
          input: {
            up_entities: resolved_up_entities,
            down_entities: resolved_down_entities,
          },
        })
        this.setState((prevState) => ({
          signature_search: {
            ...prevState.signature_search,
            ...results,
            mismatched
          },
        }), () => NProgress.done())
        this.props.history.push(`/SignatureSearch/${input.type}/${signature_id}`)
      }
    })
  }

  searchChange(search) {
    this.setState((prevState) => ({
      metadata_search: {
        ...prevState.metadata_search,
        search,
      },
    }))
  }

  currentSearchChange(currentSearch) {
    if (currentSearch !== '' && currentSearch !== this.state.metadata_search.currentSearch) {
      this.setState((prevState) => ({
        metadata_search: {
          ...prevState.metadata_search,
          currentSearch: currentSearch,
          search: currentSearch,
          completed_search: 0,
          search_status: 'Initializing',
        },
      }), () => {
        this.performSearch('signatures')
        this.performSearch('libraries')
        this.performSearch('entities')
      })
    }
  }

  resetCurrentSearch() {
    this.setState((prevState) => ({
      metadata_search: {
        ...prevState.metadata_search,
        currentSearch: '',
        search: '',
      },
    }))
  }

  resetMetadataSearchStatus() {
    this.setState((prevState) => ({
      metadata_search: {
        ...prevState.metadata_search,
        completed_search: 0,
        search_status: '',
      },
    }))
  }

  async performSearch(table, page = 0, rowsPerPage = 10, paginating = false) {
    if (this.state.metadata_search[`${table}_controller`] !== undefined) {
      this.state.metadata_search[`${table}_controller`].abort()
    }
    try {
      const controller = new AbortController()
      this.setState((prevState) => ({
        metadata_search: {
          ...prevState.metadata_search,
          [`${table}_status`]: 'Searching...',
          [`${table}_controller`]: controller,
        },
      }))
      const where = build_where(this.state.metadata_search.currentSearch)

      const start = Date.now()
      const limit = rowsPerPage
      const skip = rowsPerPage * page

      const { duration: duration_meta_1, contentRange, response: results } = await fetch_meta_post({
        endpoint: `/${table}/find`,
        body: {
          filter: {
            where,
            limit: limit,
            skip: skip,
          },
        },
        signal: controller.signal,
      })

      let duration_meta = duration_meta_1
      if (table === 'signatures') {
        const library_ids = [...new Set(results.map((sig) => sig.library))]
        const { duration: duration_meta_2, response: libraries } = await fetch_meta_post({
          endpoint: '/libraries/find',
          body: {
            filter: {
              where: {
                id: {
                  inq: library_ids,
                },
              },
            },
          },
          signal: controller.signal,
        })
        duration_meta = duration_meta_1 + duration_meta_2
        const library_dict = libraries.reduce((L, l) => ({ ...L, [l.id]: l }), {})
        for (const r of results) {
          const lib_meta = { 'id': library_dict[r.library].id,
            'dataset': library_dict[r.library].dataset,
            'meta': {
              [this.props.ui_values.library_name]: library_dict[r.library].meta[this.props.ui_values.library_name],
              'Icon': library_dict[r.library].meta['Icon'],
            },
          }
          r.library = lib_meta
        }
      }
      const duration_label = table + '_duration'
      const duration_meta_label = table + '_duration_meta'
      const count_label = table + '_count'
      this.setState((prevState) => ({
        metadata_search: {
          ...prevState.metadata_search,
          [`${table}_status`]: '',
          [table]: results,
          [duration_label]: (Date.now() - start) / 1000,
          [duration_meta_label]: duration_meta,
          [count_label]: contentRange.count,
          search_status: results.length > 0 ? 'Matched' : prevState.metadata_search.search_status,
          completed_search: prevState.metadata_search.completed_search + 1, // If this reach 3 then we finished searching all 3 tables
        },
      }))
    } catch (e) {
      NProgress.done()
      if (e.code !== DOMException.ABORT_ERR) {
        this.setState((prevState) => ({
          metadata_search: {
            ...prevState.metadata_search,
            [`${table}_status`]: e + '',
          },
        }))
      }
    }
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
      pie_stats: this.props.pie_fields_and_stats[selected_field].stats || {},
      pie_table: this.props.pie_fields_and_stats[selected_field].table || '',
      pie_preferred_name: this.props.pie_fields_and_stats[selected_field].Preferred_Name || '',
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
      handleChange={this.handleChange}
      changeSignatureType={this.changeSignatureType}
      updateSignatureInput={this.updateSignatureInput}
      submit={this.submit}
      {...props}
      {...this.state.signature_search}
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
      performSearch={this.performSearch}
      resetMetadataSearchStatus={this.resetMetadataSearchStatus}
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

  api = (props) => (
    <SwaggerUI
      url={`${meta_url}/openapi.json`}
      deepLinking={true}
      displayOperationId={true}
      filter={true}
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
              handleChange={this.handleChange}
              searchChange={this.searchChange}
              currentSearchChange={this.currentSearchChange}
              resetCurrentSearch={this.resetCurrentSearch}
              changeSignatureType={this.changeSignatureType}
              updateSignatureInput={this.updateSignatureInput}
              submit={this.submit}
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
          <Route
            path="/API"
            component={this.api}
          />
        </Switch>
      </Base>
    )
  }
}
