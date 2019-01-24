import React from "react";
import { Admin,
         AutocompleteInput,
         Datagrid,
         Filter,
         List,
         ReferenceField,
         ReferenceInput,
         Resource,
         SelectInput,
         UrlField,
         TextField } from 'react-admin';
import { base_url, fetch_meta } from '../../util/fetch/meta';
import loopbackProvider from '../Admin/loopback-provider';
import filterHeaders from './filter-headers';

const dataProvider = loopbackProvider(base_url);
const dataProviderMod = filterHeaders(dataProvider)

class Metatron extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      LibraryList: null,
      SignatureList: null,
      EntityList: null,
      LibSelected: null,
    }
    this.filterHandler = this.filterHandler.bind(this);
  }

  filterHandler(e){
    (async () => {
      const uid = Object.values(e).slice(0,36).join('')
      const { response: signature_stats } = await fetch_meta('/signatures/key_count?filter={"where":{"library":"'+uid+'"}}')
      const { response: library_stats } = await fetch_meta('/libraries/key_count')
      const PostFilter = (props) => (
          <Filter {...props}>
              <ReferenceInput label="Library" source="library" reference="libraries" perPage={library_stats.$validator} onChange={this.filterHandler} allowEmpty alwaysOn>
                  <SelectInput optionText="meta.Library name"/>
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
                return(
                  <TextField
                    key={k}
                    label={k}
                    source={"meta." + k}
                  />
                );
              })}
            </Datagrid>
          </List>
        )
      })
    })();
  }

  componentDidMount() {
    const IDField = function({ record = {} }){
      const link = '/metatron#/signatures?filter={"library"%3A"'+ record.id +'"%7D&order=DESC&page=1&perPage=10&sort=id'
      return(<a href={link}>{record.id}</a>);
    };
    IDField.defaultProps = { label: 'ID' };

    (async () => {
      const { response: library_stats } = await fetch_meta('/libraries/key_count')
      this.setState({
        LibraryList: (props) => (
          <List {...props}>
            <Datagrid>
              <IDField
                source="id"
              />
              <TextField
                key="Library name"
                label="Library name"
                source={"meta.Library name"}
              />
              {Object.keys(library_stats).map(function(k){
                if (k!=="Library name"){
                return(
                  <TextField
                    key={k}
                    label={k}
                    source={"meta." + k}
                  />
                )
              }
              })}
            </Datagrid>
          </List>
        )
      })
    })();
    (async () => {
      const { response: signature_stats } = await fetch_meta('/signatures/key_count')
      const { response: library_stats } = await fetch_meta('/libraries/key_count')
      const PostFilter = (props) => (
          <Filter {...props}>
              <ReferenceInput label="Library" source="library" reference="libraries" perPage={library_stats.$validator} onChange={this.filterHandler} allowEmpty alwaysOn>
                  <SelectInput optionText="meta.Library name"/>
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
                return(
                  <TextField
                    key={k}
                    label={k}
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
                  label={k}
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
      <Admin dataProvider={dataProviderMod}>
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

export default Metatron
