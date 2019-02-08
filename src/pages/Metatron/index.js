import React from "react";
import { Admin,
         Datagrid,
         fetchUtils,
         ImageField,
         List,
         ReferenceField,
         Resource,
         TextField,
         AUTH_LOGIN,
         AUTH_LOGOUT,
         AUTH_ERROR,
         AUTH_CHECK } from 'react-admin';
import { base_url, fetch_meta } from '../../util/fetch/meta';
import loopbackProvider from '../Admin/loopback-provider';
import { PostFilter } from './signaturehelper';


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
      status: null,
      controller: null,
      token: null,
    }
    this.filterHandler = this.filterHandler.bind(this);
    this.LibraryList = this.LibraryList.bind(this);
    this.EntityList = this.EntityList.bind(this);
    this.SignatureList = this.SignatureList.bind(this);
    this.httpClient = this.httpClient.bind(this);
    this.authProvider = this.authProvider.bind(this);
    this.dataProvider = loopbackProvider(base_url, this.httpClient);

  }

  // const httpClient = (url, options = {}) => {
  //   if (!options.headers) {
  //       options.headers = new Headers({ Accept: 'application/json' });
  //   }
  //   const token = localStorage.getItem('token');
  //   options.headers.set('Authorization', `Basic ${this.state.token}`);
  //   return fetchUtils.fetchJson(url, options);
  // }

  LibraryList(props) {
    return (
      <List {...props}>
        <Datagrid>
          <TextField
            source="id"
          />
          {Object.keys(this.state.library_stats).map(function(k){
            if (k==="Icon"){
              return(
                <ImageField
                  source={"meta." + k}
                  title={k}
                  label={k}
                />
              )
            }
            else{
              return(
                <TextField
                  key={k}
                  label={k.replace(/_/g," ")}
                  source={"meta." + k}
                />
              )
            }
          })}
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
            <TextField source="meta.Library_name" />
          </ReferenceField>
          {this.state.signature_stats.map((k) => (
            <TextField
              key={k}
              label={k.replace(/_/g," ")}
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
              label={k.replace(/_/g," ")}
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
      if(this.state.controller !== null) {
        this.state.controller.abort()
      }
      try {
        const controller = new AbortController()
        this.setState({
          status: 'Searching...',
          controller: controller,
        })
        const uid = Object.values(e).slice(0,36).join('')
        const headers = {'Authorization': `Basic ${this.state.token}`}
        const { response: signature_stats} = await fetch_meta('/libraries?filter={"where":{"id":"'+uid+'"}}',
                                                              undefined,
                                                              controller.signal,
                                                              headers)
        console.log(signature_stats)
        this.setState({
          // signature_stats: signature_stats,
          signature_stats: signature_stats[0]["Signature_keys"],
        });
      } catch(e) {
        if(e.code !== DOMException.ABORT_ERR) {
          this.setState({
            status: e + ''
          })
        }
      }
  }

  componentDidMount() {
    (async () => {
      const headers = {'Authorization': `Basic ${this.state.token}`}
      const { response: library_stats } = await fetch_meta('/libraries/key_count',
                                                            undefined,
                                                            undefined,
                                                            headers)
      this.setState({
        LibNum: library_stats.$validator,
        library_stats: library_stats,
      })
      // this.get_libraries(library_stats)
    })();
    (async () => {
      const uid = "308de661-d3e2-11e8-8fe6-787b8ad942f3"
      const headers = {'Authorization': `Basic ${this.state.token}`}
      const { response: signature_stats} = await fetch_meta('/libraries?filter={"where":{"id":"'+uid+'"}}',
                                                            undefined,
                                                            undefined,
                                                            headers)
      // console.log(signature_stats)
      // if("error" in signature_stats){
      //   const err = new Error(signature_stats["error"]["name"]);
      //   return err
      // }
      this.setState({
        // SignatureList: (props) => <SigList {...props} signature_stats={signature_stats} />,
        signature_stats: signature_stats[0]["Signature_keys"],
      })
      // this.get_signatures(signature_stats)
    })();
    (async () => {
      const headers = {'Authorization': `Basic ${this.state.token}`}
      const { response: entity_stats } = await fetch_meta('/entities/key_count',
                                                            undefined,
                                                            undefined,
                                                            headers)
      this.setState({
        // SignatureList: (props) => <SigList {...props} signature_stats={signature_stats} />,
        entity_stats: entity_stats,
      })
      // this.get_entities(entity_stats)
    })();
  }
  httpClient(url, options = {}) {
    if (this.state.controller!== null)
      options["signal"] = this.state.controller.signal

    if (options.headers === undefined)
      options.headers = new Headers({ Accept: 'application/json' });
    
    options.headers.set('Authorization', `Basic ${this.state.token}`);
    
    return fetchUtils.fetchJson(url, options);
  }

  async authProvider(type, params) {
    if (type === AUTH_LOGIN) {
      this.setState({ token: Buffer.from(`${params.username}:${params.password}`).toString('base64') })
      return Promise.resolve();
    }else if (type === AUTH_LOGOUT) {
        this.setState({ token: null })
        return Promise.resolve();
    }else if (type === AUTH_ERROR) {
        if (params === 'DOMException: "The operation was aborted. "'){
          const status  = params.status;
          this.setState({ token: null })
          return Promise.reject()
        }else
          return Promise.resolve()
    }else if (type === AUTH_CHECK) {
        return this.state.token ? Promise.resolve() : Promise.reject();
    }
    return Promise.reject()
  }

  render() {
    return (
      <Admin dataProvider={this.dataProvider} authProvider={this.authProvider}>
        {this.state.library_stats  === null ? <div /> : (
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
