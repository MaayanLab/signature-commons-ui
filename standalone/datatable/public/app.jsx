import React from 'react'
import {DataTable, ExpandedMeta, ExpandButton} from '../src/index'

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      expanded: false,
      entries: null
    }
  }

  componentDidMount = async () => {
    this.setState({
      entries: await import("./sample.json")
    })
  }

  handleClick = (id) => {
    this.setState({
      expanded: this.state.expanded === id ? null: id
    })
  }

  render = () => {
    if (this.state.entries===null) return <span>Loading...</span>
    const LeftComponents = (data) => ([ {
      component: (props) => (<ExpandButton {...props}/>),
      props: {
        expanded: this.state.expanded,
        ButtonProps: {
          onClick: () => this.handleClick(data.id),
          style:{ minWidth: 5,
                  marginTop: 70,
                  paddingBottom: 0 }
        }
      }
    }
    ])
    const BottomComponents = (data) => ([
      {
        component: (props) => (
          <ExpandedMeta data={data} {...props}/>
        ),
        props: {
          expanded: this.state.expanded == data.id,
          search: ["stat3"]
        }
      },
    ])
    const entries = this.state.entries.map(entry=>(
      {
        ...entry,
        key: entry.data.id,
        LeftComponents: LeftComponents(entry.data),
        BottomComponents: BottomComponents(entry.data),
      }
    ))

    // return (
    //   <div>
    //     <InfoCard info={this.state.data.processed}
    //               LeftComponents={LeftComponents}
    //               BottomComponents={BottomComponents}
    //               highlight={["GenBank", "Fasta", "tick"]}
    //     />
    //   </div>
    // )
    return <DataTable entries={entries}/>
  }
}
