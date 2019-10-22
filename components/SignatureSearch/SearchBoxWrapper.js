import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'

import ChipInput from 'material-ui-chip-input'
import { Set } from 'immutable'
import { connect } from "react-redux";
import Grid from '@material-ui/core/Grid';
import Chip from '@material-ui/core/Chip'
import { withStyles } from '@material-ui/core/styles'
import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { findSignatures, updateInput } from "../../util/redux/actions";
import GenesetSearchBox from "./GenesetSearchBox";

const example_geneset = 'UTP14A S100A6 SCAND1 RRP12 CIAPIN1 ADH5 MTERF3 SPR CHMP4A UFM1 VAT1 HACD3 RFC5 COTL1 NPRL2 TRIB3 PCCB TLE1 CD58 BACE2 KDM3A TARBP1 RNH1 CHAC1 MBNL2 VDAC1 TES OXA1L NOP56 HAT1 CPNE3 DNMT1 ARHGAP1 VPS28 EIF2S2 BAG3 CDCA4 NPDC1 RPS6KA1 FIS1 SYPL1 SARS CDC45 CANT1 HERPUD1 SORBS3 MRPS2 TOR1A TNIP1 SLC25A46 MAL EPCAM HDAC6 CAPN1 TNRC6B PKD1 RRS1 HP ANO10 CEP170B IDE DENND2D CAMK2B ZNF358 RPP38 MRPL19 NUCB2 GNAI1 LSR ADGRE2 PKMYT1 CDK5R1 ABL1 PILRB AXIN1 FBXL8 MCF2L DBNDD1 IGHMBP2 WIPF2 WFS1 OGFOD2 MAPK1IP1L COL11A1 REG3A SERPINA1 MYCBP2 PIGK TCAP CRADD ELK1 DNAJB2 ZBTB16 DAZAP1 MAPKAPK2 EDRF1 CRIP1 UCP3 AGR2 P4HA2'.split(' ').join('\n')
const example_geneset_weighted = 'SERPINA3,1.0 CFL1,-1.0 FTH1,0.5 GJA1,-0.5 HADHB,0.25 LDHB,-0.25 MT1X,0.4 RPL21,0.3 RPL34,0.2 RPL39,0.1 RPS15,-0.1 RPS24,-0.2 RPS27,-0.3 RPS29,-0.4 TMSB4XP8,-0.6 TTR,-0.7 TUBA1B,-0.8 ANP32B,-0.9 DDAH1,0.9 HNRNPA1P10,0.8'.split(' ').join('\n')
const example_geneset_up = 'UTP14A S100A6 SCAND1 RRP12 CIAPIN1 ADH5 MTERF3 SPR CHMP4A UFM1 VAT1 HACD3 RFC5 COTL1 NPRL2 TRIB3 PCCB TLE1 CD58 BACE2 KDM3A TARBP1 RNH1 CHAC1 MBNL2 VDAC1 TES OXA1L NOP56 HAT1 CPNE3 DNMT1 ARHGAP1 VPS28 EIF2S2 BAG3 CDCA4 NPDC1 RPS6KA1 FIS1 SYPL1 SARS CDC45 CANT1 HERPUD1 SORBS3 MRPS2 TOR1A TNIP1 SLC25A46'.split(' ').join('\n')
const example_geneset_down = 'MAL EPCAM HDAC6 CAPN1 TNRC6B PKD1 RRS1 HP ANO10 CEP170B IDE DENND2D CAMK2B ZNF358 RPP38 MRPL19 NUCB2 GNAI1 LSR ADGRE2 PKMYT1 CDK5R1 ABL1 PILRB AXIN1 FBXL8 MCF2L DBNDD1 IGHMBP2 WIPF2 WFS1 OGFOD2 MAPK1IP1L COL11A1 REG3A SERPINA1 MYCBP2 PIGK TCAP CRADD ELK1 DNAJB2 ZBTB16 DAZAP1 MAPKAPK2 EDRF1 CRIP1 UCP3 AGR2 P4HA2'.split(' ').join('\n')

const style = {
  chiplabel: {
    maxWidth: 100,
    overflow: 'hidden',
    fontSize: 10,
    textOverflow: 'ellipsis',
    '&:hover': {
      overflow: "visible",
    }
  },
  card: {
    overflow: 'auto',
    maxHeight: 200,
    marginBottom: 10,
  }
}

const mapStateToProps = state => {
  return { input: state.signature_input,
    loading: state.loading_signature,
  }
};

function mapDispatchToProps(dispatch) {
  return {
    // matchEntity: input => dispatch(matchEntity(input)),
    // initializeSignatureSearch: input => dispatch(initializeSignatureSearch(input)),
    submit: input => dispatch(findSignatures(input)),
    updateInput: input => dispatch(updateInput(input)),
    // updateResolvedEntities: input => dispatch(updateResolvedEntities(input)),
  };
}


class SearchBoxWrapper extends React.Component {
  constructor(props) {
    super(props)
  }

  toggleInput = (type) =>{
    if (type === "Overlap") {
      this.props.updateInput({
          type,
          geneset: ""
        })
      this.props.history.push({
        pathname: "/SignatureSearch/Overlap",
      })
    }else if (type==="Rank") {
      this.props.updateInput({
          type,
          up_geneset: "",
          down_geneset: "",
        })
      this.props.history.push({
        pathname: "/SignatureSearch/Rank",
      })
    }else {
      this.props.history.push("/not-found")
    }
  }


  componentDidUpdate(prevProps){
    if (prevProps.loading===true && this.props.loading===false){
      const pathname = this.props.location.pathname
      const id = this.props.input.id
      this.props.history.push(`${pathname}/${id}`)
    }
  }

  render() {
    return (
      <div className="row">
        <Switch>
          <Route path="/SignatureSearch/:type" component={(props)=>
            <GenesetSearchBox {...props} 
            input={this.props.input}
            updateInput={this.props.updateInput}
            toggleInput={this.toggleInput}
            submit={this.props.submit}
            />} 
          />
          <Route path="/SignatureSearch" component={(props)=><Redirect to='/SignatureSearch/Overlap' />} />
        </Switch>
        <div className="col s12 center">
          <div className="input-field">
            <a
              className="chip grey white-text waves-effect waves-light"
              onClick={() => {
                const input = {
                  type: 'Overlap',
                  geneset: this.props.ui_values.LandingText.geneset_terms || example_geneset,
                }
                this.props.updateInput(input)
                this.props.history.push({
                  pathname: "/SignatureSearch/Overlap",
                })
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
                this.props.updateInput(input)
                this.props.history.push({
                  pathname: "/SignatureSearch/Overlap",
                })
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
                this.props.updateInput(input)
                this.props.history.push({
                  pathname: "/SignatureSearch/Rank",
                })
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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(style)(SearchBoxWrapper))
