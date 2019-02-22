import React from "react";
import { Redirect } from 'react-router';
import { Admin,
         ChipField,
         Datagrid,
         fetchUtils,
         List,
         ReferenceField,
         Resource,
         TextField,
         UrlField,
         AUTH_LOGIN,
         AUTH_LOGOUT,
         AUTH_ERROR,
         AUTH_CHECK } from 'react-admin';
import { base_url, fetch_meta } from '../../util/fetch/meta';
import loopbackProvider from '../Admin/loopback-provider';
import { BooleanField,
         PostFilter,
         LibraryAvatar,
         Description,
         SplitChip } from './signaturehelper';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';



class Metatron extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      library_stats: null,
      entity_stats: null,
      signature_stats: null,
      LibNum: 140,
      status: null,
      controller: null,
      token: null,
      uid: "308de661-d3e2-11e8-8fe6-787b8ad942f3",
      hash: window.location.hash,
    }
    this.filterHandler = this.filterHandler.bind(this);
    this.hashChangeHandler = this.hashChangeHandler.bind(this);
    this.LibraryList = this.LibraryList.bind(this);
    this.EntityList = this.EntityList.bind(this);
    this.SignatureList = this.SignatureList.bind(this);
    this.httpClient = this.httpClient.bind(this);
    this.filterForm = this.filterForm.bind(this);
    this.authProvider = this.authProvider.bind(this);
    this.Dashboard = this.Dashboard.bind(this);
    this.NotFound = this.NotFound.bind(this);
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

  filterForm(props){
    if(this.state.token===null){
      return false
    }else{
      return(
        <PostFilter
          libnum={this.state.LibNum}
          filterhandler={this.filterHandler}
        />
      )
    }
  }


  LibraryList(props) {
    return (
      <List {...props}>
        <Datagrid>
          <LibraryAvatar
            source={"meta.Library_name"}
            title={"Library"}
            label={"Library"}
            textAlign="center"
          />
          <TextField
            source="id"
          />
          {Object.keys(this.state.library_stats).map(function(k){
            if (k.includes("Link") || k.includes("URL")){
              return(
                <UrlField key={k}
                  label={k.replace(/_/g," ")}
                  source={"meta." + k}
                />
              )
            }
            else if(k==="Readout" || k==="Assay"){
              return(
                <ChipField
                  key={k}
                  label={k.replace(/_/g," ")}
                  source={"meta." + k}
                />
              )
            }
            else if(k==="Weighted"){
              return(
                <BooleanField
                  key={k}
                  label={k.replace(/_/g," ")}
                  field={k}
                  TrueValue={"True"}
                />
              )
            }
            else if (k=="Perturbation_Type" || k=="Organism"){
              return(
                <SplitChip
                  key={k}
                  label={k.replace(/_/g," ")}
                  source={"meta." + k}
                  field={k}
                />
              )
            }
            else if (k!=="Icon" && k!=="Library_name" && k!=="Description" && k!=="Spec" && k!=="$validator"){
              return(
                <TextField
                  key={k}
                  label={k.replace(/_/g," ")}
                  source={"meta." + k}
                />
              )
            }
          })}
          <Description
            source={"meta.Description"}
            title={"Description"}
            label={"Description"}
          />
        </Datagrid>
      </List>
    )
  }

  SignatureList(props){
    return(
      <List
        {...props}
        filters={this.filterForm(props)}
        filterDefaultValues={{"library": this.state.uid}}
      > 
        <Datagrid>
          <TextField
            source="id"
          />
          <ReferenceField source="library" reference="libraries" linkType={false}>
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

  Dashboard(props) {
    return(
      <Card>
        <CardHeader title="Welcome to the administration" />
        <CardContent>Let's start exploring</CardContent>
      </Card>
    )
  }

  NotFound(props) {
    if(this.state.token){
      return(
        <Card>
          <CardHeader title="Oop! I don't know what you are looking for" />
          <CardContent>Check your link, please.</CardContent>
        </Card>
      )
    }else{
      return <Redirect to='/' />
    }
  }

  async filterHandler(e){
      // console.log(e)
      // this.setState({
      //   SignatureList: <LinearProgress />
      // }, async () =>{
      //   const uid = Object.values(e).slice(0,36).join('')
      //   const { response: signature_stats} = await fetch_meta('/signatures/key_count?filter={"where":{"library":"'+uid+'"}}')
      //   this.get_signatures(signature_stats)
      // });
      // console.log(window.location.hash)
      // console.log(this.state.hash)
      if(this.state.controller !== null && decodeURI(window.location.hash) !== this.state.hash) {
        if(this.state.hash.includes("/signatures")){}
        this.setState({
          hash: decodeURI(window.location.hash)
        })
        this.state.controller.abort()
      }
      try {
        const controller = new AbortController()
        this.setState({
          status: 'Searching...',
          controller: controller,
        })
        let uid = ""
        if(e.hasOwnProperty("uid")){
          uid = e.uid
        }else{
          uid = Object.values(e).slice(0,36).join('')
        }
        const headers = {'Authorization': `Basic ${this.state.token}`}
        const { response: signature_stats} = await fetch_meta('/libraries?filter={"where":{"id":"'+uid+'"}}',
                                                              undefined,
                                                              controller.signal,
                                                              headers)
        this.setState({
          // signature_stats: signature_stats,
          signature_stats: signature_stats[0]["Signature_keys"],
          uid: uid
        });
      } catch(e) {
        if(e.code !== DOMException.ABORT_ERR) {
          this.setState({
            status: e + ''
          })
        }
      }
  }

  hashChangeHandler(){
    console.log(decodeURI(window.location.hash))
    const hash = decodeURI(window.location.hash)
    this.setState({
      hash: hash
    })
    if (hash.includes('/signatures?filter={"library"')){
      const hashparts = hash.split('"')
      if(hashparts.length > 4){
        const uid = hashparts[3]
        // const params = hashparts[4].split("&")
        // const page = params.filter((l)=>(l.includes("page")))[0].split("=")[1]
        // this.setState({
        //   urlpage: page
        // })
        this.filterHandler(uid)
      }
    }
  }

  async fetch_libstats() {
    const headers = {'Authorization': `Basic ${this.state.token}`}
    const { response: library_stats } = await fetch_meta('/libraries/key_count',
                                                          undefined,
                                                          undefined,
                                                          headers)
    this.setState({
      LibNum: library_stats.$validator,
      library_stats: library_stats,
    })
  }

  async fetch_sigstats() {
    const headers = {'Authorization': `Basic ${this.state.token}`}
    const { response: signature_stats} = await fetch_meta('/libraries?filter={"where":{"id":"'+this.state.uid+'"}}',
                                                          undefined,
                                                          undefined,
                                                          headers)
    this.setState({
      signature_stats: signature_stats[0]["Signature_keys"],
    })
  }

  async fetch_entitystats(){
    const headers = {'Authorization': `Basic ${this.state.token}`}
    const { response: entity_stats } = await fetch_meta('/entities/key_count',
                                                        undefined,
                                                        undefined,
                                                        headers)
    this.setState({
      entity_stats: entity_stats,
    })
  }

  componentDidMount() {
    window.addEventListener("hashchange", this.hashChangeHandler);
    (async () => {
      if (this.state.token){
        this.fetch_libstats()
      }
      // this.get_libraries(library_stats)
    })();
    (async () => {
      // const headers = {'Authorization': `Basic ${this.state.token}`}
      if (this.state.token){
        this.fetch_sigstats()
      }
    })();
    (async () => {
      if (this.state.token){
        this.fetch_entitystats()
      }
    })();
  }
  httpClient(url, options = {}) {
    if(!(options.hasOwnProperty("method"))){
      console.log(url)
      const link = decodeURI(url).split("%2C")
      const url_params = link.filter((l)=> (l.includes("skip")||l.includes("limit")))
                             .map((l)=>(l.split("%3A")[1]));
      const page = (url_params[0]/url_params[1]) + 1
      this.setState({
        apipage: page
      })
    }

    console.log(options)
    if (this.state.controller!== null)
      options["signal"] = this.state.controller.signal

    if (options.headers === undefined)
      options.headers = new Headers({ Accept: 'application/json' });
    
    options.headers.set('Authorization', `Basic ${this.state.token}`);
    
    return fetchUtils.fetchJson(url, options);
  }

  async authProvider(type, params) {
    if (type === AUTH_LOGIN) {
      const token = Buffer.from(`${params.username}:${params.password}`).toString('base64')
      const headers = {'Authorization': `Basic ${token}`}
      const { response: auth_res} = await fetch_meta('/libraries?filter={"where":{"id":"'+this.state.uid+'"}}',
                                                     undefined, undefined, headers)
      if ((auth_res.hasOwnProperty("error")) && (auth_res.error.statusCode >= 400 && auth_res.error.statusCode < 500)){
        return Promise.reject()
      }else{
        this.setState({ token: token })
        // Load column names
        if(this.state.library_stats===null){
          this.fetch_libstats()
        }
        if(this.state.signature_stats===null){
          this.fetch_sigstats()
        }
        if(this.state.entity_stats===null){
          this.fetch_entitystats()
        }
        return Promise.resolve();
      }
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
        <Admin dataProvider={this.dataProvider}
               authProvider={this.authProvider}
               dashboard={this.Dashboard}
               catchAll={this.NotFound}
        >
          {this.state.library_stats===null ? <div/>:
            <Resource
              name="libraries"
              list={this.LibraryList}
            />
          }
          {this.state.signature_stats===null ? <div/>:
            <Resource
              name="signatures"
              list={this.SignatureList}
            />
          }
          {this.state.entity_stats===null ? <div/>:
            <Resource
              name="entities"
              list={this.EntityList}
            />
          }
        </Admin>
      )
  }
}

export default Metatron
