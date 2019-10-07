import React from 'react'
import { call } from '../../util/call'

const example_geneset = 'UTP14A S100A6 SCAND1 RRP12 CIAPIN1 ADH5 MTERF3 SPR CHMP4A UFM1 VAT1 HACD3 RFC5 COTL1 NPRL2 TRIB3 PCCB TLE1 CD58 BACE2 KDM3A TARBP1 RNH1 CHAC1 MBNL2 VDAC1 TES OXA1L NOP56 HAT1 CPNE3 DNMT1 ARHGAP1 VPS28 EIF2S2 BAG3 CDCA4 NPDC1 RPS6KA1 FIS1 SYPL1 SARS CDC45 CANT1 HERPUD1 SORBS3 MRPS2 TOR1A TNIP1 SLC25A46 MAL EPCAM HDAC6 CAPN1 TNRC6B PKD1 RRS1 HP ANO10 CEP170B IDE DENND2D CAMK2B ZNF358 RPP38 MRPL19 NUCB2 GNAI1 LSR ADGRE2 PKMYT1 CDK5R1 ABL1 PILRB AXIN1 FBXL8 MCF2L DBNDD1 IGHMBP2 WIPF2 WFS1 OGFOD2 MAPK1IP1L COL11A1 REG3A SERPINA1 MYCBP2 PIGK TCAP CRADD ELK1 DNAJB2 ZBTB16 DAZAP1 MAPKAPK2 EDRF1 CRIP1 UCP3 AGR2 P4HA2'.split(' ').join('\n')
const example_geneset_weighted = 'SERPINA3,1.0 CFL1,-1.0 FTH1,0.5 GJA1,-0.5 HADHB,0.25 LDHB,-0.25 MT1X,0.4 RPL21,0.3 RPL34,0.2 RPL39,0.1 RPS15,-0.1 RPS24,-0.2 RPS27,-0.3 RPS29,-0.4 TMSB4XP8,-0.6 TTR,-0.7 TUBA1B,-0.8 ANP32B,-0.9 DDAH1,0.9 HNRNPA1P10,0.8'.split(' ').join('\n')
const example_geneset_up = 'UTP14A S100A6 SCAND1 RRP12 CIAPIN1 ADH5 MTERF3 SPR CHMP4A UFM1 VAT1 HACD3 RFC5 COTL1 NPRL2 TRIB3 PCCB TLE1 CD58 BACE2 KDM3A TARBP1 RNH1 CHAC1 MBNL2 VDAC1 TES OXA1L NOP56 HAT1 CPNE3 DNMT1 ARHGAP1 VPS28 EIF2S2 BAG3 CDCA4 NPDC1 RPS6KA1 FIS1 SYPL1 SARS CDC45 CANT1 HERPUD1 SORBS3 MRPS2 TOR1A TNIP1 SLC25A46'.split(' ').join('\n')
const example_geneset_down = 'MAL EPCAM HDAC6 CAPN1 TNRC6B PKD1 RRS1 HP ANO10 CEP170B IDE DENND2D CAMK2B ZNF358 RPP38 MRPL19 NUCB2 GNAI1 LSR ADGRE2 PKMYT1 CDK5R1 ABL1 PILRB AXIN1 FBXL8 MCF2L DBNDD1 IGHMBP2 WIPF2 WFS1 OGFOD2 MAPK1IP1L COL11A1 REG3A SERPINA1 MYCBP2 PIGK TCAP CRADD ELK1 DNAJB2 ZBTB16 DAZAP1 MAPKAPK2 EDRF1 CRIP1 UCP3 AGR2 P4HA2'.split(' ').join('\n')

export default class GenesetSearchBox extends React.Component {
  constructor(props) {
    super(props)
  }

  isEmpty = () => {
    if (this.props.input === undefined) return true
    if (this.props.input.type === 'Overlap') {
      if (this.props.input.geneset === undefined) return true
      if (this.props.input.geneset === '') return true
    } else if (this.props.input.type === 'Rank') {
      if (this.props.input.up_geneset === '') return true
      if (this.props.input.up_geneset === undefined) return true
      if (this.props.input.down_geneset === '') return true
      if (this.props.input.down_geneset === undefined) return true
    }
    return false
  }

