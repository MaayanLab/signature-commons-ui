import React from 'react'
import IFrame from '../IFrame'
import { fetch_external } from '../../util/fetch/fetch_external'
import CircularProgress from '@material-ui/core/CircularProgress'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { Link } from 'react-router-dom'
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

export default class Notebooks extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            url: null,
            notebook_list: null,
            notebook_title: null,
            loading: true
        }
    }
    
    get_notebook = async (notebook_title) => {
        this.setState({
            url: "about:blank"
        }, async ()=>{
            const {response: notebook} = await fetch_external({
                endpoint: `${this.props.endpoint}/${notebook_title}`
            })
            if (notebook.url === undefined){
                this.props.history.push({
                    pathname: `/not-found`
                })
            }else{
                this.setState({
                    ...notebook,
                    loading: true
                })
            }
        })
    }

    finish_loading = async () => {
        this.setState({
            loading: false
        })
    }
    
    componentDidMount = async() => {
        const {response} = await fetch_external({
            endpoint: this.props.endpoint
        })
        if (this.props.match.params.notebook_title === undefined){
            this.setState({
                notebook_list: response,
            })
            this.props.history.push({
                pathname: `${this.props.match.path}/${response[0]}`
            })
        }else{
            const notebook_title = this.props.match.params.notebook_title
            this.setState({
                notebook_list: response,
                notebook_title
            }, async ()=>{
                await this.get_notebook(this.state.notebook_title)
            })
        }
    }

    componentDidUpdate = async (prevProps) => {
        if (prevProps.match.params.notebook_title!==this.props.match.params.notebook_title){
            if (this.props.match.params.notebook_title === undefined){
                this.props.history.push({
                    pathname: `${this.props.match.path}/${this.state.notebook_list[0]}`
                })
            } else {
                const notebook_title = this.props.match.params.notebook_title
                this.setState({
                    notebook_title
                }, async ()=>{
                    await this.get_notebook(this.state.notebook_title)
                })
            }
        }
    }

    notebook_select = () => {
        return (
            <React.Fragment>
                <Typography variant={"h5"} style={{marginBottom:5}}>
                    Select Notebook
                </Typography>
                <Card 
                    style={{
                        maxHeight: 300, 
                        overflow: 'auto',
                        maxWidth: 200,
                        marginBottom: 50
                }}>
                    <CardContent>
                        <MenuList>
                            {this.state.notebook_list.map(notebook_title=>
                                <MenuItem
                                    selected={notebook_title===this.state.notebook_title}
                                    onClick={()=>this.get_notebook(notebook_title)}
                                >
                                    <Link to={`/${this.props.path}/${notebook_title}`} style={{color: "inherit"}}>
                                        <Typography variant="inherit" noWrap>
                                            {notebook_title}
                                        </Typography>
                                    </Link>
                                </MenuItem>
                            )}
                        </MenuList>
                    </CardContent>
                </Card>
            </React.Fragment>
        )
    }

    render = () => {
        if (this.state.url === null){
            return <CircularProgress />
        }
        if (this.props.iframe){
            return (
                <Grid container>
                    <Grid item sm={4} xs={12} lg={2} md={3}>
                        {this.notebook_select()}
                    </Grid>
                    <Grid item sm={8} xs={12} lg={10} md={9}>
                        {this.state.loading ? 
                            <div style={{textAlign: "right"}}>
                                <CircularProgress />
                            </div> : null}
                        <iframe
                            key={this.state.url}
                            id="notebook"
                            frameBorder="0"
                            src={`${this.state.url}`}
                            onLoad={this.finish_loading}
                            {...this.props}
                        />
                    </Grid>
                </Grid>
            )
        }else {
            return (
                <Grid container>
                    <Grid item sm={4} xs={12} lg={2} md={3}>
                        {this.notebook_select()}
                    </Grid>
                    <Grid item sm={8} xs={12} lg={10} md={9}>
                        {this.state.loading ? 
                            <div style={{textAlign: "right"}}>
                                <CircularProgress />
                            </div> : null}
                        <IFrame
                            id="notebook"
                            frameBorder="0"
                            src={`${this.state.url}`}
                            onLoad={this.finish_loading}
                            {...this.props}
                        />
                    </Grid>
                </Grid>
            )
        }   
    }
}