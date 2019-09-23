import React from 'react'

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';

import { connect } from "react-redux";

import { findMatchedSchema } from '../../util/objectMatch'
import { makeTemplate } from "../../util/makeTemplate"
import { diffList } from "../../util/helper/misc"

const mapStateToProps = state => {
  const schemas = state.serverSideProps.schemas
  return {
    schemas,
    search: state.search,
    current_table: state.current_table,
    parent_ids_mapping: state.parent_ids_mapping,
    selected_parent_ids: state.selected_parent_ids[state.current_table],
    table_count: state.table_count,
    table_count_per_parent: state.table_count_per_parent,
    categories: state.parents_mapping,
    completed: state.completed,
    loading: state.loading,
  }
}



class Filter extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      data_count: undefined,
      selected: undefined
    }
  }

  updateDataCounts = () => {
    const {schemas,
      table_count_per_parent,
      current_table,
      selected_parent_ids,
      parent_ids_mapping} = this.props
    const counts = table_count_per_parent[current_table]
    let data_count
    let selected = {}
    if (counts!==undefined){
      data_count = Object.entries(counts).map(([key, val])=>{
        const item = parent_ids_mapping[current_table][key] // returns db entry
        const matched_schema = findMatchedSchema(item, schemas)
        let name_prop = Object.keys(matched_schema.properties).filter(prop=> matched_schema.properties[prop].name)
        let name
        if (name_prop.length > 0){
          name = makeTemplate(matched_schema.properties[name_prop[0]].text, item)
        } else {
          console.warn('source of resource name is not defined, using either Name or ids')
          library_name = resource.meta['Name'] || item.id
        }
        selected[key] = selected_parent_ids.indexOf(key)>-1
        return({
            id: key,
            count: val.count,
            name,
        })}).filter(item=>item.count>0)
      this.setState({
        data_count,
        selected : {
          ...selected,
        }
      })
    }else {
      this.setState({
        data_count: undefined,
        selected: selected_parent_ids
      })
    }
  }

  componentDidMount = () => {
    this.updateDataCounts()
  }

  componentDidUpdate = (prevProps) => {
    if (diffList(prevProps.search, this.props.search)){
      this.updateDataCounts()
    }else if (this.props.search.length === 0){
      if (prevProps.loading && !this.props.loading && !prevProps.completed && this.props.completed){
        this.updateDataCounts()
      } 
    }
  }

  toggleSelect = (id) => {
    this.setState(prevState=>({
          selected: {
            ...prevState.selected,
            [id]: !prevState.selected[id]
          }
        }))
  }

  render() {
    if (this.state.data_count === undefined ){
      return(
        <Card style={{
          height: 300,
          width: '100%',
          overflow: "scroll",
        }}>
          <CardContent style={{textAlign: "center"}}>
            <CircularProgress />
          </CardContent>
        </Card>
      )
    }
    const sorted = this.state.data_count.sort((a, b) => b.count - a.count)
    return(
      <Card style={{
        height: 300,
        width: '100%',
        overflow: "scroll",
      }}>
        <CardContent>
          <FormLabel component="legend">{this.props.label}</FormLabel>
          <FormGroup>
            {sorted.map(({id, name, count})=>(
              <FormControlLabel
                control={
                  <Checkbox checked={this.state.selected[id]} onChange={()=>this.toggleSelect(id)} value={id} />
                }
                label={`${name || id} (${count})`}
              />
            ))}
          </FormGroup>
        </CardContent>
      </Card>
    )
  }
}

export default connect(mapStateToProps)(Filter)
