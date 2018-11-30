import React from "react";
import { Admin, Datagrid, List, Resource, TextField } from 'react-admin';
import { fetch_meta } from '../../util/fetch/meta';
import loopbackProvider from './loopback-provider';

const base_url = 'http://amp.pharm.mssm.edu/signature-commons-metadata-api';
const dataProvider = loopbackProvider(base_url);

class AdminView extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      LibraryList: null,
      SignatureList: null,
      EntityList: null,
    }
  }

  componentDidMount() {
    (async () => {
      const library_stats = await fetch_meta('/libraries/key_count')
      this.setState({
        LibraryList: (props) => (
          <List {...props}>
            <Datagrid>
              <TextField
                source="id"
              />
              {Object.keys(library_stats).map((k) => (
                <TextField
                  key={k}
                  source={"meta." + k}
                />
              ))}
            </Datagrid>
          </List>
        )
      })
    })();
    (async () => {
      const signature_stats = await fetch_meta('/signatures/key_count')
      this.setState({
        SignatureList: (props) => (
          <List {...props}>
            <Datagrid>
              <TextField
                source="id"
              />
              {Object.keys(signature_stats).map((k) => (
                <TextField
                  key={k}
                  source={"meta." + k}
                />
              ))}
            </Datagrid>
          </List>
        )
      })
    })();
    (async () => {
      const entity_stats = await fetch_meta('/entities/key_count')
      this.setState({
        EntityList: (props) => (
          <List {...props}>
            <Datagrid>
              <TextField
                source="id"
              />
              {Object.keys(entity_stats).map((k) => (
                <TextField
                  key={k}
                  source={"meta." + k}
                />
              ))}
            </Datagrid>
          </List>
        )
      })
    })();
  }

  render() {
    return (
      <Admin dataProvider={dataProvider}>
        {this.state.LibraryList === null ? <div /> : (
          <Resource
            name="libraries"
            list={this.state.LibraryList}
          />
        )}
        {this.state.SignatureList === null ? <div /> : (
          <Resource
            name="signatures"
            list={this.state.SignatureList}
          />
        )}
        {this.state.EntityList === null ? <div /> : (
          <Resource
            name="entities"
            list={this.state.EntityList}
          />
        )}
      </Admin>
    )
  }
}

export default AdminView
