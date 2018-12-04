import fileDownload from 'js-file-download';
import M from "materialize-css";
import React from "react";
import { Footer } from '../../components/Footer';
import { Header } from '../../components/Header';
import { ShowMeta } from '../../components/ShowMeta';
import { range } from '../../util/range';
import { fetch_data } from "../../util/fetch/data";
import { fetch_meta } from "../../util/fetch/meta";
import { Set } from 'immutable'
import { Highlight } from '../../components/Highlight'

const count = 'half a million'
const example_geneset = 'Nsun3 Polrmt Nlrx1 Sfxn5 Zc3h12c Slc25a39 Arsg Defb29 Ndufb6 Zfand1 Tmem77 5730403B10Rik RP23-195K8.6 Tlcd1 Psmc6 Slc30a6 LOC100047292 Lrrc40 Orc5l Mpp7 Unc119b Prkaca Tcn2 Psmc3ip Pcmtd2 Acaa1a Lrrc1 2810432D09Rik Sephs2 Sac3d1 Tmlhe LOC623451 Tsr2 Plekha7 Gys2 Arhgef12 Hibch Lyrm2 Zbtb44 Entpd5 Rab11fip2 Lipt1 Intu Anxa13 Klf12 Sat2 Gal3st2 Vamp8 Fkbpl Aqp11 Trap1 Pmpcb Tm7sf3 Rbm39 Bri3 Kdr Zfp748 Nap1l1 Dhrs1 Lrrc56 Wdr20a Stxbp2 Klf1 Ufc1 Ccdc16 9230114K14Rik Rwdd3 2610528K11Rik Aco1 Cables1 LOC100047214 Yars2 Lypla1 Kalrn Gyk Zfp787 Zfp655 Rabepk Zfp650 4732466D17Rik Exosc4 Wdr42a Gphn 2610528J11Rik 1110003E01Rik Mdh1 1200014M14Rik AW209491 Mut 1700123L14Rik 2610036D13Rik Cox15 Tmem30a Nsmce4a Tm2d2 Rhbdd3 Atxn2 Nfs1 3110001I20Rik BC038156 LOC100047782 2410012H22Rik Rilp A230062G08Rik Pttg1ip Rab1 Afap1l1 Lyrm5 2310026E23Rik C330002I19Rik Zfyve20 Poli Tomm70a Slc7a6os Mat2b 4932438A13Rik Lrrc8a Smo Nupl2 Trpc2 Arsk D630023B12Rik Mtfr1 5730414N17Rik Scp2 Zrsr1 Nol7 C330018D20Rik Ift122 LOC100046168 D730039F16Rik Scyl1 1700023B02Rik 1700034H14Rik Fbxo8 Paip1 Tmem186 Atpaf1 LOC100046254 LOC100047604 Coq10a Fn3k Sipa1l1 Slc25a16 Slc25a40 Rps6ka5 Trim37 Lrrc61 Abhd3 Gbe1 Parp16 Hsd3b2 Esm1 Dnajc18 Dolpp1 Lass2 Wdr34 Rfesd Cacnb4 2310042D19Rik Srr Bpnt1 6530415H11Rik Clcc1 Tfb1m 4632404H12Rik D4Bwg0951e Med14 Adhfe1 Thtpa Cat Ell3 Akr7a5 Mtmr14 Timm44 Sf1 Ipp Iah1 Trim23 Wdr89 Gstz1 Cradd 2510006D16Rik Fbxl6 LOC100044400 Zfp106 Cd55 0610013E23Rik Afmid Tmem86a Aldh6a1 Dalrd3 Smyd4 Nme7 Fars2 Tasp1 Cldn10 A930005H10Rik Slc9a6 Adk Rbks 2210016F16Rik Vwce 4732435N03Rik Zfp11 Vldlr 9630013D21Rik 4933407N01Rik Fahd1 Mipol1 1810019D21Rik 1810049H13Rik Tfam Paics 1110032A03Rik LOC100044139 Dnajc19 BC016495 A930041I02Rik Rqcd1 Usp34 Zcchc3 H2afj Phf7 4921508D12Rik Kmo Prpf18 Mcat Txndc4 4921530L18Rik Vps13b Scrn3 Tor1a AI316807 Acbd4 Fah Apool Col4a4 Lrrc19 Gnmt Nr3c1 Sip1 Ascc1 Fech Abhd14a Arhgap18 2700046G09Rik Yme1l1 Gk5 Glo1 Sbk1 Cisd1 2210011C24Rik Nxt2 Notum Ankrd42 Ube2e1 Ndufv1 Slc33a1 Cep68 Rps6kb1 Hyi Aldh1a3 Mynn 3110048L19Rik Rdh14 Proz Gorasp1 LOC674449 Zfp775 5430437P03Rik Npy Adh5 Sybl1 4930432O21Rik Nat9 LOC100048387 Mettl8 Eny2 2410018G20Rik Pgm2 Fgfr4 Mobkl2b Atad3a 4932432K03Rik Dhtkd1 Ubox5 A530050D06Rik Zdhhc5 Mgat1 Nudt6 Tpmt Wbscr18 LOC100041586 Cdk5rap1 4833426J09Rik Myo6 Cpt1a Gadd45gip1 Tmbim4 2010309E21Rik Asb9 2610019F03Rik 7530414M10Rik Atp6v1b2 2310068J16Rik Ddt Klhdc4 Hpn Lifr Ovol1 Nudt12 Cdan1 Fbxo9 Fbxl3 Hoxa7 Aldh8a1 3110057O12Rik Abhd11 Psmb1 ENSMUSG00000074286 Chpt1 Oxsm 2310009A05Rik 1700001L05Rik Zfp148 39509 Mrpl9 Tmem80 9030420J04Rik Naglu Plscr2 Agbl3 Pex1 Cno Neo1 Asf1a Tnfsf5ip1 Pkig AI931714 D130020L05Rik Cntd1 Clec2h Zkscan1 1810044D09Rik Mettl7a Siae Fbxo3 Fzd5 Tmem166 Tmed4 Gpr155 Rnf167 Sptlc1 Riok2 Tgds Pms1 Pitpnc1 Pcsk7 4933403G14Rik Ei24 Crebl2 Tln1 Mrpl35 2700038C09Rik Ubie Osgepl1 2410166I05Rik Wdr24 Ap4s1 Lrrc44 B3bp Itfg1 Dmxl1 C1d'
const n_rows = 1

