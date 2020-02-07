import { iframeResize } from 'iframe-resizer'

export default class IFrame extends React.Component {
  componentDidMount() {
    iframeResize({ log: false, checkOrigin: false }, `#${this.props.id}`)
  }
  render() {
    return (
      <iframe {...this.props} />
    )
  }
}