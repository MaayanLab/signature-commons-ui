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

const example_geneset = 'Nsun3 Polrmt Nlrx1 Sfxn5 Zc3h12c Slc25a39 Arsg Defb29 Ndufb6 Zfand1 Tmem77 5730403B10Rik RP23-195K8.6 Tlcd1 Psmc6 Slc30a6 LOC100047292 Lrrc40 Orc5l Mpp7 Unc119b Prkaca Tcn2 Psmc3ip Pcmtd2 Acaa1a Lrrc1 2810432D09Rik Sephs2 Sac3d1 Tmlhe LOC623451 Tsr2 Plekha7 Gys2 Arhgef12 Hibch Lyrm2 Zbtb44 Entpd5 Rab11fip2 Lipt1 Intu Anxa13 Klf12 Sat2 Gal3st2 Vamp8 Fkbpl Aqp11 Trap1 Pmpcb Tm7sf3 Rbm39 Bri3 Kdr Zfp748 Nap1l1 Dhrs1 Lrrc56 Wdr20a Stxbp2 Klf1 Ufc1 Ccdc16 9230114K14Rik Rwdd3 2610528K11Rik Aco1 Cables1 LOC100047214 Yars2 Lypla1 Kalrn Gyk Zfp787 Zfp655 Rabepk Zfp650 4732466D17Rik Exosc4 Wdr42a Gphn 2610528J11Rik 1110003E01Rik Mdh1 1200014M14Rik AW209491 Mut 1700123L14Rik 2610036D13Rik Cox15 Tmem30a Nsmce4a Tm2d2 Rhbdd3 Atxn2 Nfs1 3110001I20Rik BC038156 LOC100047782 2410012H22Rik Rilp A230062G08Rik Pttg1ip Rab1 Afap1l1 Lyrm5 2310026E23Rik C330002I19Rik Zfyve20 Poli Tomm70a Slc7a6os Mat2b 4932438A13Rik Lrrc8a Smo Nupl2 Trpc2 Arsk D630023B12Rik Mtfr1 5730414N17Rik Scp2 Zrsr1 Nol7 C330018D20Rik Ift122 LOC100046168 D730039F16Rik Scyl1 1700023B02Rik 1700034H14Rik Fbxo8 Paip1 Tmem186 Atpaf1 LOC100046254 LOC100047604 Coq10a Fn3k Sipa1l1 Slc25a16 Slc25a40 Rps6ka5 Trim37 Lrrc61 Abhd3 Gbe1 Parp16 Hsd3b2 Esm1 Dnajc18 Dolpp1 Lass2 Wdr34 Rfesd Cacnb4 2310042D19Rik Srr Bpnt1 6530415H11Rik Clcc1 Tfb1m 4632404H12Rik D4Bwg0951e Med14 Adhfe1 Thtpa Cat Ell3 Akr7a5 Mtmr14 Timm44 Sf1 Ipp Iah1 Trim23 Wdr89 Gstz1 Cradd 2510006D16Rik Fbxl6 LOC100044400 Zfp106 Cd55 0610013E23Rik Afmid Tmem86a Aldh6a1 Dalrd3 Smyd4 Nme7 Fars2 Tasp1 Cldn10 A930005H10Rik Slc9a6 Adk Rbks 2210016F16Rik Vwce 4732435N03Rik Zfp11 Vldlr 9630013D21Rik 4933407N01Rik Fahd1 Mipol1 1810019D21Rik 1810049H13Rik Tfam Paics 1110032A03Rik LOC100044139 Dnajc19 BC016495 A930041I02Rik Rqcd1 Usp34 Zcchc3 H2afj Phf7 4921508D12Rik Kmo Prpf18 Mcat Txndc4 4921530L18Rik Vps13b Scrn3 Tor1a AI316807 Acbd4 Fah Apool Col4a4 Lrrc19 Gnmt Nr3c1 Sip1 Ascc1 Fech Abhd14a Arhgap18 2700046G09Rik Yme1l1 Gk5 Glo1 Sbk1 Cisd1 2210011C24Rik Nxt2 Notum Ankrd42 Ube2e1 Ndufv1 Slc33a1 Cep68 Rps6kb1 Hyi Aldh1a3 Mynn 3110048L19Rik Rdh14 Proz Gorasp1 LOC674449 Zfp775 5430437P03Rik Npy Adh5 Sybl1 4930432O21Rik Nat9 LOC100048387 Mettl8 Eny2 2410018G20Rik Pgm2 Fgfr4 Mobkl2b Atad3a 4932432K03Rik Dhtkd1 Ubox5 A530050D06Rik Zdhhc5 Mgat1 Nudt6 Tpmt Wbscr18 LOC100041586 Cdk5rap1 4833426J09Rik Myo6 Cpt1a Gadd45gip1 Tmbim4 2010309E21Rik Asb9 2610019F03Rik 7530414M10Rik Atp6v1b2 2310068J16Rik Ddt Klhdc4 Hpn Lifr Ovol1 Nudt12 Cdan1 Fbxo9 Fbxl3 Hoxa7 Aldh8a1 3110057O12Rik Abhd11 Psmb1 ENSMUSG00000074286 Chpt1 Oxsm 2310009A05Rik 1700001L05Rik Zfp148 39509 Mrpl9 Tmem80 9030420J04Rik Naglu Plscr2 Agbl3 Pex1 Cno Neo1 Asf1a Tnfsf5ip1 Pkig AI931714 D130020L05Rik Cntd1 Clec2h Zkscan1 1810044D09Rik Mettl7a Siae Fbxo3 Fzd5 Tmem166 Tmed4 Gpr155 Rnf167 Sptlc1 Riok2 Tgds Pms1 Pitpnc1 Pcsk7 4933403G14Rik Ei24 Crebl2 Tln1 Mrpl35 2700038C09Rik Ubie Osgepl1 2410166I05Rik Wdr24 Ap4s1 Lrrc44 B3bp Itfg1 Dmxl1 C1d'.split(' ').join('\n')
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
        up_entities = Set(this.state.up_geneset.toUpperCase().split(/[ \t\n;]+/).map((line) => /^(.+?)(,(.+))?$/.exec(line)[0])) // TODO: handle weights
        down_entities = Set(this.state.down_geneset.toUpperCase().split(/[ \t\n;]+/).map((line) => /^(.+?)(,(.+))?$/.exec(line)[0])) // TODO: handle weights
        entities = Set([...up_entities, ...down_entities])
      } else {
        entities = Set(this.state.geneset.toUpperCase().split(/[ \t\n;]+/).map((line) => /^(.+?)(,(.+))?$/.exec(line)[0])) // TODO: handle weights
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
