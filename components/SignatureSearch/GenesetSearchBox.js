import React from 'react'
import { Redirect } from 'react-router-dom'
import { call } from '../../util/call'
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import Switch from '@material-ui/core/Switch';
import TextFieldSuggest from '@dcic/signature-commons-ui-components-text-field-suggest'

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
  card: {
    overflow: 'auto',
    maxHeight: 200,
    marginBottom: 10,
  },
  submit: {
    background: theme.palette.defaultButton.main,
    color: theme.palette.defaultButton.contrastText,
    '&:hover': {
      background: theme.palette.defaultButton.dark,
    },
    '&:disabled': {
      background: theme.palette.defaultButton.disabled,
    },
  }
})

const mapStateToProps = (state) => {
  return {
    loading: state.loading_signature,
    ui_values: state.ui_values,
  }
}

const Geneset = (props) => (
  <Grid container
    alignItems={'center'}
    spacing={32}
  >
    <Grid item xs={12}>
      { props.ui_values.overlap_search && props.ui_values.rank_search ?
          <div className="switch">
            <label style={{ color: '#FFF',
              fontWeight: 'bold' }}>
                {props.ui_values.geneset_switch}
              <Switch
                checked={false}
                onChange={() => {
                    props.toggleInput('Rank')
                  }
                }
                value="sigsearch"
                color="secondary"
              />
                {props.ui_values.up_down_switch}
            </label>
          </div>
        : null
      }
    </Grid>
    <Grid item xs={12}>
      <TextFieldSuggest 
        id="entities"
        placeholder={props.ui_values.geneset_placeholder}
        chipInputProps={{
          style: {
            height: 200,
            width: "100%",
            overflow: 'auto',
            background: '#f7f7f7',
            padding: "20px 10px"
          },
          blurBehavior: 'add'
        }}
        input={props.input.entities}
        onAdd={value=>{
          const input = {
            ...props.input,
            unprocessed_entities: [...props.input.unprocessed_entities, ...value.trim().split(/\s/)]
          }
          props.updateInput(input)
        }}
        onDelete={value=>{
          const input = {
            ...props.input,
            entities: props.input.entities.filter(v=>v.id!==value.id)
          }
          props.updateInput(input)
        }}
        onSuggestionClick={(value, clicked)=>{
          const entities = props.input.entities.map(v=>{
            if (v.id === value.id){
              return (clicked)
            }else return v
          })
          const input = {
            ...props.input,
            entities
          }
          props.updateInput(input)
        }}
      />
    </Grid>
  </Grid>
)

const UpDownGeneset = (props) => (
  <Grid container
    alignItems={'center'}
    spacing={32}
  >
    <Grid item xs={12}>
      {props.ui_values.overlap_search && props.ui_values.rank_search ?
        <div className="col s12 center">
          <div className="switch">
            <label style={{ color: '#FFF',
              fontWeight: 'bold' }}>
                {props.ui_values.geneset_switch}
              <Switch
                checked={true}
                onChange={() => {
                  props.toggleInput('Overlap')
                }}
                value="sigsearch"
                color="primary"
              />
                {props.ui_values.up_down_switch}
            </label>
          </div>
        </div>: null
      }
    </Grid>
    <Grid item sm={6} xs={12}>
      <TextFieldSuggest 
        id="up_entities"
        placeholder={props.ui_values.geneset_placeholder}
        chipInputProps={{
          style: {
            height: 200,
            width: "100%",
            overflow: 'auto',
            background: '#f7f7f7',
            padding: "20px 10px"
          },
          blurBehavior: 'add'
        }}
        input={props.input.up_entities}
        onAdd={value=>{
          const input = {
            ...props.input,
            unprocessed_up_entities: [...props.input.unprocessed_up_entities, ...value.trim().split(/\s/)]
          }
          props.updateInput(input)
        }}
        onDelete={value=>{
          const input = {
            ...props.input,
            up_entities: props.input.up_entities.filter(v=>v.id!==value.id)
          }
          props.updateInput(input)
        }}
        onSuggestionClick={(value, clicked)=>{
          const up_entities = props.input.up_entities.map(v=>{
            if (v.id === value.id){
              return (clicked)
            }else return v
          })
          const input = {
            ...props.input,
            up_entities
          }
          props.updateInput(input)
        }}
      />
    </Grid>
    <Grid item sm={6} xs={12}>
      <TextFieldSuggest 
        id="down_entities"
        placeholder={props.ui_values.geneset_placeholder}
        chipInputProps={{
          style: {
            height: 200,
            width: "100%",
            overflow: 'auto',
            background: '#f7f7f7',
            padding: "20px 10px"
          },
          blurBehavior: 'add'
        }}
        input={props.input.down_entities}
        onAdd={value=>{
          const input = {
            ...props.input,
            unprocessed_down_entities: [...props.input.unprocessed_down_entities, ...value.trim().split(/\s/)]
          }
          props.updateInput(input)
        }}
        onDelete={value=>{
          const input = {
            ...props.input,
            down_entities: props.input.down_entities.filter(v=>v.id!==value.id)
          }
          props.updateInput(input)
        }}
        onSuggestionClick={(value, clicked)=>{
          const down_entities = props.input.down_entities.map(v=>{
            if (v.id === value.id){
              return (clicked)
            }else return v
          })
          const input = {
            ...props.input,
            down_entities
          }
          props.updateInput(input)
        }}
      />
    </Grid>
  </Grid>
  // <div className="row">
  //   {props.ui_values.overlap_search && props.ui_values.rank_search ?
  //     <div className="col s12 center">
  //       <div className="switch">
  //         <label style={{ color: '#FFF',
  //           fontWeight: 'bold' }}>
  //             {props.ui_values.geneset_switch}
  //           <Switch
  //             checked={true}
  //             onChange={() => {
  //               props.toggleInput('Overlap')
  //             }}
  //             value="sigsearch"
  //             color="primary"
  //           />
  //             {props.ui_values.up_down_switch}
  //         </label>
  //       </div>
  //     </div>: null
  //   }
  //   <div className="col s6">
  //     <div className="input-field">
  //       <textarea
  //         id="up_geneset"
  //         placeholder={props.ui_values.up_genes_placeholder}
  //         style={{
  //           height: 200,
  //           width:"100%",
  //           overflow: 'auto',
  //           background: '#f7f7f7',
  //         }}
  //         value={props.input.up_geneset}
  //         onChange={(e) => {
  //           const input = {
  //             ...props.input,
  //             up_geneset: e.target.value,
  //           }
  //           props.updateInput(input)
  //         }}
  //       ></textarea>
  //     </div>
  //   </div>
  //   <div className="col s6">
  //     <div className="input-field">
  //       <textarea
  //         id="down_geneset"
  //         placeholder={props.ui_values.down_genes_placeholder || 'Genes that are down-regulated in signature or overlap with gene set.'}
  //         style={{
  //           height: 200,
  //           overflow: 'auto',
  //           background: '#f7f7f7',
  //         }}
  //         value={props.input.down_geneset}
  //         onChange={(e) => {
  //           const input = {
  //             ...props.input,
  //             down_geneset: e.target.value,
  //           }
  //           props.updateInput(input)
  //         }}
  //       ></textarea>
  //     </div>
  //   </div>
  // </div>
)

