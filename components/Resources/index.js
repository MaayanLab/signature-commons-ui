import React from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import { labelGenerator } from '../../util/ui/labelGenerator'
import CircularProgress from '@material-ui/core/CircularProgress'
import PropTypes from 'prop-types'
import { IconComponent } from '../DataTable/IconComponent'
import { Typography } from '@material-ui/core'


class Resources extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      entries: null,
      limit: 50,
      skip: 0,
      complete: false
    }
  }

  get_entries = async () => {
    try {
      this.props.resolver.abort_controller()
      this.props.resolver.controller()
      const {model, preferred_name, schemas} = this.props
      const {limit, skip} = this.state
      const {entries: results, count} = await this.props.resolver.filter_metadata({
        model,
        filter: {
          limit,
          skip
        }
      })
      const entries = []
			for (const c of Object.values(results)){
				const entry = await c.serialize(true,false)
				const e = labelGenerator(await entry,
					schemas,
					"#" + preferred_name[model] +"/")
				entries.push(e)
      }
      this.setState(prevState=>{
        const all_entries = [...(prevState.entries || []), ...entries]
        return {
          entries: all_entries,
          complete: count === all_entries.length
        }

      })
    } catch (error) {
      console.error(error)
    } 
  }

  componentDidMount = () => {
    this.get_entries()
  }

  componentDidUpdate = async (prevProps, prevState) => {
    const { limit, skip } = this.state
    if (prevState.limit !== limit || prevState.skip !== skip) {
      this.get_entries()
    }
  }

  get_more_resources = () => {
    this.setState((prevState) => ({
      skip: prevState.skip + prevState.limit,
    }))
  }


  render() {
    if (this.state.entries === null) {
      return <CircularProgress color="primary" />
    } else {
      return (
        <Grid container spacing={3} style={{marginBottom: 20}}>
          {this.state.entries.map(entry=>(
            <Grid item xs={6} lg={4} key={entry.info.name.text}>
              <Button href={entry.info.endpoint || undefined} style={{textTransform: "none"}}>
              <Card style={{height: 400, padding: 10}}>
                  {entry.info.icon!==undefined ?
                    <CardMedia
                      style={{ textAlign: 'center'}}
                    >
                      
                        <IconComponent {...entry.info.icon}/>
                    </CardMedia>: 
                    <CardMedia
                      style={{ textAlign: 'center'}}
                    >
                      <IconComponent icon={"mdi-clipboard-outline"}/>
                    </CardMedia>
                  }
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography variant={"h6"} style={{textAlign: "center"}}>
                          {entry.info.name.text}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant={"body1"} style={{maxHeight: 150, overflow: "auto"}}>
                          {entry.info.subtitle.text}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Button>
            </Grid> 
          ))}
          { this.state.complete? null:
            <Grid item xs={6} lg={4}>
              <Button onClick={this.get_more_resources} style={{textTransform: "none", width: "100%"}}>
                <Card style={{height: 400, padding: 10, width: "100%"}}>
                  <CardMedia
                    style={{ textAlign: 'center',  margin: 20}}
                  >
                      <IconComponent icon="mdi-dots-horizontal"/>
                  </CardMedia>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography variant={"h6"} style={{textAlign: "center"}}>
                          See More
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Button>
            </Grid>
          }
       </Grid>
      )
    }
  }
}

Resources.propTypes = {
  model: PropTypes.string,
  resolver: PropTypes.object,
  schemas: PropTypes.array.isRequired,
	preferred_name: PropTypes.shape({
		resources: PropTypes.string,
		libraries: PropTypes.string,
		signatures: PropTypes.string,
		entities: PropTypes.string,
	}),
}

export default Resources
