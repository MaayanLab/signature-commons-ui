
const Greens = ['#50a050', '#47a347']
const Blues = ['#2198f3', '#2f9cef']
const Purples = ['#a03cb4', '#9d42af']
const Reds = ['#e63c3c', '#ea4141']
const Oranges = ['#fa9614', '#ef931c']

const LandingColors = ['#9e9e9e', '#c9c9c9']

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
  topCard: {
    background:
      'linear-gradient(45deg, ' + LandingColors[0] + ', ' + LandingColors[1] + ')',
    padding: '50px 10px 10px 10px',
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
    margin: theme.spacing.unit,
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
  iconSmall: {
    fontSize: 20,
  },
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
  topCard: {
    background:
        'linear-gradient(45deg, ' + LandingColors[0] + ', ' + LandingColors[1] + ')',
    padding: '10px',
  },
  progress: {
    margin: theme.spacing.unit * 2,
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
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    maxWidth: 120,
    margin: '-20px 8px 8px 8px',
  },
  menu: {
    width: 200,
  },
  namebox: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
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
