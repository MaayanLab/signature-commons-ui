
const LibraryColors = ["#50a050","#47a347"]
const SignatureColors = ["#2198f3", "#2f9cef"]
const EntityColors = ["#a03cb4", "#9d42af"]
const PopularColors = ["#e63c3c", "#ea4141"]
const StatsColors = ["#fa9614", "#ef931c"]

const LandingColors = ["#9e9e9e", "#c9c9c9"]

export const LibrariesCardHeader = {
  background:
    "linear-gradient(45deg, " + LibraryColors[0] + ", " + LibraryColors[1] + ")",
};

export const SignaturesCardHeader = {
  background:
    "linear-gradient(45deg, " + SignatureColors[0] + ", " + SignatureColors[1] + ")",
};

export const EntitiesCardHeader = {
  background:
    "linear-gradient(45deg, " + EntityColors[0] + ", " + EntityColors[1] + ")",
};

export const PopularCardHeader = {
  background:
    "linear-gradient(45deg, " + PopularColors[0] + ", " + PopularColors[1] + ")",
};

export const StatsCardHeader = {
  background:
    "linear-gradient(45deg, " + StatsColors[0] + ", " + StatsColors[1] + ")",
};

export const card = {
  overflow: 'inherit',
  textAlign: 'right',
  padding: 16,
  minHeight: 80,
};

export const main = {
  flex: '1',
  marginRight: '1em',
  marginTop: 20,
};

export const black = "#000";
export const white = "#FFF";

export const landingStyle = theme => ({
  topCard: {
    background:
      "linear-gradient(45deg, " + LandingColors[0] + ", " + LandingColors[1] + ")",
      padding: "50px 10px 10px 10px"
  },
  title: {
    color: "#FFF",
  }
})

export const styles = theme => ({
    root: {
      flexGrow: 1,
    },
    progress: {
      margin: theme.spacing.unit * 2,
    },
    ProgressContainer:{
      marginLeft: 'auto',
      marginRight: 0,
      height: 30,
      width: 120
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
    title: {
      fontSize: '10px',
    },
    bigtext:{
      fontSize: '15px',
    },
    statnum: {
      fontSize: '15px',
    },
    textField: {
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit,
      width: 120,
      margin: '-20px 8px 8px 8px',
    },
    menu: {
      width: 200,
    }
});
