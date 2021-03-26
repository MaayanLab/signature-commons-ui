import React from 'react'
import Grid from '@material-ui/core/Grid'
import Chip from '@material-ui/core/Chip'
import Card from '@material-ui/core/Card'
import CardMedia from '@material-ui/core/CardMedia'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Tooltip from '@material-ui/core/Tooltip'
import Icon from '@material-ui/core/Icon'
import PropTypes from 'prop-types'
import { Highlight } from './Highlight'
import { IconComponent } from './IconComponent'


export const InfoCard = ({
    info,
    highlight=[],
    CardProps,
    CardContentProps,
    titleProps,
    subtitleProps,
    displayProps,
    tagProps,
    onTagClick,
    keywordProps,
    IconButton=IconComponent,
    LeftComponents=[],
    RightComponents=[],
    BottomComponents=[],
    ...props }) => {
    const default_tag_icon = 'mdi-tag-text'
    return (
      <Card style={{
            paddingBottom: 10,
        }}
        {...CardProps}
      >
        <CardContent style={{ paddingBottom: 3 }} {...CardContentProps}>
          <Grid container>
            <Grid item md={11} sm={10} xs={9}>
              <Grid container>
                <Grid item md={2} xs={4} style={{ textAlign: 'center' }}>
                  <CardMedia {...info.icon}>
                    <IconButton {...info.icon}/>
                  </CardMedia>
                  {LeftComponents.map((comp, i)=>{
                    const {component, props} = comp
                    return <div key={i}>{component(props)}</div>
                  })}
                </Grid>
                <Grid item md={10} xs={8}>
                  <Grid container>
                    <Grid item xs={12}>
                      <Highlight
                        Component={(props) => {
                          return (
                            <Typography variant="subtitle1" {...props}>
                              <a href={info.endpoint}>{props.children}</a>
                            </Typography>
                          )
                        }}
                        text={info.name.text}
                        highlight={highlight}
                        {...titleProps}
                      />
                    </Grid>
                    {info.subtitle === undefined ? null :
                      <Grid item xs={12}>
                        <Highlight
                          Component={(props) => {
                            if (info.subtitle.url !== undefined) {
                              return (
                                <Typography variant="subtitle2" {...props}>
                                  <i><a href={info.subtitle.url} target="_blank" rel="noopener noreferrer" >{props.children}</a></i>
                                </Typography>
                              )
                            } else {
                              return (
                                <Typography variant="subtitle2" {...props}>
                                  {props.children}
                                </Typography>
                              )
                            }
                          }}
                          text={info.subtitle.text}
                          highlight={highlight}
                          {...subtitleProps}
                        />
                      </Grid>
                    }
                    {Object.entries(info.display).map(([label, value]) => 
                      <Grid item xs={12} key={`${label}_display`}>
                        <Highlight
                          Component={(props) => {
                            if (value.url !== undefined) {
                              return (
                                <Typography variant="caption" {...props}>
                                  {value.label}: <a href={value.url} target="_blank" rel="noopener noreferrer">{value.text}</a>
                                </Typography>
                              )
                            } else {
                              return (
                                <Typography variant="caption" {...props}>
                                  {value.label}: {value.text}
                                </Typography>
                              )
                            }
                          }}
                          text={info.subtitle.text}
                          highlight={highlight}
                          {...displayProps}
                        />
                      </Grid>
                    )}
                    <Grid item xs={12}>
                    </Grid>
                    <Grid item xs={12}>
                      {info.tags.map((tag) =>
                        <Tooltip title={tag.text}
                          key={tag.text}
                          placement="bottom">
                          <Chip style={{
                              margin: '5px 10px 5px 0',
                              maxWidth: 500,
                            }} key={tag.label}
                            avatar={<Icon className={`mdi ${tag.icon || default_tag_icon} mdi-18px`} style={{
                              paddingLeft: 10,
                            }} />}
                            label={<Highlight
                              Component={(props) => <span style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: 'inline-block',
                                maxWidth: 400,
                              }} {...props} >{props.children}</span>}
                              text={`${tag.label}: ${tag.text}`}
                              highlight={highlight}
                            />}
                            onClick={() => {
                              props.onChipClick(tag)
                            }}
                            {...tagProps}
                          />
                        </Tooltip>)}
                    </Grid>
                    {Object.entries(info.keywords).map(([label, value]) =>(
                      <Grid item xs={12} key={value.label}>
                        <div>
                          <Typography variant="caption">
                            {value.label}: 
                          </Typography>
                        </div>
                        {value.value.map(v=>(
                          <Tooltip title={v}
                            key={v}
                            placement="bottom">
                            <Chip style={{
                                margin: '5px 10px 5px 0',
                                maxWidth: 500,
                              }} key={v}
                              avatar={<Icon className={`mdi ${value.icon || default_tag_icon} mdi-18px`} style={{
                                paddingLeft: 10,
                              }}  />}
                              label={<Highlight
                                Component={(props) => <span {...props} style={{
                                  margin: '5px 10px 5px 0',
                                  maxWidth: 400,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: 'inline-block',
                                }}>{props.children}</span>}
                                text={`${v}`}
                                highlight={highlight}
                              />}
                              onClick={() => {
                                props.onChipClick(v)
                              }}
                              {...keywordProps}
                            />
                        </Tooltip>
                        ))}
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item md={1} sm={2} xs={3}>
              <Grid container>
                {RightComponents.map((comp, i)=>{
                    const {component, props} = comp
                    return <Grid key={i} item xs={12} align="center" {...props.GridProps}>{component(props)}</Grid>
                  })}
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
        {BottomComponents.map((comp, i)=>{
          const {component, props} = comp
          return <div key={i}>{component(props)}</div>
        })}
      </Card>
    )
  }

  InfoCard.propTypes = {
    info: PropTypes.shape({
      icon: PropTypes.shape({
        src: PropTypes.string,
        alt: PropTypes.string,
        title: PropTypes.string,
        text: PropTypes.string,
        icon: PropTypes.string,
        description: PropTypes.string,
      }),
      name: PropTypes.shape({
        text: PropTypes.string,
        label: PropTypes.string
      }),
      subtitle: PropTypes.shape({
        text: PropTypes.string,
        label: PropTypes.string
      }),
      tags: PropTypes.arrayOf(PropTypes.shape({
        text: PropTypes.string,
        label: PropTypes.string,
        icon: PropTypes.string,
        priority: PropTypes.number,
        clickable: PropTypes.bool,
      })),
      keywords: PropTypes.object,
    }),
    highlight: PropTypes.arrayOf(PropTypes.string),
    CardProps: PropTypes.object,
    CardContentProps: PropTypes.object,
    titleProps: PropTypes.object,
    subtitleProps: PropTypes.object,
    displayProps: PropTypes.object,
    tagProps: PropTypes.object,
    onChipClick: PropTypes.func,
    keywordProps: PropTypes.object,
    IconButton: PropTypes.node,
    LeftComponents: PropTypes.arrayOf(PropTypes.shape({
      component: PropTypes.func,
      props: PropTypes.object
    })),
    RightComponents: PropTypes.arrayOf(PropTypes.shape({
      component: PropTypes.func,
      props: PropTypes.object
    })),
    BottomComponents: PropTypes.arrayOf(PropTypes.shape({
      component: PropTypes.func,
      props: PropTypes.object
    }))
  }
  