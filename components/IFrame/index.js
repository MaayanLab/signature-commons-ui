import { iframeResize } from 'iframe-resizer'

export default class IFrame extends React.Component {
  componentDidMount() {
    iframeResize({ log: false, checkOrigin: false }, `.${this.props.id}`)
  }

  componentDidUpdate() {
    iframeResize({ log: false, checkOrigin: false }, `.${this.props.id}`)
  }

  render() {
    return (
      <iframe 
        style={{
          width: 1,
          minWidth: "100%"
        }}
        key={`${this.props.src}`}
        class={this.props.id}
        {...this.props} />
    )
  }
}