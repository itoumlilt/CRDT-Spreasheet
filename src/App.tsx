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
/* tslint:disable:no-console */
import Box from "@material-ui/core/Box";
import {ThemeProvider} from "@material-ui/styles";
import clsx from "clsx";
import {VectorClock, VectorClockContext, WallClock, WallClockTimeContext, WallClockTimestamp} from "concordant-crdtlib";
import {Connection, PouchDBDataSource} from "concordant-server";
import PouchDBImpl from "pouchdb";
import memory from "pouchdb-adapter-memory";
import React, {useEffect, useState} from "react";
import {connect, Provider} from "react-redux";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {Action, applyMiddleware, bindActionCreators, combineReducers, createStore} from "redux";
import thunk, {ThunkDispatch} from "redux-thunk";
import uuid from "uuid";
import "./App.css";
import {clearMessageAction, onConnectionAction} from "./Components/Common/Actions/SpreadSheetActions";
import AppAlert, {AppErrorAlert} from "./Components/Common/Alert";
import {isAuthorized, NotAuthorized} from "./Components/Common/Authorization";
import Loading from "./Components/Common/Loading";
import {AppReducer} from "./Components/Common/Reducers/AppReducer";
import {AuthenticationReducer} from "./Components/Common/Reducers/AuthenticationReducer";
import {SpreadSheetReducer} from "./Components/Common/Reducers/SpreadSheetReducer";
import {UserPanelReducer} from "./Components/Common/Reducers/UserPanelReducer";
import {WhiteboardReducer} from "./Components/Common/Reducers/WhiteboardReducer";
import {styles, theme} from "./Components/Common/Styles/Styles";
import {IRootState} from "./Components/Common/Types/AppTypes";
import {ISpreadSheetConfig} from "./Components/Common/Types/SpreadSheetTypes";
import {admin as ADMIN_ROLE, IUser, user as USER_ROLE} from "./Components/Common/Types/UserTypes";
import MainMenu from "./Components/Menus/MainMenu";
import ContextMenu from "./Components/SpreadSheet/ContextMenu";
import SpreadSheet from "./Components/SpreadSheet/SpreadSheet";
import {getSpreadSheetId} from "./Components/SpreadSheet/Utils";
import UserPanel from "./Components/UserPanel/UserPanel";
import {getWhiteboardKeyForUser} from "./Components/Whiteboard/Utils";
import Whiteboard from "./Components/Whiteboard/Whiteboard";
import {SpreadSheetRepository} from "./Repository/SpreadSheetRepository";
import {WhiteboardRepository} from "./Repository/WhiteboardRepository";
import ConcordantWysiwygEditor from "./Components/Notepad/WysiwygEditor";

PouchDBImpl.plugin(memory);

// const debugEnv: string = process.env.REACT_APP_DEBUG || "false";
// export const DEBUG = debugEnv.toLowerCase() === "true" || true /*force debug*/;

const serverAddress = (process.env.REACT_APP_SERVERURL as string) || "http://localhost:5984/c-notepad";
const memoryAdapter = process.env.REACT_APP_MEMORY_ADAPTER !== undefined || false;

console.log("Remote DBs addresses", serverAddress);

const database = {
  connectionParams: memoryAdapter ? {adapter: "memory"} : {},
  dbName: "c-labbook-db",
  remoteDBs: [serverAddress],
};

export const defaultConfig: ISpreadSheetConfig = {
  cellHeight: 10,
  cellWidth: 20,
  columnLabels: [
    "Dichte",
    "Brennverhalten",
    "Pyrolyse",
    "Löslichkeit",
    "Large Name",
    // "ermittelte Kunststoffsorte aufgrund des Vergleichs mit den Literaturwerten",
  ],
  columnTypes: ["number", "number", "number", "number", "number", "number", "number"],
  config: {
    editBar: false,
    expand: false,
  },
  headerHeight: 30,
  title: "BASF",
};

interface IAppState {
  connection?: Connection;
  connectionFailed: boolean;
}

