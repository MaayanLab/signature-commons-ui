import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import Switch from '@material-ui/core/Switch';
import InputBase from '@material-ui/core/InputBase';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Set } from 'immutable'

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

export const ChipInput = (props) => {
  const {
    input,
    onSubmit,
    onDelete,
    propsValue,
    setPropsValue,
    ChipInputProps,
    disableMagnify,
    chipRenderer,
    endAdornment,
  } = props
  const [inputValue, setInputValue] = useState("")
  const value = propsValue || inputValue
  const setValue = setPropsValue || setInputValue

  const onKeyPress = (e) => {
    if(e.keyCode == 13){
      if (value.trim()){
        onSubmit(value)
        setInputValue("")
      }
    }else if(e.keyCode == 8 && value === ""){
      if (input.length>0){
        if (value == "") {
          const v = input[input.length-1]
          onDelete(v)
        }
      }
    }
  }

  const onBlur = (e) => {
    if (value.trim()){
      onSubmit(value)
    }
    setInputValue("")
  }

  const onChange = (e) => {
    setValue(e.target.value)
  }

  return (
    <div style={{
            display: 'flex',
            flexFlow: 'row wrap',
            overflow: "visible",
            ...(((ChipInputProps || {}).divProps || {}).style || {})
          }}
    >
      <InputBase
        id="input-with-icon-textfield"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyPress}
        onBlur={onBlur}
        // onFocus={onFocus}
        startAdornment={
            input.length === 0 && !disableMagnify ?
            <span style={{opacity: 0.5}} 
              className="mdi mdi-magnify mdi-24px"
            />:
            chipRenderer({...props})
        }
        endAdornment={endAdornment}
        fullWidth={input.length === 0}
        inputProps={input.length === 0 ? {style: {width: '80%'}}: {style: {width: 'auto'}}}
        {...((ChipInputProps || {}).inputProps || {})}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          overflow: "auto",
          minHeight: 40,
          ...(((ChipInputProps || {}).inputProps || {}).style || {})
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
  value: PropTypes.string,
}

ChipInput.defaultProps = {
  chipRenderer: defaultChipRenderer,
}

