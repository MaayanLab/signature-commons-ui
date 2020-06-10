import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import Grid from '@material-ui/core/Grid';
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { findSignatures, updateInput, matchEntity } from '../../util/redux/actions'
import GenesetSearchBox from './GenesetSearchBox'
import Chip from '@material-ui/core/Chip'
import { Set } from 'immutable'

// const example_geneset = 'UTP14A S100A6 SCAND1 RRP12 CIAPIN1 ADH5 MTERF3 SPR CHMP4A UFM1 VAT1 HACD3 RFC5 COTL1 NPRL2 TRIB3 PCCB TLE1 CD58 BACE2 KDM3A TARBP1 RNH1 CHAC1 MBNL2 VDAC1 TES OXA1L NOP56 HAT1 CPNE3 DNMT1 ARHGAP1 VPS28 EIF2S2 BAG3 CDCA4 NPDC1 RPS6KA1 FIS1 SYPL1 SARS CDC45 CANT1 HERPUD1 SORBS3 MRPS2 TOR1A TNIP1 SLC25A46 MAL EPCAM HDAC6 CAPN1 TNRC6B PKD1 RRS1 HP ANO10 CEP170B IDE DENND2D CAMK2B ZNF358 RPP38 MRPL19 NUCB2 GNAI1 LSR ADGRE2 PKMYT1 CDK5R1 ABL1 PILRB AXIN1 FBXL8 MCF2L DBNDD1 IGHMBP2 WIPF2 WFS1 OGFOD2 MAPK1IP1L COL11A1 REG3A SERPINA1 MYCBP2 PIGK TCAP CRADD ELK1 DNAJB2 ZBTB16 DAZAP1 MAPKAPK2 EDRF1 CRIP1 UCP3 AGR2 P4HA2'.split(' ').join('\n')
// const example_geneset_weighted = 'SERPINA3,1.0 CFL1,-1.0 FTH1,0.5 GJA1,-0.5 HADHB,0.25 LDHB,-0.25 MT1X,0.4 RPL21,0.3 RPL34,0.2 RPL39,0.1 RPS15,-0.1 RPS24,-0.2 RPS27,-0.3 RPS29,-0.4 TMSB4XP8,-0.6 TTR,-0.7 TUBA1B,-0.8 ANP32B,-0.9 DDAH1,0.9 HNRNPA1P10,0.8'.split(' ').join('\n')
// const example_geneset_up = 'UTP14A S100A6 SCAND1 RRP12 CIAPIN1 ADH5 MTERF3 SPR CHMP4A UFM1 VAT1 HACD3 RFC5 COTL1 NPRL2 TRIB3 PCCB TLE1 CD58 BACE2 KDM3A TARBP1 RNH1 CHAC1 MBNL2 VDAC1 TES OXA1L NOP56 HAT1 CPNE3 DNMT1 ARHGAP1 VPS28 EIF2S2 BAG3 CDCA4 NPDC1 RPS6KA1 FIS1 SYPL1 SARS CDC45 CANT1 HERPUD1 SORBS3 MRPS2 TOR1A TNIP1 SLC25A46'.split(' ').join('\n')
// const example_geneset_down = 'MAL EPCAM HDAC6 CAPN1 TNRC6B PKD1 RRS1 HP ANO10 CEP170B IDE DENND2D CAMK2B ZNF358 RPP38 MRPL19 NUCB2 GNAI1 LSR ADGRE2 PKMYT1 CDK5R1 ABL1 PILRB AXIN1 FBXL8 MCF2L DBNDD1 IGHMBP2 WIPF2 WFS1 OGFOD2 MAPK1IP1L COL11A1 REG3A SERPINA1 MYCBP2 PIGK TCAP CRADD ELK1 DNAJB2 ZBTB16 DAZAP1 MAPKAPK2 EDRF1 CRIP1 UCP3 AGR2 P4HA2'.split(' ').join('\n')

const style = theme => ({
  chiplabel: {
    'maxWidth': 100,
    'overflow': 'hidden',
    'fontSize': 10,
    'textOverflow': 'ellipsis',
    '&:hover': {
      overflow: 'visible',
    },
  },
  defaultChip: {
    background: theme.palette.defaultChip.main,
    color: theme.palette.defaultChip.contrastText,
    '&:hover': {
      background: theme.palette.defaultChip.dark,
    }
  },
  card: {
    overflow: 'auto',
    maxHeight: 200,
    marginBottom: 10,
  },
  submit: {
    background: theme.palette.defaultButton.main,
    color: theme.palette.defaultButton.contrastText,
  }
})