const App = () => {
  const [{connection, connectionFailed}, setAppState] = useState<IAppState>({connectionFailed: false});
  useEffect(() => {
    const source = new PouchDBDataSource(PouchDBImpl, database);
    source
      .connection({
        autoSave: false,
        handleConflicts: true,
      })
      .then(newConn => {
        setAppState({
          connection: newConn,
          connectionFailed: false,
        });
      })
      .catch(error => {
        console.log(error);
        AppErrorAlert({
          message:
            "Your browser doesn't support the latest features od databases. We suggest to you use the latest version of Google Chrome.",
        });
        setAppState({connectionFailed: true});
      });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        {!connection && !connectionFailed && Loading("Connecting to database")}
        {!connection &&
          connectionFailed &&
          AppErrorAlert({
            message:
              "Your browser does not support embedded database, this can happen if you are using an old version, or Firefox in private mode. We suggest to use the latest version of Google Chrome.",
          })}
        {connection && <MainRedux connection={connection} />}
      </Provider>
    </ThemeProvider>
  );
};

const clientId: string = (process.env.REACT_APP_CLIENTID as string) || uuid();

// TODO: add WallClock.createFrom
const refTS = new WallClockTimestamp({clientId});
const options = {crdt_meta: "crdt_meta"};
const vectorClockContext = new VectorClockContext(clientId, VectorClock.createFrom(refTS), options);
const wallClockContext = new WallClockTimeContext(clientId, new WallClock(refTS), options);

interface IMainProps {
  connection: Connection;
  onConnection: typeof onConnectionAction;
  clearMessage: typeof clearMessageAction;
  user?: IUser;
}

const Main = (props: IMainProps) => {
  const {connection, onConnection, user} = props;
  const {editBar} = defaultConfig.config;
  const classes = styles();

  // TODO: make these state instead of properties
  const whiteboardRepository = new WhiteboardRepository(connection, wallClockContext);
  const spreadSheetRepository = new SpreadSheetRepository(connection, vectorClockContext);

  useEffect(() => {
    if (connection !== undefined) {
      onConnection(connection, clientId);
    }
  }, [connection, onConnection]);

  return (
    <Box className={clsx(editBar ? classes.editBar : classes.noEditBar, classes.baseContainer)}>
      <Router>
        <MainMenu config={defaultConfig} context={wallClockContext} {...props} />
        <Switch>
          <Route path="/spreadsheet">
            {// We can disable authentication and give a default spreadsheet
            isAuthorized(user, [USER_ROLE, ADMIN_ROLE]) ? (
              <SpreadSheet
                documentId={getSpreadSheetId(props.user)}
                clientId={clientId}
                config={defaultConfig}
                connection={connection}
                context={vectorClockContext}
                repository={spreadSheetRepository}
              />
            ) : (
              <NotAuthorized />
            )}
          </Route>
          <Route path="/whiteboard">
            {isAuthorized(user, [USER_ROLE, ADMIN_ROLE]) ? (
              <Whiteboard
                documentId={getWhiteboardKeyForUser(user)}
                clientId={clientId}
                connection={connection}
                context={vectorClockContext}
                repository={whiteboardRepository}
              />
            ) : (
              <NotAuthorized />
            )}
          </Route>
          <Route path="/userpanel">
            {isAuthorized(user, [ADMIN_ROLE]) ? (
              <UserPanel connection={connection} context={wallClockContext} />
            ) : (
              <NotAuthorized />
            )}
          </Route>
          <Route path="/notepad">
            {isAuthorized(user, [ADMIN_ROLE]) ? (
              <ConcordantWysiwygEditor value="Connecting to C-Service..." />
            ) : (
              <NotAuthorized />
            )}
          </Route>
          <Route path="/">
            <h1>Welcome</h1>
          </Route>
        </Switch>
      </Router>
      <ContextMenu config={defaultConfig} />
      <AppAlert {...props} />
    </Box>
  );
};

const mapStateToProps = ({app, authentication, spreadSheet, whiteboard}: IRootState, props: any) => {
  const {activeCell} = spreadSheet;
  const {user} = authentication;
  const {message, severity} = app;
  const {connection} = props;
  return {activeCell, connection, message, severity, user};
};

const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, Action>) => {
  return bindActionCreators(
    {
      clearMessage: clearMessageAction,
      onConnection: onConnectionAction,
    },
    dispatch
  );
};

const reducers = {
  app: AppReducer,
  authentication: AuthenticationReducer,
  spreadSheet: SpreadSheetReducer,
  userPanel: UserPanelReducer,
  whiteboard: WhiteboardReducer,
};

const store = createStore(combineReducers(reducers), applyMiddleware(thunk));
const MainRedux = connect(mapStateToProps, mapDispatchToProps)(Main);

export default App;
