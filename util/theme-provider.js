import blue from '@material-ui/core/colors/blue'
import red from '@material-ui/core/colors/red'
import amber from '@material-ui/core/colors/amber'
import grey from '@material-ui/core/colors/grey'
import green from '@material-ui/core/colors/green'
import yellow from '@material-ui/core/colors/yellow'

const defaultTheme = {
  palette: {
    primary: {
      main: blue[500],
      contrastText: '#FFF'
    },
    secondary: {
      main: yellow[400],
    },
    error: {
      main: red[500],
    },
    default: {
      main: grey[200],
      contrastText: '#000'
    },
    defaultCard: {
      main: grey[400],
      dark: grey[500],
      contrastText: '#FFF'
    },
    defaultButton: {
      disabled: grey[300],
      light: blue[300],
      main: blue[500],
      contrastText: '#FFF'
    },
    defaultChip: {
      light: grey[300],
      main: grey[500],
      dark: grey[700],
      contrastText: "#FFF",
      contrastTextDark: "#000"
    }
  },
  chipColors: {
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
        margin: '5px 10px 5px 0',
      },
    },
  },
}

// const theme = createMuiTheme({
//   palette: {
//     primary: {
//       main: blue[500],
//       contrastText: '#FFF'
//     },
//     secondary: {
//       main: '#F37F21',
//     },
//     error: {
//       main: red[500],
//     },
//     // error: will use the default color
//   },
//   chipColors: {
//     default: { backgroundColor: grey[500], color: '#FFF' },
//     defaultLight: { backgroundColor: grey[300], color: '#000' },
//     warning: { backgroundColor: amber[300], color: '#000' },
//     alert: { backgroundColor: red[300], color: '#000' },
//     healthy: { backgroundColor: green[300], color: '#000' },
//   },
//   overrides: {
//     MUIDataTable: {
//       responsiveScroll: {
//         maxHeight: '500px',
//         minHeight: '500px',
//       },
//     },
//     MUIDataTableHeadCell: {
//       root: {
//         fontSize: 13,
//       },
//     },
//     MuiChip: {
//       root: {
//         margin: '5px 10px 5px 0',
//       },
//     },
//   },
// })

export default defaultTheme
