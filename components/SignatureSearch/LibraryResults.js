import React from 'react'
import M from "materialize-css"
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core'
import MUIDataTable from "mui-datatables"
import TableCell from "@material-ui/core/TableCell"
import TableRow from "@material-ui/core/TableRow"
import ShowMeta from '../../components/ShowMeta'
import { Label, objectMatch, schemas } from '../../components/Label'
import { makeTemplate } from '../../util/makeTemplate'

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
    MuiCheckbox: {
      root: {
        display: 'none'
      }
    }
  }
})

export default class extends React.Component {
  render() {
    return (
      <div className="col s12">
        <ul
          className="collapsible popout"
          ref={(ref) => M.Collapsible.init(ref, {
            onOpenStart: () => window.dispatchEvent(new Event('resize')),
            onOpenEnd: () => window.dispatchEvent(new Event('resize')),
          })}
        >
          {this.props.results.map((result) => (
            <li
              key={result.library.id}
            >
              <div
                className="page-header collapsible-header"
                style={{
                  padding: 10,
                  display: 'flex',
                  flexDirection: 'row',
                  backgroundColor: 'rgba(255,255,255,1)',
                }}
              >
                <Label
                  item={result.library}
                  visibility={1}
                />
                <div style={{ flex: '1 0 auto' }}>&nbsp;</div>
                <a
                  href="javascript:void(0);"
                  style={{ border: 0 }}
                >
                  <i className="material-icons">expand_more</i>
                </a>
              </div>
              <div
                className="collapsible-body"
              >
                <style jsx>{`
                  .tab-content {
                    height: 600px;
                  }
                `}</style>
                <div 
                  style={{
                    paddingTop: 0,
                    marginTop: '-25px',
                  }}
                >
                {/*
                  <ul
                    className="tabs"
                    ref={(ref) => M.Tabs.init(ref, {
                      onShow: () => window.dispatchEvent(new Event('resize'))
                    })}
                  >
                    <li className="tab col s3"><a className="active" href={"#bargraph-" + result.library.id }>Bar Graph</a></li>
                    <li className="tab col s3"><a href={"#table-" + result.library.id }>Table</a></li>
                  </ul>
                  <div id={"bargraph-" + result.library.id } className="tab-content">
                    {(() => {
                      let signatures = [...result.signatures].sort(
                        (a, b) => b.meta['p-value'] - a.meta['p-value']
                      ).slice(0, 10).map((signature, ind) => ({
                        y: ind,
                        text: signature.meta['Original_String'],
                        x: -Math.log10(signature.meta['p-value']),
                      }))
                      const data = [{
                        name: '-log(p-value)',
                        orientation: 'h',
                        type: 'bar',
                        textposition: 'auto',
                        align: 'left',
                        y: signatures.map((s) => s.y),
                        x: signatures.map((s) => s.x),
                        text: signatures.map((s) => s.text),
                      }]
                      return (
                        <Plot
                          layout={{
                            barmode: 'stack',
                            yaxis: {
                              ticktext: signatures.map((s) => s.x.toPrecision(3)),
                              tickvals: signatures.map((s) => s.y),
                            },
                          }}
                          config={{
                            displayModeBar: false
                          }}
                          useResizeHandler={true}
                          style={{width: '100%', height: '100%'}}
                          data={data}
                        />
                      )
                    })()}
                  </div>
                  */}
                  <div id={"table-" + result.library.id } className="tab-content">
                    {(() => {
                      const sigs = result.signatures
                      const schema = schemas.filter(
                        (schema) => objectMatch(schema.match, sigs[0])
                      )[0]
                      const cols = Object.keys(schema.properties).filter(
                        (prop) => {
                          if(schema.properties[prop].type === 'text') {
                            if(this.props.match.params.type === 'Overlap') {
                              if(one_tailed_columns.indexOf(prop) === -1)
                                return true
                            } else if(this.props.match.params.type === 'Rank') {
                              if(two_tailed_columns.indexOf(prop) === -1)
                                return true
                            }
                          }
                          return false
                        }
                      )
                      
                      return (
                        <MuiThemeProvider theme={theme}>
                          <MUIDataTable
                            options={{
                              elevation: 0,
                              responsive: 'scroll',
                              selectableRows: true,
                              expandableRows: true,
                              renderExpandableRow: (rowData, rowMeta) => (
                                <TableRow>
                                  <TableCell colSpan={rowData.length}>
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
                                        }
                                      ]}
                                    />
                                  </TableCell>
                                </TableRow>
                              )
                            }}
                            columns={cols.map((col) => {
                              let opts = {
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
                            })}
                            data={sigs.map((sig) =>
                              cols.map((col) => {
                                const val = makeTemplate(schema.properties[col].text, sig)
                                if (val === 'undefined')
                                  return ''
                                try {
                                  return JSON.parse(val)
                                } catch(e) {
                                  return val
                                }
                              })
                            )}
                          />
                        </MuiThemeProvider>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  }
}