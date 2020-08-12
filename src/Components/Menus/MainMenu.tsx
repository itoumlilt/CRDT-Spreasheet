/**
 * MIT License
 *
 * Copyright (c) 2020, Concordant and contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { Divider, IconButton } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Box from "@material-ui/core/Box";
import Drawer from "@material-ui/core/Drawer";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import Grid from "@material-ui/core/Grid";
import InputAdornment from "@material-ui/core/InputAdornment";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import {
  createStyles,
  fade,
  makeStyles,
  Theme
} from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import TextField from "@material-ui/core/TextField";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import BookIcon from "@material-ui/icons/Book";
import EditIcon from "@material-ui/icons/Edit";
import UserIcon from "@material-ui/icons/Face";
import DescriptionIcon from "@material-ui/icons/Description";
import GridOnIcon from "@material-ui/icons/GridOn";
import HowToReg from "@material-ui/icons/HowToReg";
import MenuIcon from "@material-ui/icons/Menu";
import { WallClockTimeContext } from "concordant-crdtlib";
import { Connection } from "concordant-server";
import React from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import { bindActionCreators, Dispatch } from "redux";
import { Authentication } from "../Authentication/Authentication";
import { goOfflineAction, goOnlineAction } from "../Common/Actions/AppActions";
import {
  loginAction,
  loginErrorAction,
  logoutAction
} from "../Common/Actions/AuthenticationActions";
import { editActiveCellAction } from "../Common/Actions/SpreadSheetActions";
import { IRootState } from "../Common/Types/AppTypes";
import {
  ICellInput,
  ISpreadSheetConfig
} from "../Common/Types/SpreadSheetTypes";
import { IUser } from "../Common/Types/UserTypes";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    fullList: {
      width: "auto"
    },
    list: {
      width: 250
    },
    menuButton: {
      marginRight: theme.spacing(2)
    },
    root: {
      flexGrow: 1
    },
    textField: {
      "&$focused": {
        backgroundColor: "#fff",
        borderColor: theme.palette.primary.main,
        boxShadow: `${fade(theme.palette.primary.main, 0.25)} 0 0 0 2px`
      },
      "&:hover": {
        backgroundColor: "#fff"
      },
      backgroundColor: "#fcfcfb",
      border: "1px solid #e2e2e1",
      borderRadius: 4,
      overflow: "hidden",
      transition: theme.transitions.create(["border-color", "box-shadow"])
    },
    title: {
      flexGrow: 1,
      paddingTop: theme.spacing(1)
    },
    toolbar: {},
    toolbarTwoRows: {
      minHeight: "90px"
    }
  })
);

interface IEditBarState {
  value: string;
}

interface IMainMenuStateProps {
  isOnline?: boolean;
  activeCell?: ICellInput;
  editValue?: string;
  modalName?: string;
  user?: IUser;
}

interface IMainMenuDispatchProps {
  toggleOnlineState: typeof toggleOnlineStateAction;
  editActiveCell: typeof editActiveCellAction;
  login: typeof loginAction;
  loginError: typeof loginErrorAction;
  logout: typeof logoutAction;
}

interface IMainMenuOwnProps {
  config: ISpreadSheetConfig;
  connection: Connection; // why does the menu require connection as a property. Read it from state
  context: WallClockTimeContext;
}

const MainMenu = (props: Props) => {
  const {
    activeCell,
    editValue,
    config,
    connection,
    context,
    editActiveCell,
    isOnline,
    toggleOnlineState,
    login,
    loginError,
    logout,
    user
  } = props;
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<undefined | HTMLElement>(
    undefined
  );
  const history = useHistory();
  const handleMenu = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(undefined);
  const handleToggleOnlineState = () =>
    toggleOnlineState(!isOnline, connection);
  const handleOpenSpreadSheet = () => {
    setAnchorEl(undefined);
    history.push("/spreadsheet");
  };

  const handleOpenUserPanel = () => {
    setAnchorEl(undefined);
    history.push("/userpanel");
  };

  const handleOpenWhiteboard = () => {
    setAnchorEl(undefined);
    history.push("/whiteboard");
  };

  const handleOpenNotepad = () => {
    setAnchorEl(undefined);
    history.push("/notepad");
  };

  /*
  const handleOpenGraphicsModal = () => {
    setAnchorEl(undefined);
    modal(GRAPHICS_MODAL);
  };
  */
  const drawerOpen = Boolean(anchorEl);
  const activeCellValue = editValue || "";

  const handleChangeEditBar = (event: React.ChangeEvent<IEditBarState>) => {
    if (activeCell) {
      if (editActiveCell !== undefined) {
        editActiveCell(event.target.value, "string");
      }
    }
  };

  // TODO: Simplify the UI code
  return (
    <Box className={classes.root}>
      <AppBar position="fixed">
        <Toolbar
          className={
            config.config.editBar ? classes.toolbarTwoRows : classes.toolbar
          }
        >
          <Grid container>
            <Grid item xs={12}>
              <Box display={"flex"}>
                <IconButton
                  aria-label="menu"
                  className={classes.menuButton}
                  color="inherit"
                  edge="start"
                  onClick={handleMenu}
                >
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6" className={classes.title}>
                  {config.title || "Collaborative Spreadsheet"}
                </Typography>
                <Box>
                  <FormGroup row>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isOnline}
                          onChange={handleToggleOnlineState}
                          color="secondary"
                        />
                      }
                      label={isOnline ? "Online" : "Offline"}
                    />
                  </FormGroup>
                </Box>
              </Box>
            </Grid>
            {config.config.editBar && (
              <Grid item xs={12}>
                <Box>
                  <TextField
                    fullWidth
                    value={activeCellValue}
                    onChange={handleChangeEditBar}
                    className={classes.textField}
                    InputProps={{
                      disableUnderline: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <EditIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>
              </Grid>
            )}
          </Grid>
          <Drawer open={drawerOpen} onClose={handleClose}>
            <List className={classes.list}>
              <ListItem button onClick={handleOpenSpreadSheet}>
                <ListItemIcon>
                  <GridOnIcon />
                </ListItemIcon>
                <ListItemText primary={"SpreadSheet"} />
              </ListItem>
              <ListItem button onClick={handleOpenWhiteboard}>
                <ListItemIcon>
                  <BookIcon />
                </ListItemIcon>
                <ListItemText primary={"Whiteboard"} />
              </ListItem>
              <ListItem button onClick={handleOpenNotepad}>
                <ListItemIcon>
                  <DescriptionIcon />
                </ListItemIcon>
                <ListItemText primary={"Notepad"} />
              </ListItem>
              <ListItem button onClick={handleOpenUserPanel}>
                <ListItemIcon>
                  <UserIcon />
                </ListItemIcon>
                <ListItemText primary={"User panel"} />
              </ListItem>
            </List>
            <Divider />
            <List>
              <ListItem>
                <ListItemIcon>
                  <HowToReg />
                </ListItemIcon>
                <ListItemText
                  primary={user ? "Hello " + user.firstName : "Sign in"}
                />
              </ListItem>
              <ListItem>
                <Authentication
                  {...{
                    connection,
                    context,
                    login,
                    loginError,
                    logout,
                    user
                  }}
                />
              </ListItem>
            </List>
          </Drawer>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

const toggleOnlineStateAction = (online: boolean, connection?: Connection) =>
  online ? goOnlineAsyncAction(connection) : goOfflineAsyncAction(connection);

const goOnlineAsyncAction = (connection?: Connection) => {
  return (dispatch: Dispatch) => {
    if (!connection) {
      return;
    }
    return connection.goOnline().then(() => dispatch(goOnlineAction()));
  };
};

const goOfflineAsyncAction = (connection?: Connection) => {
  return (dispatch: Dispatch) => {
    if (!connection) {
      return;
    }
    return connection.goOffline().then(() => dispatch(goOfflineAction()));
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators(
    {
      editActiveCell: editActiveCellAction,
      login: loginAction,
      loginError: loginErrorAction,
      logout: logoutAction,
      toggleOnlineState: toggleOnlineStateAction
    },
    dispatch
  );
};

const mapStateToProps = (
  { authentication, app, spreadSheet }: IRootState,
  ownProps: IMainMenuOwnProps
) => {
  const { isOnline, modalName } = app;
  const { editBarValue, activeCell } = spreadSheet;
  const { user } = authentication;
  const { connection, context } = ownProps;
  return {
    connection,
    context,
    isOnline,
    modalName,
    editBarValue,
    activeCell,
    user
  };
};

type Props = IMainMenuStateProps & IMainMenuDispatchProps & IMainMenuOwnProps;
export default connect(mapStateToProps, mapDispatchToProps)(MainMenu);
