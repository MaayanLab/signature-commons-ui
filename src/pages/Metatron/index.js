import React from "react";
import { Admin,
         Datagrid,
         Filter,
         LinearProgress,
         List,
         ReferenceField,
         ReferenceInput,
         Resource,
         SelectInput,
         TextField } from 'react-admin';
import { base_url, fetch_meta } from '../../util/fetch/meta';
import loopbackProvider from '../Admin/loopback-provider';
import { PostFilter } from './signaturehelper';

const dataProvider = loopbackProvider(base_url);

class Metatron extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      LibraryList: null,
      EntityList: null,
      SignatureList: null,
      library_stats: null,
      entity_stats: null,
      signature_stats: null,
      LibNum: 140,
    }
    this.filterHandler = this.filterHandler.bind(this);
    this.LibraryList = this.LibraryList.bind(this);
    this.EntityList = this.EntityList.bind(this);
    this.SignatureList = this.SignatureList.bind(this);
  }

  LibraryList(props) {
    return (
      <List {...props}>
        <Datagrid>
          <TextField
            source="id"
          />
          {Object.keys(this.state.library_stats).map((k) => (
            <TextField
              key={k}
              source={"meta." + k}
            />
          ))}
        </Datagrid>
      </List>
    )
  }

  SignatureList(props){
    return(
      <List
        {...props}
        filters={
          <PostFilter
            libnum={this.state.LibNum}
            filterhandler={this.filterHandler}
          />
        }
        filterDefaultValues={{"library": "308de661-d3e2-11e8-8fe6-787b8ad942f3"}}
      > 
        <Datagrid>
          <TextField
            source="id"
          />
          <ReferenceField source="library" reference="libraries">
            <TextField source="meta.Library name" />
          </ReferenceField>
          {Object.keys(this.state.signature_stats).map((k) => (
            <TextField
              key={k}
              label={k}
              source={"meta." + k}
            />
          ))}
        </Datagrid> 
      </List>
    )
  }

  EntityList(props) {
    return (
      <List {...props}>
        <Datagrid>
          <TextField
            source="id"
          />
          {Object.keys(this.state.entity_stats).map((k) => (
            <TextField
              key={k}
              source={"meta." + k}
            />
          ))}
        </Datagrid>
      </List>
    )
  }

  // get_signatures(signature_stats) {
  //   if(this.state.LibNum){
  //     this.setState({
  //         SignatureList:<Datagrid>
  //                         <TextField
  //                           source="id"
  //                         />
  //                         <ReferenceField source="library" reference="libraries">
  //                           <TextField source="meta.Library name" />
  //                         </ReferenceField>
  //                         {Object.keys(signature_stats).map((k) => (
  //                           <TextField
  //                             key={k}
  //                             label={k}
  //                             source={"meta." + k}
  //                           />
  //                         ))}
  //                       </Datagrid>
  //       })
  //   }
  // }

  async filterHandler(e){
      // console.log(e)
      // this.setState({
      //   SignatureList: <LinearProgress />
      // }, async () =>{
      //   const uid = Object.values(e).slice(0,36).join('')
      //   const { response: signature_stats} = await fetch_meta('/signatures/key_count?filter={"where":{"library":"'+uid+'"}}')
      //   this.get_signatures(signature_stats)
      // });
      const uid = Object.values(e).slice(0,36).join('')
      const { response: signature_stats} = await fetch_meta('/signatures/key_count?filter={"where":{"library":"'+uid+'"}}')
      this.setState({
        // signature_stats: signature_stats,
        signature_stats: signature_stats,
      });
  }

  componentDidMount() {
    (async () => {
      const { response: library_stats } = await fetch_meta('/libraries/key_count')
      this.setState({
        LibNum: library_stats.$validator,
        library_stats: library_stats,
      })
      // this.get_libraries(library_stats)
    })();
    (async () => {
      const uid = "308de661-d3e2-11e8-8fe6-787b8ad942f3"
      const { response: signature_stats} = await fetch_meta('/signatures/key_count?filter={"where":{"library":"'+uid+'"}}')
      const SigList = this.SigList
      this.setState({
        // SignatureList: (props) => <SigList {...props} signature_stats={signature_stats} />,
        signature_stats: signature_stats,
      })
      // this.get_signatures(signature_stats)
    })();
    (async () => {
      const { response: entity_stats } = await fetch_meta('/entities/key_count')
      this.setState({
        // SignatureList: (props) => <SigList {...props} signature_stats={signature_stats} />,
        entity_stats: entity_stats,
      })
      // this.get_entities(entity_stats)
    })();
  }

  render() {
    return (
      <Admin dataProvider={dataProvider}>
        {this.state.library_stats === null ? <div /> : (
          <Resource
            name="libraries"
            list={this.LibraryList}
          />
        )}
        {this.state.signature_stats === null ? <div /> : (
          <Resource
            name="signatures"
            list={this.SignatureList}
          />
        )}
        {this.state.entity_stats === null ? <div /> : (
          <Resource
            name="entities"
            list={this.EntityList}
          />
        )}
      </Admin>
    )
  }
}

export default Metatron