const SearchBox = (props) => {
  if (props.input.type === 'Overlap') {
    return (<Geneset {...props}/>)
  } else if (props.input.type === 'Rank') {
    return (<UpDownGeneset {...props}/>)
  } else {
    return <Redirect to="/not-found" />
  }
}

class GenesetSearchBox extends React.Component {
  // componentDidMount = () => {
  //   if (this.props.location.state!==undefined &&
  //     this.props.location.state.input!==undefined) {
  //     this.props.updateInput(this.props.location.state.input)
  //   }else {
  //     this.toggleInput(this.props.match.params.type)
  //   }
  // }

  // componentDidUpdate = (prevProps, prevState) => {
  //   const old_type = prevProps.match.params.type
  //   const current_type = this.props.match.params.type
  //   const old_state = prevProps.location.state
  //   const current_state = this.props.location.state
  //   if (current_state!==undefined && current_state.input!==undefined){
  //     console.log(current_state)
  //     console.log(old_state)
  //     if (old_state === undefined || old_state.input === undefined){
  //       this.props.updateInput(current_state.input)
  //     }else if (old_state.input.type!==current_state.input.type){
  //       this.props.updateInput(current_state.input)
  //     }else if (current_state.input.type === "Overlap" &&
  //       current_state.input.geneset !== old_state.input.geneset){
  //       console.log("here")
  //       this.props.updateInput(current_state.input)
  //     }else if (current_state.input.type === "Rank" &&
  //       (current_state.input.up_geneset !== old_state.input.up_geneset ||
  //        current_state.input.down_geneset !== old_state.input.down_geneset)){
  //       this.props.updateInput(current_state.input)
  //     }
  //   }else if (old_type !== current_type){
  //     if (this.props.location.state!==undefined &&
  //       this.props.location.state.input!==undefined) {
  //       this.props.updateInput(this.props.location.state.input)
  //     }else {
  //       this.toggleInput(this.props.match.params.type)
  //     }
  //   }
  // }


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

  componentDidMount = () => {
    if (this.props.input.type!==this.props.match.params.type){
      this.props.toggleInput(this.props.match.params.type)
    }
  }

  render() {
    return (
      <Grid container
        alignItems={'center'}
        spacing={32}
      >
        <Grid item xs={12}>
          <SearchBox {...this.props} />
        </Grid>
        <Grid item xs={12}>
          <Button
            className={this.props.classes.submit}
            variant="contained"
            disabled={this.isEmpty() || this.props.loading} 
            type="submit"
            name="action"
            onClick={call(this.props.submit, this.props.input)}
          >
            { this.props.loading ?
                <React.Fragment>
                  Searching &nbsp;
                  <i className="mdi mdi-spin mdi-loading" />
                </React.Fragment> :
                <React.Fragment>
                  Search
                  <i className="material-icons right">send</i>
                </React.Fragment>
            }

          </Button>
          <br /><br />
        </Grid>
      </Grid>
    )
  }
}

export default connect(mapStateToProps)(withStyles(style)(GenesetSearchBox))
