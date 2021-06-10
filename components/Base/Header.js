import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { makeTemplate } from '../../util/ui/makeTemplate'
import { useWidth } from '../../util/ui/useWidth'

import dynamic from 'next/dynamic'
const AppBar = dynamic(()=>import('@material-ui/core/AppBar'));
const Toolbar = dynamic(()=>import('@material-ui/core/Toolbar'));
const Typography = dynamic(()=>import('@material-ui/core/Typography'));
const Button = dynamic(()=>import('@material-ui/core/Button'));
const List = dynamic(()=>import('@material-ui/core/List'));
const ListItem = dynamic(()=>import('@material-ui/core/ListItem'));
const Breadcrumbs = dynamic(()=>import('@material-ui/core/Breadcrumbs'));
const Hidden = dynamic(()=>import('@material-ui/core/Hidden'));
const SwipeableDrawer = dynamic(()=>import('@material-ui/core/SwipeableDrawer'));
const MenuIcon = dynamic(()=>import('@material-ui/icons/Menu'));
const Menu = dynamic(()=>import('@material-ui/core/Menu'));
const Collapse = dynamic(()=>import('@material-ui/core/Collapse'));
const Container = dynamic(()=>import('@material-ui/core/Container'));

const styles = (theme) => ({
  grow: {
    flexGrow: 1,
  },
  header: {
    whiteSpace: 'nowrap',
    color: 'inherit',
  },
  breadcrumb: {
    whiteSpace: 'nowrap',
    color: 'inherit',
  },
  link: {
    color: 'inherit',
  },
  menuItem: {
    color: 'inherit',
    paddingLeft: 17,
    paddingRight: 17
  },
  paper: {
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
  },
  menuButton: {
    margin: 0,
  },
})

export const CustomListItem = (props) => {
  const { type, menus=[], open, ...rest} = props

  if (menus.length > 1) {
    return(
      <React.Fragment>
        <Hidden mdDown>
          <ListItem button 
            {...rest}
          />
        </Hidden>
        <Hidden lgUp>
          <ListItem button 
            {...rest}
          />
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" style={{paddingLeft: 20}}>
              {menus}
            </List>
          </Collapse>
        </Hidden>
      </React.Fragment>
    )
  }else {
    return <ListItem button component="a" {...rest} />
  }
}

const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
  },
})((props) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    {...props}
  />
));

