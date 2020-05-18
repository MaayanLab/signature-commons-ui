import React from 'react'
import TextFieldSuggest from '../src/index'

const sample_data = {
  STAT3: ["STAT4"],
  STAT2: ["STAT1", "STAT4",],
}



export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
        id: 5,
        input: [
            {
                label: "STAT3",
                type: "valid",
                chipProps: {
                    style: {
                        background: "#BFE1BF"
                    }
                },
                id: 1
            },
            {
                label: "STAT4",
                type: "suggestions",
                suggestions: [
                    "STAT3",
                    "STAT2"
                ],
                id: 2
            },
            {
                label: "STTA4",
                type: "invalid",
                id: 3
            },
            {
                label: "STTA4",
                type: "loading",
                id: 4
            },
            {
                label: "STTA4",
                type: "disabled",
                id: 5
            }
        ]
    }
  }

  onAdd = (value) => {
    let type = "loading"
    const suggestions = []
    for (const [k,v] of Object.entries(sample_data)){
      if (value===k){
        type = "valid"
        break
      } else if (v.indexOf(value)>-1){
        suggestions.push(k)
      }
    }
    if (type!=="valid"){
      if (suggestions.length>0) type = "suggestions"
      else type = "invalid"
    }
    const input = [...this.state.input,
      { label: value,
        type,
        id: this.state.id+1,
        suggestions: type==="suggestions"? suggestions: undefined
      }
    ]
    this.setState({input, id: this.state.id+1})
  }

  onDelete = (value) => {
    const input = this.state.input.filter(v=>v.id!==value.id)
    this.setState({input})
  }

  onSuggestionClick = (value, clicked) => {
    console.log(value)
    console.log(clicked)
    const input = this.state.input.map(v=>{
      if (v.id === value.id){
        return ({
          label: clicked,
          type: "valid",
          id: v.id
        })
      }else return v
    })
    this.setState({input})
  }

  render = () => {
    return (
    <div>
        <TextFieldSuggest input={this.state.input}
          onAdd={this.onAdd}
          onDelete={this.onDelete}
          onSuggestionClick={this.onSuggestionClick}
        />
    </div>
    )
  }
}