const mapStateToProps = (state) => {
  return { input: state.signature_input,
    loading: state.loading_signature,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    // matchEntity: input => dispatch(matchEntity(input)),
    // initializeSignatureSearch: input => dispatch(initializeSignatureSearch(input)),
    submit: (input) => dispatch(findSignatures(input)),
    updateInput: (input) => dispatch(updateInput(input)),
    matchEntity: (input) => dispatch(matchEntity(input)),
    // updateResolvedEntities: input => dispatch(updateResolvedEntities(input)),
  }
}


class SearchBoxWrapper extends React.Component {
  constructor(props) {
    super(props)
  }

  toggleInput = (type) => {
    if (this.props.ui_values.overlap_search === true && type === 'Overlap') {
      this.props.updateInput({
        type,
        unprocessed_entities: [],
        entities: []
      })
      this.props.history.push({
        pathname: '/SignatureSearch/Overlap',
      })
    } else if (this.props.ui_values.rank_search === true && type === 'Rank') {
      this.props.updateInput({
        type,
        unprocessed_up_entities: [],
        unprocessed_down_entities: [],
        up_entities: [],
        down_entities: [],
      })
      this.props.history.push({
        pathname: '/SignatureSearch/Rank',
      })
    } else {
      this.props.history.push('/not-found')
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.loading === true && this.props.loading === false) {
      const pathname = this.props.location.pathname
      const id = this.props.input.id
      this.props.history.push(`${pathname}/${id}`)
    }
  }

  get_entities = (unprocessed_entities, entities) => {
    const processed_entities = Set(entities.map(v=>v.label))
    const ents = Set([unprocessed_entities]).subtract(processed_entities).toArray()[0].map((label, id)=>({
      label,
      id: label,
      type: "loading",
    }))
    return [...entities, ...ents]
  }

  updateInput = (input) => {
    /**
     * input = {
     *  type: "Overlap" || "Rank",
     *  unprocessed_entities: ['A','B'],
     *  entities: [{
     *    label: 'D',
     *    type: 'valid',
     *    id: uuid
     *  }]
     * }
     */
    if (input.type === "Overlap"){
      const {unprocessed_entities, entities} = input
      input = {
        ...input,
        unprocessed_entities: [],
        entities: this.get_entities(unprocessed_entities, entities)
      }
    }else if (input.type === "Rank"){
      const {unprocessed_up_entities,
        up_entities,
        unprocessed_down_entities,
        down_entities} = input
      input = {
        ...input,
        unprocessed_up_entities: [],
        unprocessed_down_entities: [],
        up_entities: this.get_entities(unprocessed_up_entities, up_entities),
        down_entities: this.get_entities(unprocessed_down_entities, down_entities)
      }
    }
    this.props.matchEntity(input)
  }

  render() {
    return (
      <Grid container
        alignItems={'center'}
        spacing={32}
      >
        <Grid item xs={12}>
          <Switch>
            <Route path="/SignatureSearch/:type" render={(props) =>
              <GenesetSearchBox {...props}
                input={this.props.input}
                updateInput={this.updateInput}
                toggleInput={this.toggleInput}
                submit={this.props.submit}
              />}
            />
            <Route path="/SignatureSearch" component={(props) => <Redirect to='/SignatureSearch/Overlap' />} />
          </Switch>
        </Grid>
        <Grid item xs={12}>
          <React.Fragment>
            {this.props.ui_values.examples.map(ex=>{
              return (
                <Chip label={ex.label} key={ex.label} className={this.props.classes.defaultChip}
                  onClick={() => {
                    const input = ex.input.type === "Overlap" ? {
                      type: "Overlap",
                      unprocessed_entities: ex.input.geneset.split("\n"),
                      entities: []
                    }:{
                      type: "Rank",
                      unprocessed_up_entities: ex.input.up_geneset.split("\n"),
                      up_entities: [],
                      unprocessed_down_entities: ex.input.down_geneset.split("\n"),
                      down_entities: [],
                    } 
                    this.updateInput(input)
                    this.props.history.push({
                      pathname: `/SignatureSearch/${ex.input.type}`,
                    })
                  }}
                />
              )
            })}
          </React.Fragment>
        </Grid>
    </Grid>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(style)(SearchBoxWrapper))
