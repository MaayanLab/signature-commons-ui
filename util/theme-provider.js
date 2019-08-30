import { createMuiTheme } from '@material-ui/core'
import blue from '@material-ui/core/colors/blue';
import red from '@material-ui/core/colors/red';
import amber from '@material-ui/core/colors/amber';
import grey from '@material-ui/core/colors/grey';
import green from '@material-ui/core/colors/green';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: blue[500],
    },
    secondary: {
      main: '#F37F21',
    },
    error: {
      main: red[500],
    },
    // error: will use the default color
  },
  chipColors: {
    default: { backgroundColor: grey[500], color: '#FFF' },
    defaultLight: { backgroundColor: grey[300], color: '#000' },
    warning: { backgroundColor: amber[300], color: '#000' },
    alert: { backgroundColor: red[300], color: '#000' },
    healthy: { backgroundColor: green[300], color: '#000' },
  },
  overrides: {
    MUIDataTable: {
      responsiveScroll: {
        maxHeight: '500px',
        minHeight: '500px',
      },
    },
    MUIDataTableHeadCell: {
      root: {
        fontSize: 13,
      },
    },
    MuiChip: {
      root: {
        margin: "5px 10px 5px 0",
      },
    },
  },
})
// Weird hack to remove table shadows
theme.shadows[4] = theme.shadows[0]

export default theme