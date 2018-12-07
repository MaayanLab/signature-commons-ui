import React from "react";
import ReactJson from 'react-json-view';
import ReactLoading from 'react-loading';
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { fetch_meta } from '../../util/fetch/meta';

export default class DBCK extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      library_dbck: null,
      signature_dbck: null,
      entity_dbck: null,
    }
  }
  componentDidMount() {
    (async () => {
      this.setState({
        library_dbck: await fetch_meta('/libraries/dbck', {filter: {limit: 10}}),
      })
    })();
    (async () => {
      this.setState({
        signature_dbck: await fetch_meta('/signatures/dbck', {filter: {limit: 10}}),
      })
    })();
    (async () => {
      this.setState({
        entity_dbck: await fetch_meta('/entities/dbck', {filter: {limit: 10}}),
      })
    })();
  }
  render() {
    return (
      <div className="root">
        <Header />
        <main>
          <fieldset>
            <legend>
              Library dbck
            </legend>
            <div style={{float: 'left', width: '49%', height: '150px', overflow: 'auto'}}>
              {this.state.library_dbck === null ? (
                <ReactLoading type="spokes" color="#000" />
              ) : (
                <ReactJson
                  src={JSON.parse(JSON.stringify(this.state.library_dbck))}
                  collapsed={2}
                />
              )}
            </div>
          </fieldset>
          <fieldset>
            <legend>
              Signature dbck
            </legend>
            <div style={{float: 'left', width: '49%', height: '150px', overflow: 'auto'}}>
              {this.state.signature_dbck === null ? (
                <ReactLoading type="spokes" color="#000" />
              ) : (
                <ReactJson
                  src={JSON.parse(JSON.stringify(this.state.signature_dbck))}
                  collapsed={2}
                />
              )}
            </div>
          </fieldset>
          <fieldset>
            <legend>
              Entity dbck
            </legend>
            <div style={{float: 'left', width: '49%', height: '150px', overflow: 'auto'}}>
              {this.state.entity_dbck === null ? (
                <ReactLoading type="spokes" color="#000" />
              ) : (
                <ReactJson
                  src={JSON.parse(JSON.stringify(this.state.entity_dbck))}
                  collapsed={2}
                />
              )}
            </div>
          </fieldset>
        </main>
        <Footer />
      </div>
    )
  }
}