export function Nav(props) {
  const { ui_values, location, classes, onClose } = props
  const {preferred_name} = ui_values
  const search_tab_list = Object.values(ui_values.nav).sort((a,b)=>(a.priority-b.priority))
  const [anchorEl, setAnchorEl] = useState(null)
  const [open, setOpen] = useState(null)
  const [menus, setMenus] = useState([])

  const handleClick = (event, endpoint, menus) => {
    if (menus.length > 1){
      setOpen(endpoint)
      setMenus(menus)
      setAnchorEl(event.currentTarget)
    }
  };

  const handleClose = () => {
    setOpen(null)
    setMenus([])
    setAnchorEl(null);
    if (onClose!==undefined) onClose()
  };

  const active_tabs = []
  for (const p of search_tab_list){
    if (p.active) {
      const menus = []
      if (p.props!==undefined && p.props.types !== undefined){
        for (const [k,v] of Object.entries(p.props.types).sort((a,b)=>(a[1].priority ||0)-(b[1].priority || 0))) {
          if (v.active){
            const label = preferred_name[k] || k
            menus.push(
              <CustomListItem
                key={label}
                // selected={location.pathname.includes(`${m.endpoint}`)}
                className={classes.menuItem}
                href={`#${p.endpoint}/${label}`}
                onClick={handleClose}
              >
                <Typography variant={"body2"}>
                  {label}
                </Typography>
              </CustomListItem>
            )
          }
        }
      }else if (p.props!==undefined && p.props.iframe !== undefined && Object.keys(p.props.iframe).length > 1){
        for (const [k,v] of Object.entries(p.props.types).sort((a,b)=>(a[1].priority ||0)-(b[1].priority || 0))) {
          const label = preferred_name[k] || k
          menus.push(
            <CustomListItem
              key={label}
              // selected={location.pathname.includes(`${m.endpoint}`)}
              className={classes.menuItem}
              href={`#${p.endpoint}/${label}`}
              onClick={handleClose}
            >
              <Typography variant={"body2"}>
                {label}
              </Typography>
            </CustomListItem>
          )
        } 
      }
      active_tabs.push(
        <CustomListItem
          key={p.endpoint}
          selected={location.pathname.startsWith(`${p.endpoint}`)}
          className={classes.menuItem}
          open={open === p.endpoint}
          href={`#${p.endpoint}`}
          onClick={(event)=>{
            handleClick(event, p.endpoint, menus)
            if (onClose!==undefined && menus.length <= 1) onClose()
          }}
          menus={menus}
        >
          <Typography variant={"body2"}>
            {p.navName || p.endpoint.substring(1).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ')}
          </Typography>
        </CustomListItem>
      )
    }
  }

  return (
    <React.Fragment>
      {active_tabs}
      <Hidden mdDown>
        <StyledMenu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          {...props}
        >
          {menus}
        </StyledMenu>
      </Hidden>
      {/* <Hidden lgUp>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {menus}
          </List>
        </Collapse>
      </Hidden> */}
    </React.Fragment>
  )
}


const Header = (props) => {
  const [open, setOpen] = useState(false)
  const paths = props.location.pathname.split('/')
  const { staticContext, classes, ...rest } = props
  const toggleDrawer = () => {
    setOpen(!open)
  }
  const width = useWidth()
  return (
    <header {...props.ui_values.header_info.header_props}>
      <AppBar position="static" color="primary" style={{minHeight: 50}}>
        <Container maxWidth={width==="xl" ? "lg":"xl"}>
          <Toolbar>
            <Hidden mdDown>
              <Typography variant="h5" color="inherit" className={classes.grow}>
                <Link
                  to="/"
                  className={classes.header}
                >
                  {props.ui_values.header_info.header_left}<img {...props.ui_values.header_info.icon} src={makeTemplate(props.ui_values.header_info.icon.src, {})} />{props.ui_values.header_info.header_right}
                </Link>
              </Typography>
              <List
                {...props.ui_values.header_info.menu_props}
              >
                <Nav classes={classes} {...rest}/>
              </List>
            </Hidden>
            <Hidden lgUp>
              <Typography variant={props.ui_values.header_info.variant || 'h5'} color="inherit" className={classes.grow}>
                <Link
                  to="/"
                  className={classes.header}
                >
                  {props.ui_values.header_info.header_left}<img {...props.ui_values.header_info.icon} src={makeTemplate(props.ui_values.header_info.icon.src, {})} />{props.ui_values.header_info.header_right}
                </Link>
              </Typography>
              <Button edge="start" className={classes.menuButton} onClick={toggleDrawer} color="inherit" aria-label="menu">
                <MenuIcon />
              </Button>
              <SwipeableDrawer
                open={open}
                onClose={toggleDrawer}
                onOpen={toggleDrawer}
              >
                <div
                  tabIndex={0}
                  role="button"
                  // onClick={toggleDrawer}
                  onKeyDown={toggleDrawer}
                >
                  <List disablePadding>
                    <Nav classes={classes} {...rest} onClose={toggleDrawer}/>
                  </List>
                </div>
              </SwipeableDrawer>
            </Hidden>
          </Toolbar>
        </Container>
      </AppBar>
      {paths.length <= 3 ? <div style={{height:20}}/> : (
          <Breadcrumbs separator={<span className="mdi mdi-arrow-right-bold-circle-outline"/>}
            aria-label="breadcrumb"
            component={'div'}
            style={{
              paddingLeft: 15,
              height: 20,
            }}>
            {paths.slice(1).map((path, i) => {
              const href = paths.slice(0, i + 2).join('/')
              return (
                <Typography color={'inherit'} key={href} variant={"caption"}>
                  <Link
                    key={href}
                    to={href}
                    className={classes.breadcrumb}
                  >
                    {path.replace(/_/g, ' ')}
                  </Link>
                </Typography>
              )
            })}
          </Breadcrumbs>
      )}
    </header>
  )
}



export default withStyles(styles)(Header)
