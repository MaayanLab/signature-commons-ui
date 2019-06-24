import React from 'react'
import { Redirect } from 'react-router'
import { Admin,
  Datagrid,
  DisabledInput,
  Edit,
  EditButton,
  List,
  LongTextInput,
  ReferenceField,
  Resource,
  SimpleForm,
  TextField,
  TextInput,
  AUTH_LOGIN,
  AUTH_LOGOUT,
  AUTH_ERROR,
  AUTH_CHECK,
  GET_ONE,
  UPDATE } from 'react-admin'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import BlurOn from '@material-ui/icons/BlurOn'
import Fingerprint from '@material-ui/icons/Fingerprint'
import LibraryBooks from '@material-ui/icons/LibraryBooks'

import { base_url, fetch_meta, fetch_creds } from '../../util/fetch/meta'
import { fetchJson, patchJson } from '../../util/fetch/fetch'

import loopbackProvider from './loopback-provider'
import { SignaturePostFilter,
  FullTextFilter,
  LibraryAvatar,
  DisplayField } from './adminhelper'
import { Dashboard } from './dashboard'

import { MyLogin } from './Login.js'


class AdminView extends React.PureComponent {
  constructor(props) {
    super(props)
    const token = process.env.NODE_ENV === 'development' ? process.env.NEXT_PUBLIC_CREDS : ''
    this.state = {
      signature_fields: null,
      pie_controller: null,
      pie_stats: null,
      selected_field: Object.keys(props.pie_fields_and_stats)[0] || '',
      per_resource_counts: null,
      status: null,
      controller: null,
      general_controller: null,
      token: token,
      uid: Object.keys(props.signature_keys)[0],
      signature_fields: props.signature_keys[Object.keys(props.signature_keys)[0]],
      hash: window.location.hash,
    }
    this.filterHandler = this.filterHandler.bind(this)
    this.hashChangeHandler = this.hashChangeHandler.bind(this)
    this.LibraryList = this.LibraryList.bind(this)
    this.LibraryEdit = this.LibraryEdit.bind(this)
    this.EntityList = this.EntityList.bind(this)
    this.EntityEdit = this.EntityEdit.bind(this)
    this.SignatureList = this.SignatureList.bind(this)
    this.SignatureEdit = this.SignatureEdit.bind(this)
    this.httpClient = this.httpClient.bind(this)
    this.filterForm = this.filterForm.bind(this)
    this.authProvider = this.authProvider.bind(this)
    this.NotFound = this.NotFound.bind(this)
    this.handleSelectField = this.handleSelectField.bind(this)
    this.dataProvider = loopbackProvider(base_url, this.httpClient)
  }

  // const httpClient = (url, options = {}) => {
  //   if (!options.headers) {
  //       options.headers = new Headers({ Accept: 'application/json' });
  //   }
  //   const token = localStorage.getItem('token');
  //   options.headers.set('Authorization', `Basic ${this.state.token}`);
  //   return fetchUtils.fetchJson(url, options);
  // }

  filterForm(props) {
    if (this.state.token === null) {
      return false
    } else {
      return (
        <SignaturePostFilter
          librarynumber={Object.keys(this.props.libraries).length}
          library_name={this.props.ui_content.content.library_name}
        />
      )
    }
  }

  handleSelectField(e) {
    const field = e.target.value
    this.setState({
      selected_field: field,
      pie_stats: null,
    }, () => {
      this.fetch_stats(this.state.selected_field)
    })
  }

  LibraryList(props) {
    return (
      <List
        title="Libraries"
        filters={<FullTextFilter />}
        {...props}>
        <Datagrid>
          <LibraryAvatar
            source={`meta.${this.props.ui_content.content.library_name}`}
            title={'Library'}
            label={'Library'}
            textAlign="center"
            library_name={this.props.ui_content.content.library_name}
          />
          <TextField
            source="id"
          />
          {Object.keys(this.props.library_fields).map(function(k) {
            return (
              <DisplayField
                key={k}
                label={k.replace(/_/g, ' ')}
                source={'meta.' + k}
                field={k}
              />
            )
          })}
          <EditButton />
        </Datagrid>
      </List>
    )
  }

