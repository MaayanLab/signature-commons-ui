import React from 'react'
import Grid from '@material-ui/core/Grid'
import Chip from '@material-ui/core/Chip'
import Card from '@material-ui/core/Card'
import CardMedia from '@material-ui/core/CardMedia'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import PropTypes from 'prop-types'

export const DefaultIconButton = ({
        title,
        alt,
        src,
        icon,
        description,
        TooltipTypProps,
        TooltipProps,
        IconProps,
        IconTypProps,
        ...props    
    }) => {
    let tooltip_title = ''
    if (description !== undefined || description === '') {
    tooltip_title = <Typography
                        variant="subtitle2"
                        style={{ color: '#FFF' }}
                        gutterBottom
                        {...TooltipTypProps}
                    >
                        {description}
                    </Typography>
    }
    return (
    <Tooltip title={tooltip_title}
        placement="bottom"
        {...TooltipProps}
    >
        <Grid container>
            <Grid item xs={12}>
                { icon === undefined ? 
                    <img style={{
                            height: 50,
                            maxWidth: 100
                            }}
                            alt={alt}
                            src={src}
                            {...IconProps}
                    />:
                    <span className={`mdi mdi-36px ${icon}`}
                            {...IconProps}
                    />
                }
            </Grid>
            <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom {...IconTypProps}>
                    {title}
                </Typography>
            </Grid>
        </Grid>
    </Tooltip>
    )
}

DefaultIconButton.propTypes = {
    title: PropTypes.string,
    alt: PropTypes.string,
    src: PropTypes.string,
    icon: PropTypes.string,
    description: PropTypes.string,
    TooltipTypProps: PropTypes.object,
    TooltipProps: PropTypes.object,
    IconProps: PropTypes.object,
    IconTypProps: PropTypes.object,
  }

export const InfoCard = ({
    info,
    classes,
    CardProps,
    CardContentProps,
    LeftComponents,
    RightComponents,
    ...props }) => {
    const default_tag_icon = 'mdi-tag-text'
    return (
      <Card style={{
            overflow: 'auto',
        }}
        {...CardProps}
      >
        <CardContent style={{ paddingBottom: 3 }} {...CardContentProps}>
          <Grid container>
            <Grid item md={11} sm={10} xs={9}>
              <Grid container>
                <Grid item md={2} xs={4} style={{ textAlign: 'center' }}>
                  <CardMedia style={{ marginTop: -30 }} {...info.icon}>
                    <IconButton {...info.icon} onClick={props.handleClick} value={data}/>
                  </CardMedia>
                  <Tooltip title={'See more'}
                    placement="bottom">
                    <Button aria-label="Expand"
                      onClick={() => props.handleClick(data)}
                      className={classes.margin}
                      style={{ minWidth: 5, paddingTop: 0, paddingBottom: 0 }}
                    >
                      <span className={`mdi mdi-chevron-${props.expanded ? 'up': 'down'} mdi-24px`}/>
                    </Button>
                  </Tooltip>
                </Grid>
                <Grid item md={10} xs={8}>
                  <Grid container>
                    <Grid item xs={12}>
                      <Highlight
                        Component={(props) => {
                          if (data.processed.name.hyperlink !== undefined) {
                            return (
                              <Typography variant="subtitle1">
                                <a href={data.processed.name.hyperlink} target="_blank" rel="noopener noreferrer" >{props.children}</a>
                              </Typography>
                            )
                          } else {
                            return (
                              <Typography variant="subtitle1">
                                {props.children}
                              </Typography>
                            )
                          }
                        }}
                        text={data.processed.name.text}
                        highlight={search}
                      />
                    </Grid>
                    {data.processed.subtitle === undefined ? null :
                      <Grid item xs={12}>
                        <Highlight
                          Component={(props) => {
                            if (data.processed.subtitle.hyperlink !== undefined) {
                              return (
                                <Typography variant="subtitle2">
                                  <i><a href={data.processed.subtitle.hyperlink} target="_blank" rel="noopener noreferrer" >{props.children}</a></i>
                                </Typography>
                              )
                            } else {
                              return (
                                <Typography variant="subtitle2">
                                  {props.children}
                                </Typography>
                              )
                            }
                          }}
                          text={data.processed.subtitle.text}
                          highlight={search}
                        />
                      </Grid>
                    }
                    {Object.entries(data.processed.display).map(([label, value]) => {
                      if (value.hyperlink === undefined) {
                        return (
                          <Grid item xs={12} key={value.label}>
                            <Typography variant="caption" style={{ textTransform: 'uppercase' }}>
                              {value.label}: {value.text}
                            </Typography>
                          </Grid>
                        )
                      } else {
                        return (
                          <Grid item xs={12} key={value.label}>
                            <Typography variant="caption" style={{ textTransform: 'uppercase' }}>
                              {value.label}: <a href={value.hyperlink} target="_blank" rel="noopener noreferrer">{value.text}</a>
                            </Typography>
                          </Grid>
                        )
                      }
                    })}
                    <Grid item xs={12}>
                    </Grid>
                    <Grid item xs={12}>
                      {data.processed.tags.map((tag) =>
                        <Tooltip title={tag.text}
                          key={tag.text}
                          placement="bottom">
                          <Chip className={classes.chip} key={tag.label}
                            avatar={<Icon className={`${classes.icon} mdi ${tag.icon || default_tag_icon} mdi-18px`} />}
                            label={<Highlight
                              Component={(props) => <span {...props} className={classes.chipLabel}>{props.children}</span>}
                              text={`${tag.label}: ${tag.text}`}
                              highlight={search}
                            />}
                            onClick={() => {
                              if (tag.clickable){
                                props.onChipClick(tag.text)
                              }
                            }}
                          />
                        </Tooltip>)}
                    </Grid>
                    {Object.entries(data.processed.keywords).map(([label, value]) =>(
                      <Grid item xs={12} key={value.label}>
                        <Typography variant="caption">
                          {value.label}: 
                        </Typography>
                        {value.value.map(v=>(
                          <Tooltip title={v}
                            key={v}
                            placement="bottom">
                            <Chip className={classes.chip} key={v}
                              avatar={<Icon className={`${classes.icon} mdi ${value.icon || default_tag_icon} mdi-18px`} />}
                              label={<Highlight
                                Component={(props) => <span {...props} className={classes.chipLabel}>{props.children}</span>}
                                text={`${v}`}
                                highlight={search}
                              />}
                              onClick={() => {
                                props.onChipClick(v)
                              }}
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
              <Grid container direction={'column'}>
                { props.current_table === 'libraries' || props.deactivate_download ? null :
                  <Grid item>
                    <Options type={props.current_table} item={data.original} ui_values={ui_values}
                      submit={() => {
                        console.log('submitted')
                      }} schemas={schemas} history={props.history}/>
                  </Grid>
                }
                { data.processed.scores !== undefined ?
                  <Grid item>
                    <ScorePopper scores={data.processed.scores}
                      score_icon={score_icon}
                      sorted={props.sorted}
                      sortBy={props.sortBy}
                      classes={classes}
                    />
                  </Grid> : null
                }
                { !props.deactivate_download && data.processed.download !== undefined && data.processed.download.length > 0 ?
                  <Grid item style={{ textAlign: "center" }}>
                    <DownloadButton data={data.processed.download} {...props} />
                  </Grid> : null
                }
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
        <Collapse in={props.expanded} timeout="auto" unmountOnExit>
          <CardContent>
            {expandRenderer({data, ...props})}
            {/* <ExpandedMeta data={data} {...props}/> */}
          </CardContent>
        </Collapse>
      </Card>
    )
  }
  