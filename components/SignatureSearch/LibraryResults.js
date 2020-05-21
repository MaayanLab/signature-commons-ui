import React from 'react'
import M from 'materialize-css'
import MUIDataTable from 'mui-datatables'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import ShowMeta from '../../components/ShowMeta'
import Grid from '@material-ui/core/Grid'
import { findMatchedSchema } from '../../util/objectMatch'
import { makeTemplate } from '../../util/makeTemplate'
import { RunningSum, dataFromResults } from '@dcic/signature-commons-ui-components-running-sum'
import { fetch_data } from '../../util/fetch/data'
import Lazy from '../Lazy'
import { createMuiTheme } from '@material-ui/core'
import { buildHead, buildBody } from './mui-datatables-utils'
import { get_card_data } from '../MetadataSearch/MetadataSearchResults'
import DataTable from '../MetadataSearch/DataTable'
import CircularProgress from '@material-ui/core/CircularProgress'

const one_tailed_columns = [
  'P-Value',
  'Odds Ratio',
  'Set Size',
]
const two_tailed_columns = [
  'P-Up',
  'P-Down',
  'Z-Up',
  'Z-Down',
  'Log(p) Fisher',
  'Log(p) Average',
  'Direction',
]

const theme = createMuiTheme({
  overrides: {
    MUIDataTable: {
      responsiveScroll: {
        maxHeight: '500px',
        minHeight: '500px',
      },
    },
    MUIDataTableHeadCell: {
      root: {
        fontSize: 13,
      },
    },
  },
})
// Weird hack to remove table shadows
theme.shadows[4] = theme.shadows[0]

export const rank_data_results = async ({ up, down, signature, database }) => {
  const { response } = await fetch_data({
    endpoint: '/fetch/rank',
    body: {
      entities: [],
      signatures: [signature],
      database,
    },
  })
  return dataFromResults({
    input: {
      up,
      down,
    },
    output: {
      entities: response.entities,
      ranks: response.signatures[0].ranks,
    },
  })
}