  geneset = (props) => (
    <div className="row">
      <div className="col s12 center">
        <div className="switch">
          <label style={{ color: '#FFF',
            fontWeight: 'bold' }}>
            Gene Set or Full Signature
            <input
              type="checkbox"
              checked={false}
              onChange={() => {
                this.props.changeSignatureType('Rank')
              }
              }
            />
            <span className="lever"></span>
            Up and Down Gene Sets
          </label>
        </div>
      </div>
      <div className="col s12">
        <div className="input-field">
          <textarea
            id="geneset"
            placeholder={this.props.ui_values.LandingText.geneset_placeholder || 'Genes that are regulated in signature or overlap with gene set.'}
            style={{
              height: 200,
              overflow: 'auto',
              background: '#f7f7f7',
            }}
            value={this.props.input.geneset}
            onChange={(e) => {
              const input = {
                ...this.props.input,
                geneset: e.target.value,
              }
              this.props.updateSignatureInput(input)
            }}
          ></textarea>
        </div>
      </div>
    </div>
  )

  up_down_geneset = (props) => (
    <div className="row">
      <div className="col s12 center">
        <div className="switch">
          <label style={{ color: '#FFF',
            fontWeight: 'bold' }}>
            Gene Set or Full Signature
            <input
              type="checkbox"
              checked={true}
              onChange={() => {
                this.props.changeSignatureType('Overlap')
              }
              }
            />
            <span className="lever"></span>
            Up and Down Gene Sets
          </label>
        </div>
      </div>
      <div className="col s6">
        <div className="input-field">
          <textarea
            id="up_geneset"
            placeholder={this.props.ui_values.LandingText.up_genes_placeholder || 'Genes that are up-regulated in signature or overlap with gene set.'}
            style={{
              height: 200,
              overflow: 'auto',
              background: '#f7f7f7',
            }}
            value={this.props.input.up_geneset}
            onChange={(e) => {
              const input = {
                ...this.props.input,
                up_geneset: e.target.value,
              }
              this.props.updateSignatureInput(input)
            }}
          ></textarea>
        </div>
      </div>
      <div className="col s6">
        <div className="input-field">
          <textarea
            id="down_geneset"
            placeholder={this.props.ui_values.LandingText.down_genes_placeholder || 'Genes that are down-regulated in signature or overlap with gene set.'}
            style={{
              height: 200,
              overflow: 'auto',
              background: '#f7f7f7',
            }}
            value={this.props.input.down_geneset}
            onChange={(e) => {
              const input = {
                ...this.props.input,
                down_geneset: e.target.value,
              }
              this.props.updateSignatureInput(input)
            }}
          ></textarea>
        </div>
      </div>
    </div>
  )

  render() {
    return (
      <div className="row">
        {this.props.input.type === 'Overlap' ? this.geneset() : this.up_down_geneset()}
        <div className="col s12 center">
          <button
            className={'btn waves-effect waves-light' + (this.isEmpty() ? ' disabled' : '')} type="submit" name="action"
            onClick={call(this.props.onSubmit, this.props.input)}
          >
            { this.props.status==="Searching" ? 
                <React.Fragment>
                  Searching &nbsp;
                  <i className="mdi mdi-spin mdi-loading" />
                </React.Fragment>: 
                <React.Fragment>
                  Search
                  <i className="material-icons right">send</i>
                </React.Fragment>
            }

          </button>
          <br /><br />
        </div>
        <div className="col s12 center">
          <div className="input-field">
            <a
              className="chip grey white-text waves-effect waves-light"
              onClick={() => {
                const input = {
                  type: 'Overlap',
                  geneset: this.props.ui_values.LandingText.geneset_terms || example_geneset,
                }
                this.props.updateSignatureInput(input)
              }}
            >
              Example Crisp Gene Set
            </a>

            <a
              className="chip grey white-text waves-effect waves-light"
              onClick={() => {
                const input = {
                  type: 'Overlap',
                  geneset: this.props.ui_values.LandingText.weighted_geneset_terms || example_geneset_weighted,
                }
                this.props.updateSignatureInput(input)
              }}
            >
              Example Weighted Signature
            </a>

            <a
              className="chip grey white-text waves-effect waves-light"
              onClick={() => {
                const input = {
                  type: 'Rank',
                  up_geneset: this.props.ui_values.LandingText.up_set_terms || example_geneset_up,
                  down_geneset: this.props.ui_values.LandingText.down_set_terms || example_geneset_down,
                }
                this.props.updateSignatureInput(input)
              }}
            >
              Example Up and Down Sets
            </a>
          </div>
        </div>
      </div>
    )
  }
}
