import { createMuiTheme, MuiThemeProvider } from '@material-ui/core'
import TableCell from "@material-ui/core/TableCell"
import TableRow from "@material-ui/core/TableRow"
import { Map, Set } from 'immutable'
import M from "materialize-css"
import MUIDataTable from "mui-datatables"
import React from "react"
import IconButton from '../../components/IconButton'
import { Label, objectMatch, schemas } from '../../components/Label'
import { ShowMeta } from '../../components/ShowMeta'
import { fetch_data } from "../../util/fetch/data"
import { fetch_meta, fetch_meta_post } from "../../util/fetch/meta"
import { makeTemplate } from '../../util/makeTemplate'
import { maybe_fix_obj } from '../../util/maybe_fix_obj'
import { iconOf, primary_resources, primary_two_tailed_resources, renamed } from '../Resources'
import Style from 'style-it'
import Plot from 'react-plotly.js';

const example_geneset = 'UTP14A S100A6 SCAND1 RRP12 CIAPIN1 ADH5 MTERF3 SPR CHMP4A UFM1 VAT1 HACD3 RFC5 COTL1 NPRL2 TRIB3 PCCB TLE1 CD58 BACE2 KDM3A TARBP1 RNH1 CHAC1 MBNL2 VDAC1 TES OXA1L NOP56 HAT1 CPNE3 DNMT1 ARHGAP1 VPS28 EIF2S2 BAG3 CDCA4 NPDC1 RPS6KA1 FIS1 SYPL1 SARS CDC45 CANT1 HERPUD1 SORBS3 MRPS2 TOR1A TNIP1 SLC25A46 MAL EPCAM HDAC6 CAPN1 TNRC6B PKD1 RRS1 HP ANO10 CEP170B IDE DENND2D CAMK2B ZNF358 RPP38 MRPL19 NUCB2 GNAI1 LSR ADGRE2 PKMYT1 CDK5R1 ABL1 PILRB AXIN1 FBXL8 MCF2L DBNDD1 IGHMBP2 WIPF2 WFS1 OGFOD2 MAPK1IP1L COL11A1 REG3A SERPINA1 MYCBP2 PIGK TCAP CRADD ELK1 DNAJB2 ZBTB16 DAZAP1 MAPKAPK2 EDRF1 CRIP1 UCP3 AGR2 P4HA2'.split(' ').join('\n')
const example_geneset_weighted = 'SERPINA3,1.0 CFL1,-1.0 FTH1,0.5 GJA1,-0.5 HADHB,0.25 LDHB,-0.25 MT1X,0.4 RPL21,0.3 RPL34,0.2 RPL39,0.1 RPS15,-0.1 RPS24,-0.2 RPS27,-0.3 RPS29,-0.4 TMSB4XP8,-0.6 TTR,-0.7 TUBA1B,-0.8 ANP32B,-0.9 DDAH1,0.9 HNRNPA1P10,0.8'.split(' ').join('\n')
const example_geneset_up = 'UTP14A S100A6 SCAND1 RRP12 CIAPIN1 ADH5 MTERF3 SPR CHMP4A UFM1 VAT1 HACD3 RFC5 COTL1 NPRL2 TRIB3 PCCB TLE1 CD58 BACE2 KDM3A TARBP1 RNH1 CHAC1 MBNL2 VDAC1 TES OXA1L NOP56 HAT1 CPNE3 DNMT1 ARHGAP1 VPS28 EIF2S2 BAG3 CDCA4 NPDC1 RPS6KA1 FIS1 SYPL1 SARS CDC45 CANT1 HERPUD1 SORBS3 MRPS2 TOR1A TNIP1 SLC25A46'.split(' ').join('\n')
const example_geneset_down = 'MAL EPCAM HDAC6 CAPN1 TNRC6B PKD1 RRS1 HP ANO10 CEP170B IDE DENND2D CAMK2B ZNF358 RPP38 MRPL19 NUCB2 GNAI1 LSR ADGRE2 PKMYT1 CDK5R1 ABL1 PILRB AXIN1 FBXL8 MCF2L DBNDD1 IGHMBP2 WIPF2 WFS1 OGFOD2 MAPK1IP1L COL11A1 REG3A SERPINA1 MYCBP2 PIGK TCAP CRADD ELK1 DNAJB2 ZBTB16 DAZAP1 MAPKAPK2 EDRF1 CRIP1 UCP3 AGR2 P4HA2'.split(' ').join('\n')

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