export default class LibraryResults extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = {
      sorted_results: null,
    }
  }
  
  check_column = ({ schema, prop, item }) => {
    if (schema.properties[prop].text === undefined) {
      return false
    } else if (schema.properties[prop].visibility === 0) {
      return false
    } else if (makeTemplate(schema.properties[prop].text, item) !== 'undefined') {
      return true
      // const sig_keys = this.props.signature_keys[lib]

      // if (schema.properties[prop].columnType === 'number') {
      //   return true
      // } else if (schema.properties[prop].columnType === 'meta') {
      //   if
      // }
    }
    return false
  }

  render_table = ({ result }) => {
    const sigs = result.signatures
    const schema = findMatchedSchema(sigs[0], this.props.schemas)
    const sorted_props = Object.entries(schema.properties).sort((a, b) => a[1].priority - b[1].priority)
    const cols = sorted_props.filter(
        ([prop, val]) => {
          if (this.check_column({ schema, prop, item: sigs[0] })) {
            if (this.props.match.params.type === 'Overlap') {
              if (two_tailed_columns.indexOf(prop) === -1) {
                return true
              }
            } else if (this.props.match.params.type === 'Rank') {
              if (one_tailed_columns.indexOf(prop) === -1) {
                return true
              }
            }
          }
          return false
        }
    ).map((entry) => entry[0])
    const downloadOptions = {
      filename: 'tableDownload.tsv',
      separator: '\t',
    }
    const options = {
      filter: true,
      filterType: 'dropdown',
      responsive: 'scrollMaxHeight',
      selectableRows: 'none',
      selectableRowsOnClick: false,
      expandableRows: true,
      downloadOptions,
      textLabels: {
        toolbar: {
          downloadCsv: 'Download TSV',
        }
      },
      onDownload: (buildHead_, buildBody_, columns, all_data) => {
        const new_columns = [...columns, { label: 'Meta', name: 'Meta', download: true }]
        const new_data = all_data.map(({ index, data }) => ({
          index,
          data: [...data, JSON.stringify({
            '@id': sigs[index].id,
            '@type': 'Signature',
            'meta': sigs[index].meta,
            'library': {
              '@id': sigs[index].library.id,
              '@type': 'Library',
              'meta': sigs[index].library.meta,
            },
          })],
        }))
        const CSVHead = buildHead(new_columns, { downloadOptions } )
        const CSVBody = buildBody(new_data, new_columns, { downloadOptions } )
        return `${CSVHead}${CSVBody}`.trim()
      },
      renderExpandableRow: (rowData, rowMeta) => (
        <TableRow>
          <TableCell colSpan={rowData.length}
            style={{
              overflowWrap: 'break-word',
              wordWrap: 'break-word',
            }}
          >
            {(this.props.input.up_entities !== undefined) ? (
              <Lazy>{
                async () => (
                  <RunningSum
                    data={await rank_data_results({
                      up: this.props.input.up_entities.map((ent) => ent.id),
                      down: this.props.input.down_entities.map((ent) => ent.id),
                      signature: sigs[rowMeta.dataIndex].id,
                      database: sigs[rowMeta.dataIndex].library.dataset,
                    })}
                  />
                )
              }</Lazy>
            ) : null}
            <ShowMeta
              value={[
                {
                  '@id': sigs[rowMeta.dataIndex].id,
                  '@type': 'Signature',
                  'meta': sigs[rowMeta.dataIndex].meta,
                },
                {
                  '@id': sigs[rowMeta.dataIndex].library.id,
                  '@type': 'Library',
                  'meta': sigs[rowMeta.dataIndex].library.meta,
                },
              ]}
            />
          </TableCell>
        </TableRow>
      ),
    }

    const columns = cols.map((col) => {
      const opts = {
        name: col,
        options: schema.properties[col].columnOptions || {},
      }

      if (schema.properties[col].columnType === 'number') {
        opts.options.customBodyRender = (val, tableMeta, updateValue) => {
          if (typeof val === 'number') {
            return val.toPrecision(3)
          } else {
            return val
          }
        }
      }
      return opts
    })

    const data = sigs.map((sig) =>
      cols.map((col) => {
        let val = undefined
        if (schema.properties[col].type == 'object') {
          val = makeTemplate(schema.properties[col].text, sig, schema.properties[col].subfield)
        } else {
          val = makeTemplate(schema.properties[col].text, sig)
        }
        if (val === 'undefined') {
          return ''
        }
        try {
          const val_parsed = JSON.parse(val)
          if (val_parsed === null) {
            return NaN
          } else {
            return val_parsed
          }
        } catch (e) {
          return val
        }
      })
    )
    return (
      <MUIDataTable
        options={options}
        columns={columns}
        data={data}
      />
    )
  }

  componentDidMount = () => {
    const sorted_results = [...this.props.results].sort((a, b) => b.signatures.length - a.signatures.length)
                            .map(r=>{
                              const data = get_card_data(r.library,this.props.schemas)
                              return {
                                ...data,
                                signatures: r.signatures,
                              }
                            })
    this.setState({
      sorted_results
    })
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.location.pathname !== this.props.location.pathname){
      const sorted_results = [...this.props.results].sort((a, b) => b.signatures.length - a.signatures.length)
                            .map(r=>{
                              const data = get_card_data(r.library,this.props.schemas)
                              return {
                                ...data,
                                signatures: r.signatures,
                              }
                            })
      this.setState({
        sorted_results
      })
    }
  }

  render() {
    if (this.state.sorted_results === null) {
      return <CircularProgress />
    }
    return (
      <div>
        <Grid container spacing={32} style={{marginBottom:10}}>
          <Grid item xs={12}>
            <DataTable schemas={this.props.schemas}
              ui_values={this.props.ui_values}
              collection={this.state.sorted_results}
              loaded={true}
              current_table={"libraries"}
              history={this.props.history}
              deactivate_download={true}
              expandRenderer={({data, ...props}) => this.render_table({ result: data })}
            />
          </Grid>
        </Grid>
      </div>
      // <div className="col s12">
      //   <ul
      //     className="collapsible popout"
      //     ref={(ref) => M.Collapsible.init(ref, {
      //       onOpenStart: () => window.dispatchEvent(new Event('resize')),
      //       onOpenEnd: () => window.dispatchEvent(new Event('resize')),
      //     })}
      //   >
      //     {sorted_results.map((result, ind) => (
      //       <li
      //         key={result.original.id}
      //         className={ind === 0 ? 'active' : ''}
      //       >
      //         <div
      //           className="page-header collapsible-header"
      //           style={{
      //             padding: 10,
      //             display: 'flex',
      //             flexDirection: 'row',
      //             backgroundColor: 'rgba(255,255,255,1)',
      //           }}
      //         >
      //           <style jsx>{`
      //             .counter {
      //               font-size: 75%;
      //               line-height: 2.2em;
      //               z-index: 100;
      //               color: white;
      //               border-radius: 50%;
      //               width: 25px;
      //               height: 25px;
      //               text-align: center;
      //               vertical-align: middle;
      //             }
      //           `}</style>
      //           <Label
      //             item={result.original}
      //             visibility={1}
      //             schemas={this.props.schemas}
      //           />
      //           <div style={{ flex: '1 0 auto' }}>&nbsp;</div>
      //           <div className="counter red lighten-1">
      //             {result.signatures.length}
      //           </div>
      //           <div
      //             style={{ border: 0, cursor: 'pointer' }}
      //           >
      //             <i className="material-icons">expand_more</i>
      //           </div>
      //         </div>
      //         <div
      //           className="collapsible-body"
      //         >
      //           <style jsx>{`
      //             .tab-content {
      //               height: 600px;
      //             }
      //           `}</style>
      //           <div
      //             style={{
      //               paddingTop: 0,
      //               marginTop: '-25px',
      //             }}
      //           >
      //             {/*
      //             <ul
      //               className="tabs"
      //               ref={(ref) => M.Tabs.init(ref, {
      //                 onShow: () => window.dispatchEvent(new Event('resize'))
      //               })}
      //             >
      //               <li className="tab col s3"><a className="active" href={"#bargraph-" + result.library.id }>Bar Graph</a></li>
      //               <li className="tab col s3"><a href={"#table-" + result.library.id }>Table</a></li>
      //             </ul>
      //             <div id={"bargraph-" + result.library.id } className="tab-content">
      //               {(() => {
      //                 let signatures = [...result.signatures].sort(
      //                   (a, b) => b.meta['p-value'] - a.meta['p-value']
      //                 ).slice(0, 10).map((signature, ind) => ({
      //                   y: ind,
      //                   text: signature.meta['Original_String'],
      //                   x: -Math.log10(signature.meta['p-value']),
      //                 }))
      //                 const data = [{
      //                   name: '-log(p-value)',
      //                   orientation: 'h',
      //                   type: 'bar',
      //                   textposition: 'auto',
      //                   align: 'left',
      //                   y: signatures.map((s) => s.y),
      //                   x: signatures.map((s) => s.x),
      //                   text: signatures.map((s) => s.text),
      //                 }]
      //                 return (
      //                   <Plot
      //                     layout={{
      //                       barmode: 'stack',
      //                       yaxis: {
      //                         ticktext: signatures.map((s) => s.x.toPrecision(3)),
      //                         tickvals: signatures.map((s) => s.y),
      //                       },
      //                     }}
      //                     config={{
      //                       displayModeBar: false
      //                     }}
      //                     useResizeHandler={true}
      //                     style={{width: '100%', height: '100%'}}
      //                     data={data}
      //                   />
      //                 )
      //               })()}
      //             </div>
      //             */}
      //             <div id={'table-' + result.original.id } className="tab-content">
      //               {this.render_table({ result })}
      //             </div>
      //           </div>
      //         </div>
      //       </li>
      //     ))}
      //   </ul>
      // </div>
    )
  }
}
