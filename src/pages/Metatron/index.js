import React from "react";
import { Admin,
         Datagrid,
         Filter,
         List,
         ReferenceField,
         ReferenceInput,
         Resource,
         SelectInput,
         TextField,
         TextInput } from 'react-admin';
import { base_url, fetch_meta } from '../../util/fetch/meta';
import loopbackProvider from '../Admin/loopback-provider';

const dataProvider = loopbackProvider(base_url);

class Metatron extends React.Component {
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
      const { response: library_stats } = await fetch_meta('/libraries/key_count')
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
      const { response: signature_stats } = await fetch_meta('/signatures/key_count')
      const PostFilter = (props) => (
          <Filter {...props}>
              <ReferenceInput label="Library" source="library" reference="libraries" allowEmpty>
                  <SelectInput optionText="meta.Library name" />
              </ReferenceInput>
          </Filter>
      );
      this.setState({
        SignatureList: (props) => (
          <List {...props} filters={<PostFilter />}>
            <Datagrid>
              <TextField
                source="id"
              />
              <ReferenceField source="library" reference="libraries">
                <TextField source="meta.Library name" />
              </ReferenceField>
              {Object.keys(signature_stats).map(function(k){
                console.log(k)
                return(
                  <TextField
                    key={k}
                    source={"meta." + k}
                  />
                );
              })}
            </Datagrid>
          </List>
        )
      })
    })();
    (async () => {
      const { response: entity_stats } = await fetch_meta('/entities/key_count')
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
      <div>
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
      </div>
    )
  }
}

export default Metatron
