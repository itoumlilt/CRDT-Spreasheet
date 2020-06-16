import {createMuiTheme, createStyles, makeStyles} from "@material-ui/core";

export const theme = createMuiTheme({
  palette: {
    secondary: {
      main: "#f0f0f0",
    },
  },
  typography: {
    body2: {
      fontWeight: "bold",
    },
  },
});

export const styles = makeStyles(() =>
  createStyles({
    baseContainer: {paddingTop: 20},
    container: {
      display: "flex",
      flexWrap: "wrap",
      "& > *": {
        margin: theme.spacing(1),
        width: "100%",
      },
    },
    contextDrawer: {
      width: 250,
    },
    contextMenuInputLabel: {
      marginLeft: 10,
      marginRight: 10,
    },
    draggableContainer: {
      border: "1px black solid",
    },
    editBar: {marginTop: 10, marginBottom: 65},
    filterBar: {
      "& > *": {
        margin: theme.spacing(1),
      },
      display: "flex",
      flexWrap: "wrap",
    },
    hideBackdrop: {
      background: "none",
    },
    noEditBar: {marginTop: 40, marginBottom: 65},

    tableContainer: {
      margin: 10,
      padding: 10,
    },

    paper: {},

    spreadSheetContainer: {
      height: "100",
      overflowX: "scroll",
      width: "100%",
    },

    fab: {
      bottom: theme.spacing(2),
      position: "absolute",
      right: theme.spacing(2),
    },
    whiteboardContextMenu: {
      width: 250,
    },
  })
);
