import React from 'react'
import MUIDataTable from 'mui-datatables'
import { fetch_meta, fetch_meta_post } from '../../util/fetch/meta'
import Label from '../Label';
import NProgress from 'nprogress'
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import ShowMeta from '../ShowMeta';
import { get_library_resources } from '../Resources/resources';

function build_where(q) {
  if (q.indexOf(':') !== -1) {
    const [key, ...value] = q.split(':')
    return {
      ['meta.' + key]: {
        ilike: '%' + value.join(':') + '%'
      }
    }
  } else {
    return {
      meta: {
        fullTextSearch: q
      }
    }
  }
}

function get_deep(D, k) {
  const K = k.split('.')
  let d = D
  const undef = false
  for (const k of K) {
    d = d[k]
    if (d === undefined)
      return undefined
  }
  return d
}

function serialize(obj) {
  if (obj === undefined || obj === null)
    return ''

  if (typeof obj === 'object')
    return JSON.stringify(obj)
  else
    return obj
}

export default class extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      searchText: '',
      page: 0,
      rowsPerPage: 10,
      data: [],
      columns: [{
        name: 'Label',
        options: {
          filter: false,
          sort: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <div style={{ whiteSpace: 'nowrap' }}>
                <Label
                  item={this.state.data[value]}
                  highlight={this.state.searchText || ''}
                  visibility={1}
                />
              </div>
            )
          }
        }
      },
        'Library_name',
        'Original_String',
        'Assay',
        'Organism',
        'p-value',
        'oddsratio',
        'setsize',
      ],
      order: {},
    }
  }

  async componentDidMount() {
    NProgress.start()
    // await this.updateCols()
    this.setState({ ...(await get_library_resources()) })
    await this.update()
  }

  updateCols = async () => {
    let controller = this.state.controller
    if (controller !== undefined)
      controller.abort()
    controller = new AbortController()
    await new Promise((resolve, reject) => this.setState({ controller }, () => resolve()))
    try {
      const { response: columns } = await fetch_meta('/signatures/key_count', {}, controller.signal)
      this.setState({ columns: [...this.state.columns, ...Object.keys(columns)], controller: undefined })
    } catch (e) {
      if(e.code !== DOMException.ABORT_ERR)
        throw e
    }
  }

  get_table_ref = (table_ref) => {
    if (table_ref)
      this.setState({ table_ref })
  }

  update = async () => {
    if (!NProgress.isStarted()) NProgress.start()
    let controller = this.state.controller
    if (controller !== undefined)
      controller.abort()
    controller = new AbortController()
    await new Promise((resolve, reject) => this.setState({ controller }, () => resolve()))
    try {
      const filter = {
        offset: this.state.page * this.state.rowsPerPage,
        limit: this.state.rowsPerPage,
      }

      const search = this.state.searchText || ''
      if (search !== '')
        filter.where = build_where(this.state.searchText || '')

      const order = Object.keys(this.state.order).map((field) => `meta.${field} ${this.state.order[field]}`)
      if (order.length > 0)
        filter.order = order

      const { contentRange: contentRange,  response: data } = await fetch_meta_post('/signatures/find', {
        filter
      }, controller.signal)

      for (const signature of data)
        signature.library = this.state.libraries[signature.library]

      this.setState({
        data,
        controller: undefined,
        count: contentRange.count
      }, () => NProgress.done())
    } catch (e) {
      if(e.code !== DOMException.ABORT_ERR) {
        console.error(e)
      }
    }
  }

  render() {
    const options = {
      filter: true,
      filterType: 'multiselect',
      responsive: 'scroll',
      download: false,
      print: false,
      serverSide: true,
      searchText: this.state.searchText,
      count: this.state.count,
      page: this.state.page,
      rowsPerPage: this.state.rowsPerPage,
      selectableRows: false,
      expandableRows: true,
      renderExpandableRow: (rowData, rowMeta) => {
        const signature = this.state.data[rowMeta.dataIndex]
        return (
          <TableRow>
            <TableCell colSpan={rowData.length+1}>
              <ShowMeta
                value={[
                  {
                    '@id': signature.id,
                    '@type': 'Signature',
                    'meta': signature.meta,
                  },
                  // {
                  //   '@id': signature.library.id,
                  //   '@type': 'Library',
                  //   'meta': signature.library.meta,
                  // }
                ]}
                highlight={this.state.searchText || ''}
              />
            </TableCell>
          </TableRow>
        );
      },
      onTableChange: (action, tableState) => {
        this.setState({ 
          rowsPerPage: tableState.rowsPerPage,
          page: tableState.page,
          searchText: tableState.searchText,
        }, () => this.update())
      },
      onColumnSortChange: (changedColumn, direction) => {
        this.setState({
          order: {[changedColumn]: direction === 'descending' ? 'desc' : 'asc'},
        }, () => this.update())
      }
    }
    const columns = this.state.columns
    const data = this.state.data.map((datum, ind) => [ind, ...columns.slice(1).map((c) => serialize(get_deep(datum.meta, c)))])
    return (
      <MUIDataTable
        ref={this.get_table_ref}
        data={data}
        columns={columns}
        options={options}
      />
    )
  }
}