const buildTitle = (sig, highlight) => {
  const buildLabels = (labels) => (
    <span>
      {Object.keys(labels).map((key) => labels[key] === undefined || ((labels[key]+'') === '-666') ? null : (
        <Highlight
          key={key}
          text={key + ': ' + labels[key]+''}
          highlight={highlight}
          props={{
            className: "chip"
          }}
        />
      ))}
    </span>
  )
  
  if (sig.meta.$validator === '/@dcic/signature-commons-schema/meta/signature/draft-1.json') {
    return (
      <div>
        <div className="chip">
          <img
            alt="Enrichr"
            src="http://amp.pharm.mssm.edu/Enrichr/images/enrichr-icon.png"
          />
          Enrichr
        </div>
        {buildLabels({
          'Resource': sig.meta.Resource,
          'Assay': sig.meta.Assay,
          'Organism': sig.meta.Organism,
          'Description': sig.meta['Original String'],
        })}
      </div>
    )
  }
  else if (sig.meta.$validator === '/@dcic/signature-commons-schema/meta/signature/clue-io.json') {
    return (
      <div>
        <div className="chip">
          <img
            alt="ConnectivityMap"
            src="http://amp.pharm.mssm.edu/enrichmentapi/images/clue.png"
          />
          ConnectivityMap
        </div>
        {buildLabels({
          'Assay': 'L1000',
          'Batch': sig.meta.pert_mfc_id,
          'Cell-line': sig.meta.cell_id,
          'Time point': sig.meta.pert_time + ' ' + sig.meta.pert_time_unit,
          'Perturbation': sig.meta.pert_desc,
          'Concentration': sig.meta.pert_dose,
        })}
      </div>
    )
  } else if (sig.meta.$validator === '/@dcic/signature-commons-schema/meta/signature/creeds.json') {
    return (
      <div>
        <div className="chip">
          <img
            alt="CREEDS"
            src="http://amp.pharm.mssm.edu/CREEDS/img/creeds.png"
          />
          CREEDS
        </div>
        {buildLabels({
          'Assay': 'Microarray',
          'Drug': sig.meta.drug_name,
          'DrugBank': sig.meta.drugbank_id,
          'Organism': sig.meta.organism,
          'GEO Accession': sig.meta.geo_id,
          'CREEDS ID': sig.meta.id,
        })}
      </div>
    )
  }
}