  LibraryEdit(props) {
    return (
      <Edit {...props}>
        <SimpleForm>
          <DisabledInput source="id" />
          <TextInput
            key={'$validator'}
            label={'Core Validator'}
            source={'$validator'}
          />
          <TextInput
            key={'dataset'}
            label={'Dataset'}
            source={'dataset'}
          />
          <TextInput
            key={'dataset_type'}
            label={'Dataset type'}
            source={'dataset_type'}
          />
          {Object.keys(this.props.library_fields).map(function(k) {
            return (
              <LongTextInput
                key={k}
                label={k.replace(/_/g, ' ')}
                source={'meta.' + k}
                format={(v) => typeof v === "object"? JSON.stringify(v, null, 2): v}
                parse={(v) => typeof v === 'object'? JSON.parse(v||''): v}
              />
            )
          })}
        </SimpleForm>
      </Edit>
    )
  }
  // TODO: Make this less hacky (have it detect objects and arrays)
  SignatureList(props) {
    return (
      <List
        {...props}
        filters={this.filterForm(props)}
        filterDefaultValues={{ 'library': this.state.uid }}
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
              source={`meta.${this.props.ui_content.content.library_name}`}
              style={{ width: 150 }}/>
          </ReferenceField>
          {this.state.signature_fields.filter((k) => !k.includes('.')).map(function(k) {
            return (
              <DisplayField
                key={k}
                label={k.replace(/_/g, ' ')}
                source={'meta.' + k}
                field={k}
              />
            )
          })}
          <EditButton />
        </Datagrid>
      </List>
    )
  }

