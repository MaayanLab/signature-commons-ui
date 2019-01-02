import { Map, Set } from 'immutable';
import M from "materialize-css";
import React from "react";
import { Highlight } from '../../components/Highlight';
import { fetch_data } from "../../util/fetch/data";
import { fetch_meta, fetch_meta_post } from "../../util/fetch/meta";

const example_geneset = 'SERPINA3 CFL1 FTH1 GJA1 HADHB LDHB MT1X RPL21 RPL34 RPL39 RPS15 RPS24 RPS27 RPS29 TMSB4XP8 TTR TUBA1B ANP32B DDAH1 HNRNPA1P10'.split(' ').join('\n')

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
          'P-Value': sig.meta['p-value'],
          'Odds Ratio': sig.meta.oddsratio,
          'Set Size': sig.meta.setsize,
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
          'P-Value': sig.meta['p-value'],
          'Odds Ratio': sig.meta.oddsratio,
          'Set Size': sig.meta.setsize,
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
          'P-Value': sig.meta['p-value'],
          'Odds Ratio': sig.meta.oddsratio,
          'Set Size': sig.meta.setsize,
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
      results: Map(),
      geneset: '',
      time: 0,
      count: 0,
      key_count: {},
      value_count: {},
      matched_entities: [],
      mismatched_entities: [],
      status: null,
      controller: null,
    }

    this.submit = this.submit.bind(this)
    this.fetch_values = this.fetch_values.bind(this)
  }

  componentDidMount() {
     M.AutoInit();
  }

  componentDidUpdate() {
    M.AutoInit();
    M.updateTextFields();
  }

  async submit() {
    if(this.state.controller !== null) {
      this.state.controller.abort()
    }
    try {
      const controller = new AbortController()
      this.setState({
        status: 'Fetching entities...',
        controller: controller,
      })

      let entities = Set(this.state.geneset.split(/[ \n,;]+/))
      let entity_ids = Set()

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
        const matched_entities = Set.intersect(
          Set([entity.meta.Name]),
          entities,
        )

        entities = entities.subtract(matched_entities)
        entity_ids = entity_ids.add(entity.id)
      }

      this.setState({
        status: 'Gathering libraries...',
        matched_entities: entity_ids,
        mismatched_entities: entities,
      })

      const libraries = await fetch_meta_post('/libraries/find', {}, controller.signal)

      this.setState({
        status: 'Enriching...',
        libraries: libraries,
      })

      for(const library of libraries) {
        const enriched = await fetch_data('/enrich/overlap', {
          entities: entity_ids,
          signatures: this.props.cart,
          database: library.database || 'enrichr', // TODO: ensure this is present in the metadata
          // database: 'enrichr',
          // database: 'creeds'
          // database: 'lincs' (rank)
        }, controller.signal)

        const enriched_signatures_meta = await fetch_meta_post('/signatures/find', {
          filter: {
            where: {
              id: {
                inq: Object.keys(enriched.results).map((k) => ({...enriched.results[k], id: k})).sort(
                  (a, b) => {
                    if (a['p-value'] < b['p-value'])
                      return -1
                    else if (a['p-value'] > b['p-value'])
                      return 1
                    else
                      return 0
                  }
                ).slice(1, 10).map((k) => k.id)
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
                ...enriched.results[signature.id],
              },
            }
          ]), []
        ).sort(
          (a, b) => {
            if(a.meta['p-value'] < b.meta['p-value'])
              return -1
            else if(a.meta['p-value'] > b.meta['p-value'])
              return 1
            else
              return 0
          }
        )
        this.setState((prevState) => ({
          results: prevState.results.set(
            library.id,
            {
              library: library,
              signatures: enriched_signatures,
            }
          )
        }))
      }

      this.setState({
        status: '',
        time: Date.now() - start,
      })
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

  render_libraries(results) {
    return results === undefined || results.count() <= 0 ? (
      <div className="center">
        {this.state.status === null ? null : 'No results.'}
      </div>
    ) : (
      <div className="col s12">
        {results.toSeq().map((result) => (
          <div className="card">
            <div className="card-title">
              {result.library.meta.name}
            </div>
            <div className="card-content">
              {this.render_signatures(result.signatures)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  render_signatures(results) {
    return results === undefined || results.length <= 0 ? (
      <div className="center">
        {this.state.status === null ? null : 'No results.'}
      </div>
    ) : (
      <div className="col s12">
        TODO: Bar Graph
        {results}
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
              <div className="col s2">&nbsp;</div>
              <div className="col s8">
                <div className="input-field">
                  <textarea
                    id="geneset"
                    placeholder="Genes that are up-regulated in signature or overlap with gene-set."
                    style={{
                      height: 200,
                      overflow: 'auto',
                    }}
                    value={this.state.geneset}
                    onChange={(e) => this.setState({geneset: e.target.value})}
                  ></textarea>
                </div>
              </div>
              <div className="col s2">&nbsp;</div>
              <div className="col s12">
                <div className="input-field">
                  <div
                    className="chip waves-effect waves-light"
                    onClick={() => this.setState({
                      geneset: example_geneset,
                    }, () => this.submit())}
                  >Example Geneset</div>
                </div>
                <button className="btn waves-effect waves-light" type="submit" name="action">Search
                  <i className="material-icons right">send</i>
                </button>
              </div>
            </form>
          </div>

          <div className="col s12 center">
            {this.state.status === null ? null : (
              <span className="grey-text">
                About {this.state.count} results ({this.state.time/1000} seconds)
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
            ) : this.render_libraries(this.state.results)}
          </div>
          {this.state.results.length < 10 || this.state.status !== '' ? null : (
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
    );
  }
}