export default class SignatureSearch extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      search: '',
      results: Map(),
      geneset: '',
      duration: 0,
      count: 0,
      duration_meta: 0,
      duration_data: 0,
      up_down: false,
      key_count: {},
      value_count: {},
      matched_entities: [],
      mismatched_entities: [],
      status: null,
      controller: null,
      library: null,
      resourceAnchor: null,
      resources: [],
      libraries: {},
      resource_filter: null,
    }

    this.submit = this.submit.bind(this)
    this.fetch_values = this.fetch_values.bind(this)
    this.render_libraries = this.render_libraries.bind(this)
    this.set_library = this.set_library.bind(this)
    this.count_results = this.count_results.bind(this)
  }

  async componentDidMount() {
    // M.AutoInit();

    const { response: libraries } = await fetch_meta_post('/libraries/find', {})
    const library_dict = libraries.reduce((L, l) => ({...L, [l.id]: l}), {})
    const resources = libraries.reduce((groups, lib) => {
      let resource = renamed[lib.meta['Primary Resource'] || lib.meta['name']] || lib.meta['Primary Resource'] || lib.meta['name']
      if ((lib.meta['Library name'] || '').indexOf('ARCHS4') !== -1)
        resource = 'ARCHS4'

      if (groups[resource] === undefined) {
        groups[resource] = {
          name: resource,
          icon: iconOf[resource] || lib.meta['Icon'],
          libraries: []
        }
      }
      groups[resource].libraries.push({...lib})
      return groups
    }, {})

    this.setState({
      libraries: library_dict,
      resources: Object.values(resources),
    })
  }

  componentDidUpdate() {
    // M.AutoInit();
    M.updateTextFields();
  }

  count_results() {
    this.setState({
      count: Object.keys(this.state.results).filter(
        (result) =>
          this.state.resource_filter === null
          || this.state.resource_filter.libraries.map(
              (lib) => lib.id
            ).indexOf(this.state.results[result].library.id) !== -1
      ).reduce((sum, lib) => sum + this.state.results[lib].signatures.length, 0)
    })
  }

  async submit() {
    if(this.state.controller !== null) {
      this.state.controller.abort()
    }


    if (this.state.up_down) {
      if (this.state.last_up_geneset === this.state.up_geneset && this.state.last_down_geneset === this.state.down_geneset) {
        this.count_results()
        return
      } else if (this.state.up_geneset === '' || this.state.down_geneset === '') {
        return
      }
    } else {
      if (this.state.last_geneset === this.state.geneset) {
        this.count_results()
        return
      } else if (this.state.geneset === '') {
        return
      }
    }

    try {
      const controller = new AbortController()
      this.setState({
        status: 'Fetching entities...',
        controller: controller,
      })

      let entities, up_entities, down_entities
      if (this.state.up_down) {
        up_entities = Set(this.state.up_geneset.toUpperCase().split(/[ \t\n;]+/).map((line) => /^(.+?)(,(.+))?$/.exec(line)[1])) // TODO: handle weights
        down_entities = Set(this.state.down_geneset.toUpperCase().split(/[ \t\n;]+/).map((line) => /^(.+?)(,(.+))?$/.exec(line)[1])) // TODO: handle weights
        entities = Set([...up_entities, ...down_entities])
      } else {
        entities = Set(this.state.geneset.toUpperCase().split(/[ \t\n;]+/).map((line) => /^(.+?)(,(.+))?$/.exec(line)[1])) // TODO: handle weights
      }
      let entity_ids = Set()
      let up_entity_ids = Set()
      let down_entity_ids = Set()

      const start = Date.now()

      const {duration: duration_meta_1, response: entity_meta_pre} = await fetch_meta_post('/entities/find', {
        filter: {
          where: {
            'meta.Name': {
              inq: entities.toArray(),
            }
          },
          fields: [
            'id',
            'meta.Name',
          ]
        }
      }, controller.signal)
      const entity_meta = maybe_fix_obj(entity_meta_pre)

      for(const entity of Object.values(entity_meta)) {
        if (this.state.up_down) {
          const matched_up_entities = up_entities.intersect(
            Set([entity.meta.Name])
          )
          if (matched_up_entities.count() > 0) {
            up_entities = up_entities.subtract(matched_up_entities)
            up_entity_ids = up_entity_ids.add(entity.id)
          }

          const matched_down_entities = down_entities.intersect(
            Set([entity.meta.Name])
          )
          if (matched_down_entities.count() > 0) {
            down_entities = down_entities.subtract(matched_down_entities)
            down_entity_ids = down_entity_ids.add(entity.id)
          }
        } else {
          const matched_entities = entities.intersect(
            Set([entity.meta.Name])
          )

          if (matched_entities.count() > 0) {
            entities = entities.subtract(matched_entities)
            entity_ids = entity_ids.add(entity.id)
          }
        }
      }

      console.log('matched:', this.state.up_down ? up_entity_ids.count() + down_entity_ids.count() : entity_ids.count())
      console.log('mismatched:', this.state.up_down ? up_entities.count() + down_entities.count() : entities.count())

      this.setState({
        status: 'Searching...',
        matched_entities: entity_ids,
        mismatched_entities: entities,
      })

      let duration_data = 0
      let enriched_results

      if (this.state.up_down) {
        enriched_results = (await Promise.all([
          fetch_data('/enrich/ranktwosided', {
            up_entities: up_entity_ids,
            down_entities: down_entity_ids,
            signatures: [],
            database: 'lincs',
          }, controller.signal),
          fetch_data('/enrich/ranktwosided', {
            up_entities: up_entity_ids,
            down_entities: down_entity_ids,
            signatures: [],
            database: 'lincsfwd',
          }, controller.signal),
        ])).reduce(
          (results, {duration: duration_data_n, response: result}) => {
            duration_data += duration_data_n
            return ({
              ...results,
              ...maybe_fix_obj(
                result.results.reduce(
                  (results, result) =>
                    result['p-up'] < 0.05 && result['p-down'] <= 0.05 ? [
                      ...results,
                      ({
                        ...result,
                        id: result.signature
                      }),
                    ] : results,
                  []
                ).sort(
                  (a, b) => (a['p-up'] - b['p-up']) + (a['p-down'] - b['p-down'])
                ).slice(0, 1000)
              ),
            })
          }, {}
        )
      } else {
        enriched_results = (await Promise.all([
          fetch_data('/enrich/overlap', {
            entities: entity_ids,
            signatures: [],
            database: 'enrichr',
          }, controller.signal),
          fetch_data('/enrich/overlap', {
            entities: entity_ids,
            signatures: [],
            database: 'creeds',
          }, controller.signal),
          fetch_data('/enrich/rank', {
            entities: entity_ids,
            signatures: [],
            database: 'lincs',
          }, controller.signal),
          fetch_data('/enrich/rank', {
            entities: entity_ids,
            signatures: [],
            database: 'lincsfwd',
          }, controller.signal),
        ])).reduce(
          (results, {duration: duration_data_n, response: result}) => {
            duration_data += duration_data_n
            return ({
              ...results,
              ...maybe_fix_obj(result.results),
            })
          }, {}
        )
      }

      this.setState({
        status: 'Resolving signatures...',
        controller: controller,
        count: Object.keys(enriched_results).length,
        duration_data: duration_data,
      })

      const {duration: duration_meta_2, response: enriched_signatures_meta} = await fetch_meta_post('/signatures/find', {
        filter: {
          where: {
            id: {
              inq: Object.values(enriched_results).map((k) => k.id)
            }
          }
        }
      }, controller.signal)

      this.setState({
        duration_meta: duration_meta_1 + duration_meta_2,
      })

      const enriched_signatures = enriched_signatures_meta.reduce(
        (full, signature) => ([
          ...full,
          {
            ...signature,
            meta: {
              ...signature.meta,
              ...{
                ...enriched_results[signature.id],
                ...(enriched_results[signature.id].overlap === undefined ? {} : {
                  overlap: enriched_results[signature.id].overlap.map((id) => ({
                    '@id': id,
                    '@type': 'Entity',
                    'meta': entity_meta[id].meta
                  })),
                }),
              },
            },
          }
        ]), []
      )

      const grouped_signatures = enriched_signatures.reduce(
        (groups, sig) => {
          if(groups[sig.library] === undefined) {
            groups[sig.library] = {
              library: this.state.libraries[sig.library],
              signatures: []
            }
          }
          groups[sig.library].signatures.push({...sig, library: groups[sig.library].library})
          return groups
        }, {}
      )

      this.setState({
        results: grouped_signatures,
        status: '',
        duration: (Date.now() - start)/1000,
      }, () => this.count_results())

      if(this.state.up_down) {
        this.setState({
          last_up_geneset: this.state.up_geneset,
          last_down_geneset: this.state.up_geneset,
          last_geneset: null,
        })
      } else {
        this.setState({
          last_up_geneset: null,
          last_down_geneset: null,
          last_geneset: this.state.geneset,
        })
      }
  
    } catch(e) {
      if(e.code !== DOMException.ABORT_ERR) {
        this.setState({
          status: e + ''
        })
      }
    }
  }

  async fetch_values(key) {
    this.setState({
      value_count: {},
    })
    const where = this.build_where()
    const { response: value_count } = await fetch_meta('/signatures/value_count', {
      filter: {
        where,
        fields: [
          key,
        ]
      },
      depth: 2,
    })
    this.setState({
      value_count,
    })
  }

  set_library(library) {
    this.setState({
      library
    })
  }

  render_libraries(results) {
    return results === undefined || results.length <= 0 ? (
      <div className="center">
        {this.state.status === null ? null : 'No results.'}
      </div>
    ) : (
      <div className="col s12">
        <ul
          className="collapsible popout"
          ref={(ref) => M.Collapsible.init(ref, {
            onOpenStart: () => window.dispatchEvent(new Event('resize')),
            onOpenEnd: () => window.dispatchEvent(new Event('resize')),
          })}
        >
          {Object.keys(results).filter(
            (result) =>
              this.state.resource_filter === null
              || this.state.resource_filter.libraries.map(
                  (lib) => lib.id
                ).indexOf(results[result].library.id) !== -1
          ).map((key, ind) => (
            <li
              key={key}
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
                  item={results[key].library}
                  highlight={this.state.search}
                  visibility={1}
                />
                <div style={{ flex: '1 0 auto' }}>&nbsp;</div>
                <a
                  href="#!"
                  style={{ border: 0 }}
                >
                  <i className="material-icons">expand_more</i>
                </a>
              </div>
              <div
                className="collapsible-body"
              >
              {Style.it(`
                .tab-content {
                  height: 600px;
                }
                `, (
                  <div 
                    style={{
                      paddingTop: 0,
                      marginTop: '-25px',
                    }}
                  >
                    <ul
                      className="tabs"
                      ref={(ref) => M.Tabs.init(ref, {
                        onShow: () => window.dispatchEvent(new Event('resize'))
                      })}
                    >
                      <li className="tab col s3"><a className="active" href={"#bargraph-" + key }>Bar Graph</a></li>
                      <li className="tab col s3"><a href={"#table-" + key }>Table</a></li>
                    </ul>
                    <div id={"bargraph-" + key } className="tab-content">
                      {(() => {
                        let signatures = [...results[key].signatures].sort(
                          (a, b) => b.meta['p-value'] - a.meta['p-value']
                        ).slice(0, 10).map((signature, ind) => ({
                          y: ind,
                          text: signature.meta['Original String'],
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
                    <div id={"table-" + key } className="tab-content">
                      {(() => {
                        const sigs = results[key].signatures
                        const schema = schemas.filter(
                          (schema) => objectMatch(schema.match, sigs[0])
                        )[0]
                        const cols = Object.keys(schema.properties).filter(
                          (prop) => {
                            if(schema.properties[prop].type === 'text') {
                              if(this.state.up_down) {
                                if(one_tailed_columns.indexOf(prop) === -1)
                                  return true
                              } else {
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
                )
              )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  render() {
    return (
      <main id={this.props.id}>
        <div className="row">
          <div className="col s12 center">
            <form
              action="javascript:void(0);"
              onSubmit={this.submit}
            >

              <div className="col s12">
                <div className="switch">
                  <label>
                    One Tailed
                    <input
                      type="checkbox"
                      checked={this.state.up_down}
                      onChange={() => this.setState(({ up_down }) => ({ up_down: !up_down }))}
                    />
                    <span className="lever"></span>
                    Two Tailed*
                  </label>
                </div>
                {this.state.up_down ? (
                  <span>
                    Note: Will limit results to full signatures.
                  </span>
                ) : null}
              </div>

              <div className="col s2">&nbsp;</div>
              {this.state.up_down ? (
                <div>
                  <div className="col s4">
                    <div className="input-field">
                      <textarea
                        id="up_geneset"
                        placeholder="Genes that are up-regulated in signature or overlap with gene-set."
                        style={{
                          height: 200,
                          overflow: 'auto',
                        }}
                        value={this.state.up_geneset}
                        onChange={(e) => this.setState({up_geneset: e.target.value})}
                      ></textarea>
                    </div>
                  </div>
                  <div className="col s4">
                    <div className="input-field">
                      <textarea
                        id="down_geneset"
                        placeholder="Genes that are down-regulated in signature or overlap with gene-set."
                        style={{
                          height: 200,
                          overflow: 'auto',
                        }}
                        value={this.state.down_geneset}
                        onChange={(e) => this.setState({down_geneset: e.target.value})}
                      ></textarea>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="col s8">
                  <div className="input-field">
                    <textarea
                      id="geneset"
                      placeholder="Genes that are down-regulated in signature or overlap with gene-set."
                      style={{
                        height: 200,
                        overflow: 'auto',
                      }}
                      value={this.state.geneset}
                      onChange={(e) => this.setState({geneset: e.target.value})}
                    ></textarea>
                  </div>
                </div>
              )}
              <div className="col s2">&nbsp;</div>

              <div className="col s12">
                <div className="input-field">
                  <div
                    className="chip grey darken-2 white-text waves-effect waves-light"
                    onClick={() => {
                      this.setState({
                        up_down: false,
                        geneset: example_geneset,
                      })
                    }}
                  >Example Crisp Gene Set</div>

                  <div
                    className="chip grey darken-2 white-text waves-effect waves-light"
                    onClick={() => {
                      this.setState({
                        up_down: false,
                        geneset: example_geneset_weighted,
                      })
                    }}
                  >Example Weighted Signature</div>

                  <div
                    className="chip grey darken-2 white-text waves-effect waves-light"
                    onClick={() => {    
                      this.setState({
                        up_down: true,
                        up_geneset: example_geneset_up,
                        down_geneset: example_geneset_down,
                      })
                    }}
                  >Example Up and Down Sets</div>
                </div>

                {this.state.resources.length <= 0 ? null : (
                  <div ref={(ref) => {
                    if (!this.state.resourceAnchor)
                      this.setState({ resourceAnchor: ref })
                  }} className="col offset-s2 s8 center">
                    {this.state.resources.filter(
                      (resource) => {
                        if (this.state.up_down)
                          return primary_two_tailed_resources.indexOf(resource.name) !== -1
                        else
                          return primary_resources.indexOf(resource.name) !== -1
                      }
                    ).map((resource) => (
                      <IconButton
                        key={resource.name}
                        alt={resource.name}
                        img={resource.icon}
                        onClick={() => this.setState({ resource_filter: resource }, () => this.submit())}
                      />
                    ))}
                    {this.state.up_down ? null : (
                      <div>
                        <IconButton
                          alt={this.state.show_all ? "Less": "More"}
                          icon={'more_horiz'}
                          onClick={() => this.setState(({show_all}) => ({ show_all: !show_all }))}
                        />
                        {!this.state.show_all ? null : this.state.resources.filter(
                          (resource) => primary_resources.indexOf(resource.name) === -1
                        ).map((resource) => (
                          <IconButton
                            key={resource.name}
                            alt={resource.name}
                            img={resource.icon}
                            onClick={() => this.setState({ resource_filter: resource }, () => this.submit())}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </form>
          </div>

          <div className="col s12 center">
            {this.state.status === null ? null : (
              <span className="grey-text">
                {this.state.count} results of 654247 ({this.state.duration.toPrecision(3)} seconds total, {this.state.duration_meta.toPrecision(3)} on metadata, {this.state.duration_data.toPrecision(3)} on data)
              </span>
            )}
          </div>

          {/*
          {this.state.mismatched_entities.length <= 0 ? null : (
            <div className="col s12 center">
              The following entities could not be identified!
              <textarea
                readOnly
                value={this.state.mismatched_entities.join(' ')}
              ></textarea>
            </div>
          )}
          {this.state.matched_entities.length <= 0 ? null : (
            <div className="col s12 center">
              The following entities were identified
              <textarea
                readOnly
                value={this.state.matched_entities.join(' ')}
              ></textarea>
            </div>
          )}
          */}

          <div className="col s12">
            {this.state.status !== '' ? (
              <div className="center">
                {this.state.status}
              </div>
            ) : null}
          </div>

          <div className="col s12">
            {this.state.status !== '' ? null : this.render_libraries(this.state.results)}
          </div>
        </div>
      </main>
    );
  }
}