  SignatureEdit(props) {
    return (
      <Edit {...props}>
        <SimpleForm>
          <DisabledInput source="id" />
          <TextInput
            key={'$validator'}
            label={'Core Validator'}
            source={'$validator'}
          />
          <TextInput
            key={'library'}
            label={'library'}
            source={'library'}
          />
          {this.state.signature_fields.map(function(k) {
            return (
              <LongTextInput
                key={k}
                label={k.replace(/_/g, ' ')}
                source={'meta.' + k}
                format={(v) => typeof v === "object"? JSON.stringify(v, null, 2): v}
                parse={(v) => typeof v === 'object'? JSON.parse(v||''): v}
              />
            )
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
          {Object.keys(this.props.entity_fields).map(function(k) {
            return (
              <DisplayField
                key={k}
                label={k.replace(/_/g, ' ')}
                source={'meta.' + k}
                field={k}
              />
            )
          })}
          <EditButton />
        </Datagrid>
      </List>
    )
  }

  EntityEdit(props) {
    return (
      <Edit {...props}>
        <SimpleForm>
          <DisabledInput source="id" />
          <TextInput
            key={'$validator'}
            label={'Core Validator'}
            source={'$validator'}
          />
          {Object.keys(this.props.entity_fields).map(function(k) {
            return (
              <LongTextInput
                key={k}
                label={k.replace(/_/g, ' ')}
                source={'meta.' + k}
                format={(v) => typeof v === "object"? JSON.stringify(v, null, 2): v}
                parse={(v) => typeof v === 'object'? JSON.parse(v||''): v}
              />
            )
          })}
        </SimpleForm>
      </Edit>
    )
  }

  NotFound(props) {
    if (this.state.token) {
      return (
        <Card>
          <CardHeader title="Oop! I don't know what you are looking for" />
          <CardContent>Check your link, please.</CardContent>
        </Card>
      )
    } else {
      return <Redirect to='/' />
    }
  }

  async fetch_stats(selected_field) {
    this.setState({
      pie_stats: this.props.pie_fields_and_stats[selected_field] || [],
    })
  }

  async filterHandler(uid) {
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
    if (this.state.controller !== null && decodeURI(window.location.hash) !== this.state.hash) {
      if (this.state.hash.includes('/signatures')) {
        this.setState({
          hash: decodeURI(window.location.hash),
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
      // const headers = { 'Authorization': `Basic ${this.state.token}` }
      // const { response: signature_fields } = await fetch_meta({
      //   endpoint: `/libraries/${uid}/signatures/key_count`,
      //   signal: controller.signal,
      //   headers,
      // })

      // await fetch_meta({
      //   endpoint: '/libraries' + uid,
      //   signal: controller.signal,
      //   headers
      // })
      this.setState({
        signature_fields: this.props.signature_keys[uid],
        uid: uid,
      })
    } catch (e) {
      if (e.code !== DOMException.ABORT_ERR) {
        this.setState({
          status: e + '',
        })
      }
    }
  }

  hashChangeHandler() {
    const hash = decodeURI(window.location.hash)
    this.setState({
      hash: hash,
    })
    if (hash.includes('/signatures?filter={"library"')) {
      const hashparts = hash.split('"')
      if (hashparts.length > 4) {
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
  // async fetch_count(source) {
  //   const headers = {'Authorization': `Basic ${this.state.token}`}
  //   const { response } = await fetch_meta({ endpoint: `/${source}/count`,
  //                                           signal: this.state.general_controller.signal,
  //                                           headers })
  //   if(source==="libraries"){
  //     this.setState({
  //       LibraryNumber: response.count
  //     })
  //   }else if(source==="signatures"){
  //     this.setState({
  //       SignatureNumber: response.count
  //     })
  //   }else if(source==="entities"){
  //     this.setState({
  //       EntityNumber: response.count
  //     })
  //   }
  // }
  async fetch_libraryfields() {
    const headers = { 'Authorization': `Basic ${this.state.token}` }
    const { response: library_fields } = await fetch_meta({
      endpoint: `/libraries/key_count`,
      signal: this.state.general_controller.signal,
      headers,
    })
    this.setState({
      library_fields: library_fields,
    })
  }

  async fetch_entityfields() {
    const headers = { 'Authorization': `Basic ${this.state.token}` }
    const { response: entity_fields } = await fetch_meta({
      endpoint: `/entities/key_count`,
      signal: this.state.general_controller.signal,
      headers,
    })
    this.setState({
      entity_fields: entity_fields,
    })
  }

  async fetch_metacounts() {
    const fields = (await import('../../ui-schemas/dashboard/counting_fields.json')).default
    this.setState({
      counting_fields: fields,
    })
    const object_fields = Object.keys(fields).filter((key) => fields[key] == 'object')

    // UNCOMMENT TO FETCH STUFF IN THE SERVER
    const headers = { 'Authorization': `Basic ${this.state.token}` }
    const { response: meta_stats } = await fetch_meta({
      endpoint: '/signatures/value_count',
      body: {
        depth: 2,
        filter: {
          fields: Object.keys(fields),
        },
      },
      signal: this.state.general_controller.signal,
      headers,
    })
    const meta_counts = Object.keys(meta_stats).filter((key) => key.indexOf('.Name') > -1 ||
                                                            // (key.indexOf(".PubChemID")>-1 &&
                                                            //  key.indexOf("Small_Molecule")>-1) ||
                                                            (key.indexOf('.') === -1 && object_fields.indexOf(key) === -1))
        .reduce((stat_list, k) => {
          stat_list.push({ name: k.indexOf('PubChemID') !== -1 ?
                                                                            k.replace('Small_Molecule.', '') :
                                                                            k.replace('.Name', ''),
          counts: Object.keys(meta_stats[k]).length })
          return (stat_list)
        },
        [])
    // const meta_counts = (await import("../../ui-schemas/dashboard/saved_counts.json")).default
    // meta_counts.sort((a, b) => a.name > b.name);
    this.setState({
      meta_counts: meta_counts,
    })
  }

  componentDidMount() {
    window.addEventListener('hashchange', this.hashChangeHandler)
    this.fetch_stats(this.state.selected_field)
  }

  componentWillUnmount() {
    if (this.state.pie_controller) {
      this.state.pie_controller.abort()
    }
    if (this.state.general_controller) {
      this.state.general_controller.abort()
    }
  }

  httpClient(url, options = {}, type = GET_ONE) {
    if (!(options.hasOwnProperty('method'))) {
      const link = decodeURI(url).split('%2C')
      const url_params = link.filter((l) => (l.includes('skip') || l.includes('limit')))
          .map((l) => (l.split('%3A')[1]))
      const page = (url_params[0] / url_params[1]) + 1
      this.setState({
        apipage: page,
      })
    }

    if (this.state.controller !== null) {
      options['signal'] = this.state.controller.signal
    }

    if (options.headers === undefined) {
      options.headers = new Headers({ Accept: 'application/json' })
    }

    const token = (options.token || this.state.token)
    options.headers.set('Authorization', `Basic ${token}`)
    if (type === UPDATE) {
      return patchJson(url, options)
    } else {
      return fetchJson(url, options)
    }
  }

  async authProvider(type, params) {
    if (type === AUTH_LOGIN) {
      const token = Buffer.from(`${params.username}:${params.password}`).toString('base64')
      const headers = { 'Authorization': `Basic ${token}` }
      const { authenticated: auth } = await fetch_creds({
        endpoint: '/',
        headers,
      })

      if (!auth) {
        return Promise.reject()
      } else {
        this.setState({ token: token })

        const general_controller = new AbortController()
        this.setState({
          general_controller: general_controller,
        })

        // Load column names
        // if(this.state.LibraryNumber==="Loading..."){
        //   this.fetch_count("libraries")
        // }
        // if(this.state.EntityNumber==="Loading..."){
        //   this.fetch_count("entities")
        // }
        // if(this.state.SignatureNumber==="Loading..."){
        //   this.fetch_count("signatures")
        // }

        // if(this.state.meta_counts===null){
        //   this.fetch_metacounts()
        // }
        if (this.state.pie_stats === null) {
          this.fetch_stats(this.state.selected_field)
        }
        // Pre computed
        // if(this.state.resource_signatures===null){
        //   const response = (await import("../../ui-schemas/resources/all.json")).default
        //   const resource_signatures = response.filter(data=>data.Resource_Name!=="Enrichr").reduce((group, data)=>{
        //     group[data.Resource_Name] = data.Signature_Count
        //     return group
        //   }, {})
        // let for_sorting = Object.keys(resource_signatures).map(resource=>({name: resource,
        //                                                                          counts: resource_signatures[resource]}))

        //  for_sorting.sort(function(a, b) {
        //      return b.counts - a.counts;
        //  });
        // this.setState({
        //   resource_signatures: resource_signatures//for_sorting.slice(0,11),
        // })
        // }
        // Via Server
        // if(this.state.per_resource_counts===null){
        //   this.setState({...(await get_signature_counts_per_resources(this.state.general_controller))})
        // }
        return Promise.resolve()
      }
    } else if (type === AUTH_LOGOUT) {
      this.setState({ token: null })
      if (this.state.general_controller) {
        this.state.general_controller.abort()
      }
      if (this.state.pie_controller) {
        this.state.pie_controller.abort()
      }
      return Promise.resolve()
    } else if (type === AUTH_ERROR) {
      if (params === 'DOMException: "The operation was aborted. "') {
        this.setState({ token: null })
        if (this.state.general_controller) {
          this.state.general_controller.abort()
        }
        if (this.state.pie_controller) {
          this.state.pie_controller.abort()
        }
        return Promise.reject()
      } else {
        return Promise.resolve()
      }
    } else if (type === AUTH_CHECK) {
      if (this.state.token) {
        return Promise.resolve()
      } else {
        if (this.state.general_controller) {
          this.state.general_controller.abort()
        }
        if (this.state.pie_controller) {
          this.state.pie_controller.abort()
        }
        return Promise.reject()
      }
    }
    return Promise.reject()
  }

  render() {
    return (
      <Admin title={'Signature Commons Dashboard'}
        dataProvider={this.dataProvider}
        authProvider={this.authProvider}
        dashboard={(props) => <Dashboard
          handleSelectField={this.handleSelectField}
          {...this.state}
          {...this.props}
          {...props}/>}
        catchAll={this.NotFound}
        loginPage={MyLogin}
      >
        {this.props.library_fields === null ? <div/> :
            <Resource
              name="libraries"
              list={this.LibraryList}
              edit={this.LibraryEdit}
              icon={LibraryBooks}
              options={{ label: this.props.ui_content.content.preferred_name['libraries'] }}
            />
        }
        {this.state.signature_fields === null ? <div/> :
            <Resource
              name="signatures"
              edit={this.SignatureEdit}
              list={this.SignatureList}
              icon={Fingerprint}
              options={{ label: this.props.ui_content.content.preferred_name['signatures'] }}
            />
        }
        {this.props.entity_fields === null ? <div/> :
            <Resource
              name="entities"
              edit={this.EntityEdit}
              list={this.EntityList}
              icon={BlurOn}
              options={{ label: this.props.ui_content.content.preferred_name['entities'] }}
            />
        }
      </Admin>
    )
  }
}

export default AdminView
