import React from 'react'
import RunningSum, { dataFromResults } from '../src/index'
import dedent from 'dedent'
import { saveSvgAsPng } from 'save-svg-as-png'

export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      up_entities: dedent(`
        c9835606-ed1c-11e8-b2da-787b8ad942f3
        c99a42c6-ed1c-11e8-82db-787b8ad942f3
        c9899aa8-ed1c-11e8-acc5-787b8ad942f3
        c9899b86-ed1c-11e8-8003-787b8ad942f3
        c98628a2-ed1c-11e8-a85f-787b8ad942f3
        c9899a28-ed1c-11e8-95cb-787b8ad942f3
        c98a7038-ed1c-11e8-b9c2-787b8ad942f3
        c9a5025e-ed1c-11e8-9361-787b8ad942f3
        c9951f1a-ed1c-11e8-8d7d-787b8ad942f3
        c989992e-ed1c-11e8-ac33-787b8ad942f3
        c9878738-ed1c-11e8-8760-787b8ad942f3
        c9873c2e-ed1c-11e8-ab85-787b8ad942f3
        c9875ec0-ed1c-11e8-bf3f-787b8ad942f3
        c9871b36-ed1c-11e8-81dc-787b8ad942f3
        c9ab5dd4-ed1c-11e8-b86d-787b8ad942f3
        c98b334c-ed1c-11e8-a9fb-787b8ad942f3
        c981913e-ed1c-11e8-82a0-787b8ad942f3
        c98466e8-ed1c-11e8-afa8-787b8ad942f3
        c986291a-ed1c-11e8-bf40-787b8ad942f3
        c9a72e62-ed1c-11e8-aec2-787b8ad942f3
        c98f321c-ed1c-11e8-927a-787b8ad942f3
        c99a1240-ed1c-11e8-9b8c-787b8ad942f3
        c9865598-ed1c-11e8-8c34-787b8ad942f3
        c986c97e-ed1c-11e8-9f8b-787b8ad942f3
        c9830d66-ed1c-11e8-b20d-787b8ad942f3
        c985680c-ed1c-11e8-a805-787b8ad942f3
        c9948dfa-ed1c-11e8-8b37-787b8ad942f3
        c9849d48-ed1c-11e8-9657-787b8ad942f3
        c98f4434-ed1c-11e8-a562-787b8ad942f3
        c98b0d22-ed1c-11e8-85a7-787b8ad942f3
        c98651c6-ed1c-11e8-9b84-787b8ad942f3
        c98f4498-ed1c-11e8-8f43-787b8ad942f3
      `),
      down_entities: dedent(`
        c98ac4e8-ed1c-11e8-b479-787b8ad942f3
        c983f9ec-ed1c-11e8-9598-787b8ad942f3
        c981cf82-ed1c-11e8-a389-787b8ad942f3
        c98ef270-ed1c-11e8-9782-787b8ad942f3
        c99bbbc2-ed1c-11e8-bf8d-787b8ad942f3
        c9872928-ed1c-11e8-aff2-787b8ad942f3
        c98a7326-ed1c-11e8-b04b-787b8ad942f3
        c992a708-ed1c-11e8-b0d8-787b8ad942f3
        c983184c-ed1c-11e8-937d-787b8ad942f3
        c98fdc1c-ed1c-11e8-adfb-787b8ad942f3
        c99c0d7a-ed1c-11e8-b2e6-787b8ad942f3
        c9a091f6-ed1c-11e8-9149-787b8ad942f3
        c9843e86-ed1c-11e8-a94e-787b8ad942f3
        c9909562-ed1c-11e8-bb05-787b8ad942f3
        c98b7a5a-ed1c-11e8-ba3f-787b8ad942f3
        c9a24a9e-ed1c-11e8-96a4-787b8ad942f3
        c98c43e8-ed1c-11e8-9d49-787b8ad942f3
        c98d4290-ed1c-11e8-9ed6-787b8ad942f3
        c9a1cbc0-ed1c-11e8-a663-787b8ad942f3
        c9a216e8-ed1c-11e8-968e-787b8ad942f3
        c9a69542-ed1c-11e8-aa17-787b8ad942f3
        c9906452-ed1c-11e8-962c-787b8ad942f3
        c98dadde-ed1c-11e8-9e8d-787b8ad942f3
        c9a2971c-ed1c-11e8-b564-787b8ad942f3
        c98b3b8a-ed1c-11e8-a1fb-787b8ad942f3
        c99de276-ed1c-11e8-bed8-787b8ad942f3
        c985c830-ed1c-11e8-870e-787b8ad942f3
        c9a1b498-ed1c-11e8-bae7-787b8ad942f3
        c995d176-ed1c-11e8-8c61-787b8ad942f3
        c993bcc6-ed1c-11e8-8f58-787b8ad942f3
        c99b7978-ed1c-11e8-a685-787b8ad942f3
        c9862e7e-ed1c-11e8-b196-787b8ad942f3      
      `),
      signature: '5cb97774-39fe-429e-ac52-1476378e4247',
    }
  }

  componentDidMount = () => {
    this.displaySignature('5cb97774-39fe-429e-ac52-1476378e4247')()
  }

  changeEvt = (state) => (evt) => this.setState({ [state]: evt.target.value })

  displaySignature = (signature) => async () => {
    console.log('displaySignature')
    const queryd = { 'entities' : [], 'signatures': [signature], 'database': 'lincs_clue' }
    const dat = JSON.stringify(queryd)

    const up = this.state.up_entities.split(/( +|\n)/)
    const down = this.state.down_entities.split(/( +|\n)/)

    const result = await (await fetch(
        'https://amp.pharm.mssm.edu/enrichmentapi/api/v1/fetch/rank',
        {
          method: 'POST',
          body: dat,
        }
    )).json()

    this.setState({
      data: dataFromResults({
        input: {
          up, down,
        },
        output: {
          entities: result.entities,
          ranks: result.signatures[0].ranks,
        },
      }),
    })
  }

  generatePlot = () => {
    if (this.svgRef !== undefined) {
      saveSvgAsPng(this.svgRef, 'enrichment.png', { scale: 10, backgroundColor: '#FFFFFF' })
    }
  }

  getTwoTailed = async (up, down, database) => {
    const queryd = {
      up_entities: up,
      down_entities: down,
      database: database,
    }
    const dat = JSON.stringify(queryd)
    const result = await (await fetch(
        'https://amp.pharm.mssm.edu/enrichmentapi/api/enrich/ranktwosided',
        {
          method: 'POST',
          body: dat,
        }
    )).json()
    console.log('Two sided')
    console.log(result)
  }

  get_svg_ref = (svgRef) => this.svgRef = svgRef

  render = () => (
    <div>
      {this.state.data !== undefined ? (
        <RunningSum
          data={this.state.data}
          svgRef={this.get_svg_ref}
        />
      ) : null}
      <ul>
        <li>
          <a onClick={this.generatePlot}>Download</a>
        </li>
        <li>
          <a onClick={this.displaySignature('5cb97774-39fe-429e-ac52-1476378e4247')}>Signature example 1</a><br />
        </li>
        <li>
          <a onClick={this.displaySignature('6344ef4b-b785-42b4-b08a-8ca40587c6a1')}>Signature example 2</a><br />
        </li>
        <li>
          <a onClick={this.displaySignature('0798a6d5-c502-426c-9241-a3ba7515a9bf')}>Signature example 3</a><br />
        </li>
        <li>
          <a onClick={this.displaySignature('bccb3edd-55f4-4792-a191-ccd176e69f05')}>Signature example 4</a><br />
        </li>
      </ul>
      <textarea
        value={this.state.up_entities}
        onChange={this.changeEvt('up_entities')}
      />
      <textarea
        value={this.state.down_entities}
        onChange={this.changeEvt('down_entities')}
      />
      <input
        value={this.state.signature}
        onChange={this.changeEvt('signature')}
      />
    </div>
  )
}
