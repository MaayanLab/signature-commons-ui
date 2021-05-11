import React from 'react'
import PropTypes from 'prop-types'
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import { InputBase } from '@material-ui/core';

const all_chip_props = {
  "or": {
    background: "#ffecb3",
    avatar: "#ffe082",
    icon: "mdi-equal-box mdi-rotate-90"
  },
  "|": {
    background: "#ffecb3",
    avatar: "#ffe082",
    icon: "mdi-equal-box mdi-rotate-90"
  },
  "!": {
    background: "#ffcdd2",
    avatar: "#ef9a9a",
    icon: "mdi-code-not-equal"
  }, 
  "-": {
    background: "#ffcdd2",
    avatar: "#ef9a9a",
    icon: "mdi-code-not-equal"
  },
}

const defaultChipProps = {
  icon: "mdi-code-equal",
  background: "#e0e0e0",
  avatar: "#bdbdbd"
}

export const defaultChipRenderer = ({input, onDelete}) => {
  const chips = []
  for (const i of input){
    const tokens = i.split(" ");
    let chip_props = all_chip_props[tokens[0]]
    let search_term
    if (typeof chip_props!=="undefined"){
      search_term = tokens.slice(1,).join(" ")
    }else {
      search_term = i
      chip_props = defaultChipProps
    }
    chips.push(
      <Chip
        avatar={<Avatar style={{background:chip_props.avatar,
                                width:25,
                                height:25,
                                }}>
                  <span className={`mdi mdi-18px ${chip_props.icon}`}/>
                </Avatar>}
        label={search_term}
        key={i}
        style={{background: chip_props.background,
                margin: 2,
                maxWidth: 300,
              }}
        onDelete={()=>onDelete(i)}
      />
    )

  }
  return chips
}

export class ChipInput extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      value: "",
    }
  }

  onKeyPress = (e) => {
    if(e.keyCode == 13){
      if (this.state.value.trim()){
        const value = this.state.value
        this.props.onSubmit(value)
      }
      this.setState((prevState) =>({
        value: "",
      }))
    }else if(e.keyCode == 8 && this.state.value === ""){
      if (this.props.input.length>0){
        const value = this.props.input[this.props.input.length-1]
        this.props.onDelete(value)
      }
    }
  }

  onBlur = (e) => {
    if (this.state.value.trim()){
      const value = this.state.value
      this.props.onSubmit(value)
      this.setState({
        value: "",
      })
    } else {
      this.setState({
        value: "",
      })
    }
  }

  onChange = (e) => {
    this.setState({
      value: e.target.value,
    })
  }

  render = () => (
    <div style={{
            display: 'flex',
            flexFlow: 'row wrap',
            ...(((this.props.ChipInputProps || {}).divProps || {}).style || {})
          }}
    >
      <InputBase
        id="input-with-icon-textfield"
        value={this.state.value}
        onChange={this.onChange}
        onKeyDown={this.onKeyPress}
        onBlur={this.onBlur}
        startAdornment={
            this.props.input.length === 0 && !this.props.disableMagnify ?
            <span style={{opacity: 0.5}} 
              className="mdi mdi-magnify mdi-24px"
            />:
            <React.Fragment>
              {this.props.chipRenderer({...this.props})}
            </React.Fragment>
        }
        fullWidth={this.props.input.length === 0}
        inputProps={this.props.input.length === 0 ? {style: {width: '80%'}}: {style: {width: 'auto'}}}
        {...((this.props.ChipInputProps || {}).inputProps || {})}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          minHeight: 40,
          ...(((this.props.ChipInputProps || {}).inputProps || {}).style || {})
        }}
      />
    </div>
  )
}

// Type annotations for your component's properties
ChipInput.propTypes = {
  chipRenderer: PropTypes.func,
  input: PropTypes.array,
  onDelete: PropTypes.func,
  onSubmit: PropTypes.func,
  ChipInputProps: PropTypes.object,
  disableMagnify: PropTypes.bool,
}

ChipInput.defaultProps = {
  chipRenderer: defaultChipRenderer
}

