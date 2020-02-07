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

export default class Visualization extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            url: null,
            assay_list: null,
            assay_title: null,
            loading: true
        }
    }
    
    get_assay = async (assay_title) => {
        this.setState({
            url: "about:blank"
        }, async ()=>{
            const {response: assay} = await fetch_external({
                endpoint: `${this.props.endpoint}/${assay_title}`
            })
            if (assay.url === undefined){
                this.props.history.push({
                    pathname: `/not-found`
                })
            }else{
                this.setState({
                    ...assay,
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
        console.log("HI")
        const {response} = await fetch_external({
            endpoint: this.props.endpoint
        })
        if (this.props.match.params.assay_title === undefined){
            this.setState({
                assay_list: response,
            })
            this.props.history.push({
                pathname: `${this.props.match.path}/${response[0]}`
            })
        }else{
            const assay_title = this.props.match.params.assay_title
            this.setState({
                assay_list: response,
                assay_title
            }, async ()=>{
                await this.get_assay(this.state.assay_title)
            })
        }
    }

    componentDidUpdate = async (prevProps) => {
        if (prevProps.match.params.assay_title!==this.props.match.params.assay_title){
            const assay_title = this.props.match.params.assay_title
            this.setState({
                assay_title
            }, async ()=>{
                await this.get_assay(this.state.assay_title)
            })
        }
    }

    assay_select = () => {
        return (
            <React.Fragment>
                <Typography variant={"h5"} style={{marginBottom:5}}>
                    Select Assay
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
                            {this.state.assay_list.map(assay_title=>
                                <MenuItem
                                    selected={assay_title===this.state.assay_title}
                                    onClick={()=>this.get_assay(assay_title)}
                                >
                                    <Link to={`/${this.props.path}/${assay_title}`} style={{color: "inherit"}}>
                                        <Typography variant="inherit" noWrap>
                                            {assay_title}
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
                        {this.assay_select()}
                    </Grid>
                    <Grid item sm={8} xs={12} lg={10} md={9}>
                        {this.state.loading ? 
                            <div style={{textAlign: "right"}}>
                                <CircularProgress />
                            </div> : null}
                        <iframe
                            id="assay"
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
                        {this.assay_select()}
                    </Grid>
                    <Grid item sm={8} xs={12} lg={10} md={9}>
                        {this.state.loading ? 
                            <div style={{textAlign: "right"}}>
                                <CircularProgress />
                            </div> : null}
                        <IFrame
                            id="assay"
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