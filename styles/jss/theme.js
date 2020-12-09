
const Greens = ['#50a050', '#47a347']
const Blues = ['#2198f3', '#2f9cef']
const Purples = ['#a03cb4', '#9d42af']
const Reds = ['#e63c3c', '#ea4141']
const Oranges = ['#fa9614', '#ef931c']
const Grays = ['#9e9e9e', '#c9c9c9']

// const LandingColors = ['#9e9e9e', '#c9c9c9']


export const GrayCardHeader = {
  background:
    'linear-gradient(45deg, ' + Grays[0] + ', ' + Grays[1] + ')',
}

export const GreenCardHeader = {
  background:
    'linear-gradient(45deg, ' + Greens[0] + ', ' + Greens[1] + ')',
}

export const BlueCardHeader = {
  background:
    'linear-gradient(45deg, ' + Blues[0] + ', ' + Blues[1] + ')',
}

export const PurpleCardHeader = {
  background:
    'linear-gradient(45deg, ' + Purples[0] + ', ' + Purples[1] + ')',
}

export const RedCardHeader = {
  background:
    'linear-gradient(45deg, ' + Reds[0] + ', ' + Reds[1] + ')',
}

export const OrangeCardHeader = {
  background:
    'linear-gradient(45deg, ' + Oranges[0] + ', ' + Oranges[1] + ')',
}

export const card = {
  overflow: 'inherit',
  textAlign: 'right',
  padding: 16,
  minHeight: 80,
}

export const main = {
  flex: '1',
  marginRight: '1em',
  marginTop: 20,
}

export const black = '#000'
export const white = '#FFF'

export const landingStyle = (theme) => ({
  KeyLabel: {
    borderRight: 'solid #c9c9c9',
    borderWidth: '1px',
  },
  toggleContainer: {
    height: 56,
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: `${theme.spacing(1)}px 0`,
  },
  centered: {
    textAlign: 'center',
  },
  vertical20: {
    verticalAlign: '20%',
  },
  vertical55: {
    verticalAlign: '55%',
  },
  topCard: {
    padding: '20px',
    background: theme.card['topCard'].palette.main || theme.palette.defaultCard.main,
    color: theme.card['topCard'].palette.contrastText || theme.palette.defaultCard.contrastText,
    ...theme.card['topCard'].overrides,
  },
  stretched: {
    width: '80%',
  },
  title: {
    color: '#FFF',
    fontSize: 35,
  },
  subtitle: {
    color: '#FFF',
    fontSize: 14,
  },
  titleBlack: {
    color: '#000',
    textAlign: 'center',
  },
  button: {
    background:
      'linear-gradient(45deg, ' + Blues[0] + ', ' + Blues[1] + ')',
    margin: theme.spacing(1),
  },
  leftIcon: {
    marginRight: theme.spacing(1),
  },
  rightIcon: {
    marginLeft: theme.spacing(1),
  },
  iconSmall: {
    fontSize: 20,
  },
  cardIcon: {
    borderRadius: '3px',
    margin: '20px 20px 5px 20px',
    float: 'left',
    zIndex: 100,
  },
  bottomLink: {
    'background': theme.card['bottomCard'].palette.main || theme.palette.defaultCard.main,
    'color': theme.card['bottomCard'].palette.contrastText || theme.palette.defaultCard.contrastText,
    '&:hover': {
      background: theme.card['bottomCard'].palette.dark || theme.palette.defaultCard.dark,
    },
    ...theme.card['bottomCard'].overrides,
  },
  icon_light: {
    float: 'right',
    width: 75,
    height: 75,
    padding: 14,
    color: theme.card['bottomCard'].palette.contrastText || theme.palette.defaultCard.contrastText || '#424242',
  },
  icon: {
    float: 'right',
    width: 75,
    height: 75,
    padding: 14,
    color: theme.card['bottomCard'].palette.contrastText || theme.palette.defaultCard.contrastText || white,
  },
  textField: {
    margin: '-20px 8px 8px 8px',
  },
  whiteText: {
    color: '#FFF',
  },
  statCard: {
    color: '#FFF',
    padding: 20,
  },
  bigIcon: {
    width: 50,
    height: 50,
    float: 'right',
  },
  basicCard: {
    overflow: 'inherit',
    textAlign: 'right',
    padding: 16,
    minHeight: 80,
  },
  GrayCardHeader,
  BlueCardHeader,
})

export const extraComponentStyle = (theme) => ({
  paragraph: {
    padding: '8px',
    fontSize: '15px',
  },
  listItem: {
    padding: '8px',
  },
})

export const styles = (theme) => ({
  root: {
    flexGrow: 1,
  },
  unpadded: {
    padding: 0,
  },
  paddedCard: {
    padding: '10px',
  },
  topCard: {
    background:
        'linear-gradient(45deg, ' + Grays[0] + ', ' + Grays[1] + ')',
  },
  progress: {
    margin: theme.spacing(2),
  },
  ProgressContainer: {
    marginLeft: 'auto',
    marginRight: 0,
    height: 30,
    width: 120,
  },
  main: {
    flex: '1',
    marginRight: '1em',
    marginTop: 20,
  },
  numcard: {
    overflow: 'inherit',
    textAlign: 'right',
    padding: 16,
    height: 70,
  },
  card: {
    overflow: 'inherit',
    textAlign: 'right',
    padding: 16,
    minHeight: 80,
  },
  currentVesion: {
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  highlighted: {
    color: '#FFD042',
  },
  longcard: {
    overflow: 'inherit',
    textAlign: 'right',
    padding: 16,
    minHeight: 600,
  },
  title: {
    fontSize: '10px',
  },
  bigtitle: {
    color: '#FFF',
    fontSize: 35,
  },
  bigtext: {
    fontSize: '15px',
  },
  statnum: {
    fontSize: '15px',
  },
  textField: {
    margin: '-20px 8px 8px 8px',
  },
  textFieldWidth: {
    maxWidth: 120,
  },
  menu: {
    width: 200,
  },
  namebox: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    margin: '8px 8px 8px 8px',
    fontSize: '15px',
  },
  container: {
    margin: '0 auto',
    maxWidth: '1280px',
    width: '90%',
  },
  ['@media only screen and (min-width: 601px)']: {
    container: {
      width: '85%',
    },
  },
  ['@media only screen and (min-width: 1360px)']: {
    container: {
      width: '70%',
    },
  },

})
