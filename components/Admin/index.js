import React from "react";
import { Redirect } from 'react-router';
import { Admin,
         ArrayField,
         ChipField,
         Datagrid,
         DisabledInput,
         Edit,
         EditButton,
         List,
         LongTextInput,
         ReferenceField,
         Resource,
         SimpleForm,
         SingleFieldList,
         TextField,
         TextInput,
         UrlField,
         AUTH_LOGIN,
         AUTH_LOGOUT,
         AUTH_ERROR,
         AUTH_CHECK,
         GET_ONE } from 'react-admin';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import BlurOn from '@material-ui/icons/BlurOn';
import Fingerprint from '@material-ui/icons/Fingerprint';
import LibraryBooks from '@material-ui/icons/LibraryBooks';

import { base_url, fetch_meta, fetch_creds } from '../../util/fetch/meta';
import { fetchJson } from '../../util/fetch/fetch';

import loopbackProvider from './loopback-provider';
import { BooleanField,
         SignaturePostFilter,
         FullTextFilter,
         LibraryAvatar,
         Description,
         SplitChip,
         TagsField } from './adminhelper';
import { Dashboard } from './dashboard';

import { MyLogin } from './Login.js'


class AdminView extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      library_fields: null,
      entity_fields: null,
      signature_fields: null,
      LibNum: 140,
      LibraryNumber: "Loading...",
      SignatureNumber: "Loading...",
      EntityNumber: "Loading...",
      signature_counts: null,
      signature_allfields: null,
      stats: null,
      libchart: null,
      sigchart: null,
      entchart:null,
      libselected: "Assay",
      sigselected: "Cell_Line",
      entselected:"Taxon_ID",
      status: null,
      controller: null,
      lib_controller: null,
      sig_controller: null,
      ent_controller: null,
      general_controller: null,
      token: null,
      uid: "308de661-d3e2-11e8-8fe6-787b8ad942f3",
      hash: window.location.hash,
    }
    this.filterHandler = this.filterHandler.bind(this);
    this.hashChangeHandler = this.hashChangeHandler.bind(this);
    this.LibraryList = this.LibraryList.bind(this);
    this.LibraryEdit = this.LibraryEdit.bind(this);
    this.EntityList = this.EntityList.bind(this);
    this.EntityEdit = this.EntityEdit.bind(this);
    this.SignatureList = this.SignatureList.bind(this);
    this.SignatureEdit = this.SignatureEdit.bind(this);
    this.httpClient = this.httpClient.bind(this);
    this.filterForm = this.filterForm.bind(this);
    this.authProvider = this.authProvider.bind(this);
    this.NotFound = this.NotFound.bind(this);
    this.handleSelectField = this.handleSelectField.bind(this);
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
        <SignaturePostFilter
          LibNum={this.state.LibNum}
        />
      )
    }
  }

  handleSelectField(e,db){
    const field = e.target.value
    if(db==="Libraries"){
      this.setState({
        libselected: field,
        libchart: null,
      }, () => {
        this.fetch_stats(db)
      })
    }else if(db==="Signatures"){
      this.setState({
        sigselected: field,
        sigchart: null,
      }, () => {
        this.fetch_stats(db)
      })
    }else if(db==="Entities"){
      this.setState({
        entselected: field,
        entchart: null,
      }, () => {
        this.fetch_stats(db)
      })
    }
  }

  LibraryList(props) {
    return (
      <List 
        title="Libraries"
        filters={<FullTextFilter />}
        {...props}>
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
          {Object.keys(this.state.library_fields).map(function(k){
            if (k.includes("Link") || k.includes("URL")){
              return(
                <UrlField key={k}
                  label={k.replace(/_/g," ")}
                  source={"meta." + k}
                />
              )
            }
            else if(["Readout","Assay"].includes(k)){
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
            else if (["Perturbation_Type","Organism"].includes(k)){
              return(
                <SplitChip
                  key={k}
                  label={k.replace(/_/g," ")}
                  source={"meta." + k}
                  field={k}
                />
              )
            }
            else if (!["Icon","Library_name","Description","Spec","$validator"].includes(k)){
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
          <EditButton />
        </Datagrid>
      </List>
    )
  }

  LibraryEdit(props){
    return(
      <Edit {...props}>
        <SimpleForm>
          <DisabledInput source="id" />
          {Object.keys(this.state.library_fields).map(function(k){
            if(k!=="Description"){
              return(
                <TextInput
                  key={k}
                  label={k.replace(/_/g," ")}
                  source={"meta." + k}
                />
              )
            }
          })}
          <LongTextInput
            key={"Description"}
            label={"Description"}
            source={"meta.Description"}
          />
        </SimpleForm>
      </Edit>
    )
  }

  SignatureList(props){
    return(
      <List
        {...props}
        filters={this.filterForm(props)}
        filterDefaultValues={{"library": this.state.uid}}
        title="Signatures"
      > 
        <Datagrid>
          <TextField
            source="id"
          />
          <ReferenceField
            source="library"
            reference="libraries"
            linkType={false}
          >
            <TextField 
              source="meta.Library_name" 
              style={{width: 150}}/>
          </ReferenceField>
          {this.state.signature_fields.map(function(k){
            if(["Gene", "Disease", "Cell_Line", "Tissue", "Small_Molecule"].includes(k)){
              return(
                <ArrayField 
                  key={k}
                  label={k.replace(/_/g," ")}
                  source={"meta." + k}
                >
                  <SingleFieldList>
                    <ChipField source="Name" />
                  </SingleFieldList>
                </ArrayField>
              )
            }else if (["distil_id", "qc_tag", "pert_ids", "ctrl_ids"].includes(k)){
              return(
                <TagsField
                  key={k}
                  label={k.replace(/_/g," ")}
                  source={"meta." + k}
                  field={k}
                />
              )
            }else if(k==="Accession"){
              return(
                <ArrayField 
                  key={k}
                  label={k.replace(/_/g," ")}
                  source={"meta." + k}
                >
                  <SingleFieldList>
                    <ChipField source="ID" />
                  </SingleFieldList>
                </ArrayField>
              )
            }else if(k==="GO"){
              return(
                <ChipField source={"meta." + k + ".Name"} />
              )
            }
            else if(k=="Description"){
              return(
                <Description
                  source={"meta.Description"}
                  title={"Description"}
                  label={"Description"}
                />
              )
            }
            else if(k!=="$validator"){
              return(
                <TextField
                  key={k}
                  label={k.replace(/_/g," ")}
                  source={"meta." + k}
                />
              )
            }
          })}
          <EditButton />
        </Datagrid> 
      </List>
    )
  }

  SignatureEdit(props){
    return(
      <Edit {...props}>
        <SimpleForm>
          <DisabledInput source="id" />
          {this.state.signature_fields.map(function(k){
            if(["distil_id", "qc_tag", "pert_ids", "ctrl_ids",
                "Gene", "Disease", "Cell_Line", "Tissue",
                "Small_Molecule", "Accession"].includes(k)){
              return(
                <LongTextInput
                  key={k}
                  label={k.replace(/_/g," ")}
                  source={"meta." + k}
                  format={v=>JSON.stringify(v, null, 2)}
                  parse={v=>JSON.parse(v)}
                />
              )
            }
            else{
              return(
                <TextInput
                  key={k}
                  label={k.replace(/_/g," ")}
                  source={"meta." + k}
                />
              )
            }
          })}
        </SimpleForm>
      </Edit>
    )
  }

  EntityList(props) {
    return (
      <List 
        title="Entities"
        filters={<FullTextFilter />}
        {...props}>
        <Datagrid>
          <TextField
            source="id"
          />
          {Object.keys(this.state.entity_fields).map(function(k){
            if (k==="Synonyms"){
              return(
                <TagsField
                  key={k}
                  label={k.replace(/_/g," ")}
                  source={"meta." + k}
                  field={k}
                />
              )
            }
            else if(k!=="$validator"){
              return(
                <TextField
                  key={k}
                  source={"meta." + k}
                  label={k.replace(/_/g," ")}
                />
              )
            }
          })}
          <EditButton />
        </Datagrid>
      </List>
    )
  }

  EntityEdit(props){
    return(
      <Edit {...props}>
        <SimpleForm>
          <DisabledInput source="id" />
          {Object.keys(this.state.entity_fields).map(function(k){
            if (k==="Synonyms"){
              return(
                <LongTextInput
                  key={k}
                  label={k.replace(/_/g," ")}
                  source={"meta." + k}
                  format={v=>JSON.stringify(v, null, 2)}
                  parse={v=>JSON.parse(v)}
                />
              )
            }
            else{
              return(
                <TextInput
                  key={k}
                  label={k.replace(/_/g," ")}
                  source={"meta." + k}
                />
              )
            }
          })}
        </SimpleForm>
      </Edit>
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

  async fetch_stats(db){
    let selected_field  = null
    try {
      const stat_controller = new AbortController()
      if(db=="Libraries") {
        selected_field = this.state.libselected
        if( this.state.lib_controller !== null) {
          this.state.lib_controller.abort()
        }
        this.setState({
          lib_controller: stat_controller,
        })
      }else if(db=="Signatures") {
        selected_field = this.state.sigselected
        if (this.state.sig_controller !== null) {
          this.state.sig_controller.abort()
        }
        this.setState({
          sig_controller: stat_controller,
        })
      }else if(db=="Entities") {
        selected_field = this.state.entselected
        if(this.state.ent_controller !== null) {
          this.state.ent_controller.abort()
        }
        this.setState({
          ent_controller: stat_controller,
        })
      }
      
      const headers = {'Authorization': `Basic ${this.state.token}`}
      const url = '/' + db.toLowerCase() +
                  '/value_count?depth=2&filter={"fields":["' +
                  selected_field +'"]}'
      const { response: stats} = await fetch_meta({
        endpoint: url,
        signal: stat_controller.signal,
        headers
      })
      let stat_vals = undefined
      if(["Cell_Line", "Disease", "Gene", "GO", "Phenotype", "Small_Molecule", "Tissue", "Virus"].includes(selected_field)){
        stat_vals = stats[selected_field + ".Name"]
      }else if(selected_field === "Accession"){
        stat_vals = stats[selected_field + ".ID"]
      }else{
        stat_vals = stats[selected_field]
      }
      if(db==="Libraries"){
        this.setState({
          libchart: stat_vals,
        })
      }else if(db==="Signatures"){
        this.setState({
          sigchart: stat_vals,
        })
      }else if(db==="Entities"){
        this.setState({
          entchart: stat_vals,
        })
      }
    } catch(e) {
      if(e.code !== DOMException.ABORT_ERR) {
        this.setState({
          stat_status: ''
        })
      }
    }
  }

  async filterHandler(uid){
      // console.log(e)
      // this.setState({
      //   SignatureList: <LinearProgress />
      // }, async () =>{
      //   const uid = Object.values(e).slice(0,36).join('')
      //   const { response: signature_fields} = await fetch_meta({ endpoint: '/signatures/key_count', body: { filter: { where : { library : uid } } } })
      //   this.get_signatures(signature_fields)
      // });
      // console.log(window.location.hash)
      // console.log(this.state.hash)
      if(this.state.controller !== null && decodeURI(window.location.hash) !== this.state.hash) {
        if(this.state.hash.includes("/signatures")){
          this.setState({
            hash: decodeURI(window.location.hash)
          })
        }
        this.state.controller.abort()
      }
      try {
        const controller = new AbortController()
        this.setState({
          status: 'Searching...',
          controller: controller,
        })
        const headers = {'Authorization': `Basic ${this.state.token}`}
        const { response: signature_fields } = await fetch_meta({
          endpoint: `/libraries/${uid}`,
          signal: controller.signal,
          headers
        })
        // await fetch_meta({
        //   endpoint: '/libraries' + uid,
        //   signal: controller.signal,
        //   headers
        // })

        this.setState({
          // signature_fields: signature_fields,
          signature_fields: signature_fields["Signature_keys"],
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

  async fetch_libfields() {
    const headers = {'Authorization': `Basic ${this.state.token}`}
    const { response: library_fields } = await fetch_meta({
      endpoint: '/libraries/key_count',
      signal: this.state.general_controller.signal,
      headers
    })
    this.setState({
      LibNum: library_fields.$validator,
      library_fields: library_fields,
      LibraryNumber: library_fields.$validator,
    },()=>{
      this.fetch_stats("Libraries")
    })
  }

  async fetch_sigfields() {
    const headers = {'Authorization': `Basic ${this.state.token}`}
    const { response: signature_fields} = await fetch_meta({
      endpoint: `/libraries/${this.state.uid}`,
      signal: this.state.general_controller.signal,
      headers
    })
    this.setState({
      signature_fields: signature_fields["Signature_keys"],
    })
  }

  async fetch_sigallfields(){
    const headers = {'Authorization': `Basic ${this.state.token}`}
    const { response: signature_allfields} = await fetch_meta({
      endpoint: '/signatures/key_count',
      signal: this.state.general_controller.signal,
      headers
    })
    this.setState({
      signature_allfields: signature_allfields,
      SignatureNumber: signature_allfields.$validator,
    },()=>{
      this.fetch_stats("Signatures")
    })
  }

  async fetch_entityfields(){
    const headers = {'Authorization': `Basic ${this.state.token}`}
    const { response: entity_fields } = await fetch_meta({
      endpoint: '/entities/key_count',
      signal: this.state.general_controller.signal,
      headers
    })
    this.setState({
      entity_fields: entity_fields,
      EntityNumber: entity_fields.$validator,
    })
    // this.setState({
    //   entity_fields: entity_fields,
    //   EntityNumber: entity_fields.$validator,
    // },()=>{
    //   this.fetch_stats("Entities")
    // })
  }

  async fetch_sigstats() {
    const headers = {'Authorization': `Basic ${this.state.token}`}
    const { response: signature_counts} = await fetch_meta({
      endpoint: '/signatures/value_count',
      body: {
        depth: 2,
        filter: {
          fields: ["Gene", "Cell_Line", "Small_Molecule", "Tissue", "Disease"]
        },
      },
      signal: this.state.general_controller.signal,
      headers
    })
    const sig_counts = Object.keys(signature_counts).filter(key=>key.includes(".Name"))
                                                    .reduce((stat_list, k)=>{
                                                    stat_list.push({name: k.replace(".Name", ""),
                                                                    counts:Object.keys(signature_counts[k]).length})
                                                    return(stat_list) },
                                                    [])

    sig_counts.sort((a, b) => a.name > b.name);
    this.setState({
      signature_counts: sig_counts,
    })
  }

  componentDidMount() {
    window.addEventListener("hashchange", this.hashChangeHandler);
    if (this.state.token && this.state.general_controller){
      this.fetch_libfields()
      this.fetch_sigfields()
      this.fetch_sigstats()
      this.fetch_sigallfields()
      this.fetch_entityfields()
    }
  }
  httpClient(url, options = {}) {
    if(!(options.hasOwnProperty("method"))){
      const link = decodeURI(url).split("%2C")
      const url_params = link.filter((l)=> (l.includes("skip")||l.includes("limit")))
                             .map((l)=>(l.split("%3A")[1]));
      const page = (url_params[0]/url_params[1]) + 1
      this.setState({
        apipage: page
      })
    }

    if (this.state.controller!== null)
      options["signal"] = this.state.controller.signal

    if (options.headers === undefined)
      options.headers = new Headers({ Accept: 'application/json' });
    
    const token = (options.token || this.state.token)
    options.headers.set('Authorization', `Basic ${token}`);
    
    return fetchJson(url, options);
  }

  async authProvider(type, params) {
    if (type === AUTH_LOGIN) {
      const token = Buffer.from(`${params.username}:${params.password}`).toString('base64')
      const headers = {'Authorization': `Basic ${token}`}
      const { authenticated: auth} = await fetch_creds({
        endpoint: "/",
        headers
      })
      
      if (!auth){
        return Promise.reject()
      }else{
        this.setState({ token: token })
        
        const general_controller = new AbortController()
        this.setState({
          general_controller: general_controller,
        })

        // Load column names
        if(this.state.library_fields===null){
          this.fetch_libfields()
        }
        if(this.state.signature_fields===null){
          this.fetch_sigfields()
        }
        if(this.state.entity_fields===null){
          this.fetch_entityfields()
        }
        if(this.state.signature_counts===null){
          this.fetch_sigstats()
        }
        if(this.state.signature_allfields===null){
          this.fetch_sigallfields()
        }
        return Promise.resolve();
      }
    }else if (type === AUTH_LOGOUT) {
        this.setState({ token: null })
        if(this.state.general_controller){
          this.state.general_controller.abort()
        }
        if(this.state.lib_controller){
          this.state.lib_controller.abort()
        }
        if(this.state.sig_controller){
          this.state.sig_controller.abort()
        }
        if(this.state.ent_controller){
          this.state.ent_controller.abort()
        }
        return Promise.resolve();
    }else if (type === AUTH_ERROR) {
      if (params === 'DOMException: "The operation was aborted. "'){
        const status  = params.status;
        this.setState({ token: null })
        if(this.state.general_controller){
          this.state.general_controller.abort()
        }
        if(this.state.lib_controller){
          this.state.lib_controller.abort()
        }
        if(this.state.sig_controller){
          this.state.sig_controller.abort()
        }
        if(this.state.ent_controller){
          this.state.ent_controller.abort()
        }
        return Promise.reject()
      }else
        return Promise.resolve()
    }else if (type === AUTH_CHECK) {
      if(this.state.token){
        return Promise.resolve()
      }else{
        if(this.state.general_controller){
          this.state.general_controller.abort()
        }
        if(this.state.lib_controller){
          this.state.lib_controller.abort()
        }
        if(this.state.sig_controller){
          this.state.sig_controller.abort()
        }
        if(this.state.ent_controller){
          this.state.ent_controller.abort()
        }
        return Promise.reject();
      }
    }
    return Promise.reject()
  }

  render() {
      return (
        <Admin title="Signature Commons Admin Page"
               dataProvider={this.dataProvider}
               authProvider={this.authProvider}
               dashboard={(props) => <Dashboard 
                                        LibraryNumber={this.state.LibraryNumber}
                                        SignatureNumber={this.state.SignatureNumber}
                                        EntityNumber={this.state.EntityNumber}
                                        signature_counts={this.state.signature_counts}
                                        entity_fields={this.state.entity_fields}
                                        library_fields={this.state.library_fields}
                                        signature_allfields={this.state.signature_allfields}
                                        handleSelectField={this.handleSelectField}
                                        libselected={this.state.libselected}
                                        sigselected={this.state.sigselected}
                                        entselected={this.state.entselected}
                                        libchart={this.state.libchart}
                                        sigchart={this.state.sigchart}
                                        entchart={this.state.entchart}
                                        {...props}/>}
               catchAll={this.NotFound}
               loginPage={MyLogin}
        >
          {this.state.library_fields===null ? <div/>:
            <Resource
              name="libraries"
              list={this.LibraryList}
              edit={this.LibraryEdit}
              icon={LibraryBooks}
            />
          }
          {this.state.signature_fields===null ? <div/>:
            <Resource
              name="signatures"
              edit={this.SignatureEdit}
              list={this.SignatureList}
              icon={Fingerprint}
            />
          }
          {this.state.entity_fields===null ? <div/>:
            <Resource
              name="entities"
              edit={this.EntityEdit}
              list={this.EntityList}
              icon={BlurOn}
            />
          }
        </Admin>
      )
  }
}

export default AdminView
