import { Map, Set } from 'immutable';
import M from "materialize-css";
import React from "react";
import { fetch_data } from "../../util/fetch/data";
import { fetch_meta, fetch_meta_post } from "../../util/fetch/meta";
import { BarGraph } from './BarGraph'
import { ShowMeta } from '../../components/ShowMeta'
import { maybe_fix_obj } from '../../util/maybe_fix_obj'
import { Label } from '../../components/Label';
import { call } from '../../util/call'
import IconButton from '../../components/IconButton';
import scrollToComponent from 'react-scroll-to-component';
import MUIDataTable from "mui-datatables";
import { makeTemplate } from '../../util/makeTemplate'
import { schemas, objectMatch } from '../../components/Label'
import { renamed, iconOf, primary_resources, primary_two_tailed_resources } from '../Resources'
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core';

const example_geneset = 'SERPINA3 CFL1 FTH1 GJA1 HADHB LDHB MT1X RPL21 RPL34 RPL39 RPS15 RPS24 RPS27 RPS29 TMSB4XP8 TTR TUBA1B ANP32B DDAH1 HNRNPA1P10'.split(' ').join('\n')
const example_geneset_weighted = 'SERPINA3,1.0 CFL1,-1.0 FTH1,0.5 GJA1,-0.5 HADHB,0.25 LDHB,-0.25 MT1X,0.4 RPL21,0.3 RPL34,0.2 RPL39,0.1 RPS15,-0.1 RPS24,-0.2 RPS27,-0.3 RPS29,-0.4 TMSB4XP8,-0.6 TTR,-0.7 TUBA1B,-0.8 ANP32B,-0.9 DDAH1,0.9 HNRNPA1P10,0.8'.split(' ').join('\n')
const example_geneset_up = 'SERPINA3 CFL1 FTH1 GJA1 HADHB LDHB MT1X RPL21 RPL34 RPL39 RPS15'.split(' ').join('\n')
const example_geneset_down = 'RPS24 RPS27 RPS29 TMSB4XP8 TTR TUBA1B ANP32B DDAH1 HNRNPA1P10'.split(' ').join('\n')


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

export default class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      search: '',
      results: Map(),
      geneset: '',
      time: 0,
      count: 0,
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
    M.AutoInit();

    const libraries = await fetch_meta_post('/libraries/find', {})
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
    M.AutoInit();
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
        up_entities = Set(this.state.up_geneset.split(/[ \t\n;]+/).map((line) => /^(.+?)(,(.+))?$/.exec(line)[0])) // TODO: handle weights
        down_entities = Set(this.state.down_geneset.split(/[ \t\n;]+/).map((line) => /^(.+?)(,(.+))?$/.exec(line)[0])) // TODO: handle weights
        entities = Set([...up_entities, ...down_entities])
      } else {
        entities = Set(this.state.geneset.split(/[ \t\n;]+/).map((line) => /^(.+?)(,(.+))?$/.exec(line)[0])) // TODO: handle weights
      }
      let entity_ids = Set()
      let up_entity_ids = Set()
      let down_entity_ids = Set()

      const start = Date.now()

      const entity_meta = await fetch_meta_post('/entities/find', {
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
      
      for(const entity of entity_meta) {
        if (this.state.up_down) {
          const matched_up_entities = Set.intersect(
            Set([entity.meta.Name]),
            up_entities,
          )
          if (matched_up_entities.count() >= 0) {
            up_entities = up_entities.subtract(matched_up_entities)
            up_entity_ids = up_entity_ids.add(entity.id)
          }

          const matched_down_entities = Set.intersect(
            Set([entity.meta.Name]),
            down_entities,
          )
          if (matched_down_entities.count() >= 0) {
            down_entities = down_entities.subtract(matched_down_entities)
            down_entity_ids = down_entity_ids.add(entity.id)
          }
        } else {
          const matched_entities = Set.intersect(
            Set([entity.meta.Name]),
            entities,
          )

          entities = entities.subtract(matched_entities)
          entity_ids = entity_ids.add(entity.id)
        }
      }

      this.setState({
        status: 'Searching...',
        matched_entities: entity_ids,
        mismatched_entities: entities,
      })

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
          (results, result) => {
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
          (results, result) => {
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
      })

      const enriched_signatures_meta = await fetch_meta_post('/signatures/find', {
        filter: {
          where: {
            id: {
              inq: Object.values(enriched_results).map((k) => k.id)
            }
          }
        }
      }, controller.signal)

      const enriched_signatures = enriched_signatures_meta.reduce(
        (full, signature) => ([
          ...full,
          {
            ...signature,
            meta: {
              ...signature.meta,
              ...enriched_results[signature.id],
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
        time: Date.now() - start,
      }, () => this.count_results())

      if(this.state.up_down) {
        this.setState({
          last_up_geneset: this.state.up_geneset,
          last_down_geneset: this.state.up_geneset,
        })
      } else {
        this.setState({
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
    const value_count = await fetch_meta('/signatures/value_count', {
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
                <div 
                  style={{
                    paddingTop: 0,
                    marginTop: '-25px',
                  }}
                >
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
                            responsive: 'scroll',
                            selectableRows: true,
                            expandableRows: true,
                            renderExpandableRow: (rowData, rowMeta) => (
                              <TableRow>
                                <TableCell colSpan={rowData.length}>
                                  <ShowMeta
                                    value={sigs[rowMeta.dataIndex]}
                                  />
                                </TableCell>
                              </TableRow>
                            )
                          }}
                          columns={cols.map((col) => ({ name: col }))}
                          data={sigs.map((sig) =>
                            cols.map((col) => {
                              const val = makeTemplate(schema.properties[col].text, sig)
                              if (val === 'undefined')
                                return ''
                              return val
                            })
                          )}
                        />
                      </MuiThemeProvider>
                    )
                  })()}
                </div>
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
            </form>
          </div>

          <div className="col s12 center">
            {this.state.status === null ? null : (
              <span className="grey-text">
                {this.state.count} results ({this.state.time/1000} seconds)
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