export default class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      search: '',
      results: [],
      cart: new Set(),
      time: 0,
      count: 0,
      key_count: {},
      value_count: {},
      status: null,
      controller: null,
    }

    this.submit = this.submit.bind(this)
    this.submit_enrich = this.submit_enrich.bind(this)
    this.build_where = this.build_where.bind(this)
    this.fetch_values = this.fetch_values.bind(this)
    this.download = this.download.bind(this)
  }

  componentDidMount() {
    M.AutoInit();
  }

  componentDidUpdate() {
    M.AutoInit();
    M.updateTextFields();
  }

  build_where() {
    if (this.state.search.indexOf(':') !== -1) {
      const [key, ...value] = this.state.search.split(':')
      return {
        ['meta.' + key]: {
          ilike: '%' + value.join(':') + '%'
        }
      }
    } else {
      return {
        meta: {
          fullTextSearch: this.state.search
        }
      }
    }
  }

  async submit() {
    if(this.state.controller !== null) {
      this.state.controller.abort()
    }
    try {
      const controller = new AbortController()
      this.setState({
        status: 'Searching...',
        controller: controller,
      })

      const where = this.build_where()

      const start = Date.now()
      const results = await fetch_meta('/signatures', {
        filter: {
          where,
          limit: 20,
        },
      }, controller.signal)

      this.setState({
        results,
        status: '',
        time: Date.now() - start,
      })

      const key_count = await fetch_meta('/signatures/key_count', {
        filter: {
          where,
        },
      }, controller.signal)

      this.setState({
        key_count,
        count: key_count['$validator'],
        controller: null,
      }, () => M.AutoInit())
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

  async submit_enrich(id) {
    // TODO: perform enrichment
    // id contains entities
    // cart contains signatures
  }

  async download(id) {
    try {
      let ids
      if(id === undefined) {
        ids = this.state.cart.toArray()
      } else {
        ids = [id]
      }

      const signature_data = await fetch_data(ids)
      const signature_metadata = await fetch_meta('/signatures', {
        filter: {
          where: {
            id: {
              inq: ids,
            }
          }
        }
      })
      const entity_metadata = await fetch_meta('/entites', {
        filter: {
          where: {
            id: {
              inq: signature_data.entities,
            }
          }
        }
      })
      const data = {
        entites: entity_metadata,
        signatures: signature_metadata,
        values: signature_data.values,
      }
      fileDownload(data, 'data.json');
    } catch(e) {
      console.error(e)
    }
  }

  render_signatures(results) {
    return results === undefined || results.length <= 0 ? (
      <div className="center">
        {this.state.status === null ? null : 'No results.'}
      </div>
    ) : (
      range(n_rows).map((n) => (
        <div
          key={n}
          className={"col s" + (12/n_rows)}
        >
          <ul
            className="collapsible popout"
          >
            {results.filter((_, ind) => (ind % n_rows) === n).map((signature, ind) => (
              <li
                key={signature.id}
              >
                <div
                  className="collapsible-header"
                  style={{
                    display: 'flex',
                    flexDirection: "row",
                  }}>
                    {buildTitle(signature, this.state.search)}
                </div>
                <div
                  className="collapsible-body"
                >
                  <div 
                    style={{
                      height: '300px',
                      overflow: 'auto',
                    }}
                  >
                    <ShowMeta
                      value={{ID: signature.id, ...signature.meta}}
                      highlight={this.state.search}
                    />
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: "row",
                  }}>
                    {this.state.cart.has(signature.id) ? (
                      <a
                        href="#!"
                        className="waves-effect waves-light btn"
                        onClick={() => {
                          this.setState({
                            cart: this.state.cart.delete(signature.id)
                          })
                        }}
                      >
                        <i className="material-icons left">remove_shopping_cart</i> Remove from Cart
                      </a>
                    ) : (
                      <a
                        href="#!"
                        className="waves-effect waves-light btn"
                        onClick={() => {
                          this.setState({
                            cart: this.state.cart.add(signature.id)
                          })
                        }}
                      >
                        <i className="material-icons left">add_shopping_cart</i> Add to Cart
                      </a>
                    )}

                    <a
                      href="#!"
                      className="waves-effect waves-light btn"
                      onClick={() => this.download(signature.id)}
                    ><i className="material-icons prefix">file_download</i> Download</a>

                    <a
                      href="#!"
                      className="waves-effect waves-light btn"
                      disabled={this.state.cart.count() <= 0 || this.state.cart.has(signature.id)}
                      onClick={() => this.submit_enrich(signature.id)}
                    >
                      <i className="material-icons">functions</i> Enrich
                    </a>
                    <div style={{ flex: '1 0 auto' }}>&nbsp;</div>

                    <a
                      href="#!"
                      className="waves-effect waves-light btn"
                      disabled
                    >
                      <i className="material-icons prefix" style={{ marginRight: '24px' }}>send</i>
                    </a>

                    <a
                      href="#!"
                      className="waves-effect waves-light btn"
                    ><img
                      style={{
                        maxWidth: 48,
                        maxHeight: 24,
                        top: 5,
                      }}
                      alt="Enrichr"
                      src="http://amp.pharm.mssm.edu/Enrichr/images/enrichr-icon.png"
                    ></img> Enrichr</a>
                    <a
                      href="#!"
                      className="waves-effect waves-light btn"
                    ><img
                      style={{
                        maxWidth: 48,
                        maxHeight: 24,
                        top: 5,
                      }}
                      alt="GeneShot"
                      src="https://amp.pharm.mssm.edu/geneshot/images/targetArrow.png"
                    ></img> GeneShot</a>
                    <a
                      href="#!"
                      className="waves-effect waves-light btn"
                    ><img
                      style={{
                        maxWidth: 48,
                        maxHeight: 24,
                        top: 5,
                      }}
                      alt="ARCHS4"
                      src="https://amp.pharm.mssm.edu/archs4/images/archs-icon.png?v=2"
                    ></img> ARCHS4</a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))
    )
  }

  render() {
    return (
      <div className="root">
        <Header
          page="Home"
        />

        <ul id="slide-out" className="sidenav">
          {Object.keys(this.state.key_count).filter((key) => !key.startsWith('$')).map((key) => (
            <li key={key} className="no-padding">
              <ul className="collapsible collapsible-accordion">
                <li>
                  <a
                    href="#!"
                    className="collapsible-header"
                  >
                    {key} ({this.state.key_count[key]})
                  </a>
                  <div className="collapsible-body">
                    {this.state.value_count[key] === undefined ? null : (
                      <ul>
                        {Object.keys(this.state.value_count[key]).map((k) => (
                          <li key={key + '.' + k}>
                            <a href="#!">
                              <label>
                                <input type="checkbox" />
                                <span>
                                  {k} ({this.state.value_count[key][k]})
                                </span>
                              </label>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              </ul>
            </li>
          ))}
        </ul>

        {this.state.cart.count() <= 0 ? null : (
          <div className="fixed-action-btn">
            <a
              href="#!"
              className="btn-floating btn-large teal"
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
                  href="#!"
                  className="btn-floating red"
                  onClick={this.download}
                >
                  <i className="material-icons">file_download</i>
                </a>
              </li>
              <li>
                <a
                  href="#!"
                  className="btn-floating green"
                  onClick={this.submit_enrich}
                >
                  <i className="material-icons">functions</i>
                </a>
              </li>
              <li>
                <a
                  href="#!"
                  className="btn-floating grey"
                  onClick={() => alert('Comming soon')}
                >
                  <i className="material-icons">send</i>
                </a>
              </li>
            </ul>
          </div>
        )}

        <div id="signaturequerymodal" className="modal">
          <div className="modal-content">
            <p>
              Calculate enrichment against signatures in cart.
            </p>
            <div className="input-field">
              <label for="geneset"><b>Geneset</b></label>
              <textarea
                id="geneset"
                className="materialize-textarea"
                placeholder="Genes that are up-regulated in signature or overlap with gene-set."
                onChange={(e) => this.setState({geneset: e.target.value})}
                value={this.state.geneset}
              ></textarea>
              <div
                className="chip waves-effect"
                onClick={() => this.setState({ geneset: example_geneset })}
              >
                Example Geneset
              </div>
              <div>
                {this.render_signatures(this.state.enrichment_results)}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <a
              href="#!"
              className="waves-effect waves-green btn-flat"
            >Done</a>
          </div>
        </div>

        <main>
          <div className="row">
            <div className="col s12 center">
              <form action="javascript:void(0);" onSubmit={this.submit}>
                <div className="input-field">
                  <i className="material-icons prefix">search</i>
                  <input
                    id="searchBox"
                    type="text"
                    onChange={(e) => this.setState({search: e.target.value})}
                    value={this.state.search}
                    className="active"
                    placeholder={'Search over '+count+' signatures'}
                    style={{
                      fontWeight: 500,
                      color: 'rgba(0, 0, 0, 0.54)',
                      borderRadius: '2px',
                      border: 0,
                      height: '36px',
                      width: '350px',
                      padding: '8px 8px 8px 60px',
                      background: '#f7f7f7',
                    }}
                  />
                  <span>&nbsp;&nbsp;</span>
                  <button className="btn waves-effect waves-light" type="submit" name="action">Search
                    <i className="material-icons right">send</i>
                  </button>
                </div>
                {['MCF10A', 'Imatinib', 'ZNF830', 'STAT3', 'Neuropathy'].map((example) => (
                  <div
                    key={example}
                    className="chip waves-effect waves-light"
                    onClick={() => this.setState({
                      search: example,
                    }, () => this.submit())}
                  >{example}</div>
                ))}
              </form>
            </div>
            <div className="col s2"></div>
            <div className="col s12 center">
              {this.state.status === null ? null : (
                <span className="grey-text">
                  About {this.state.count} results ({this.state.time/1000} seconds)
                </span>
              )}
            </div>
            <div className="col s12">
              {this.state.status !== '' ? (
                <div className="center">
                  {this.state.status}
                </div>
              ) : this.render_signatures(this.state.results)}
            </div>
            {this.state.results.length <= 0 || this.state.status !== '' ? null : (
              <div className="col s12 center">
                <ul className="pagination">
                  <li className="disabled"><a href="#!"><i className="material-icons">chevron_left</i></a></li>
                  <li className="active teal"><a href="#!">1</a></li>
                  <li className="waves-effect"><a href="#!">2</a></li>
                  <li className="waves-effect"><a href="#!">3</a></li>
                  <li className="waves-effect"><a href="#!"><i className="material-icons">chevron_right</i></a></li>
                </ul>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }
}
