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
import {Box} from "@material-ui/core";
import {GOMapCRDT, VectorClockContext, WallClockTimestamp} from "concordant-crdtlib";
import {Connection, DatabaseHooks, Document} from "concordant-server";
import React, {useEffect} from "react";
import {connect} from "react-redux";
import {Action, bindActionCreators} from "redux";
import {ThunkDispatch} from "redux-thunk";
import {SpreadSheetRepository} from "../../Repository/SpreadSheetRepository";
import {WhiteboardRepository} from "../../Repository/WhiteboardRepository";
import {
  deleteElementsAction,
  putElementsAction,
  WhiteboardSubscriptionAction,
} from "../Common/Actions/WhiteboardActions";
import {styles} from "../Common/Styles/Styles";
import {IRootState, IWhiteboardState} from "../Common/Types/AppTypes";
import {IUser} from "../Common/Types/UserTypes";
import {IElementState, WhiteboardCRDT} from "../Common/Types/WhiteboardTypes";
import {GOMapCRDTMergeHook} from "../Common/Utils";
import {getSpreadSheetId} from "../SpreadSheet/Utils";
import {createContainerState} from "./Container";
import {ContextMenu} from "./ContextMenu";
import {FloatingAddButton} from "./FloatingAddButton";
import {createTableState} from "./Table";
import {ElementComponent, genElementId, getWhiteboardKeyForUser, removeEmptyEntries} from "./Utils";

interface IWhiteboardStateProps extends IWhiteboardState {
  user?: IUser;
}

interface IWhiteboardOwnProps {
  clientId: string;
  connection: Connection;
  context: VectorClockContext<WallClockTimestamp>;
  documentId: string;
  repository: WhiteboardRepository;
}

interface IWhiteboardDispatchProps {
  dispatchCreateContainerAction: typeof dispatchCreateContainerActionPromise;
  dispatchCreateTableAction: typeof dispatchCreateTableActionPromise;
  dispatchDeleteElementAction: typeof dispatchDeleteElementActionPromise;
  dispatchPutElementsAction: typeof dispatchPutElementsActionPromise;
  dispatchUpdateElementAction: typeof dispatchUpdateElementActionPromise;
  dispatchWhiteboardSubscriptionAction: typeof WhiteboardSubscriptionAction;
}

const elementCounter = 1;

const Whiteboard = (props: WhiteboardProps) => {
  const {
    connection,
    context,
    dispatchDeleteElementAction,
    dispatchPutElementsAction,
    dispatchUpdateElementAction,
    dispatchWhiteboardSubscriptionAction,
    documentId,
    repository,
    subscription,
    whiteboard,
  } = props;
  const classes = styles();

  // Only execute once
  useEffect(() => {
    const handleOnUpdate = (updateKey: string, doc: Document<WhiteboardCRDT>) => {
      const newWhiteboard = GOMapCRDT.fromJSON(doc.current(), context).value();
      removeEmptyEntries(newWhiteboard);
      dispatchPutElementsAction(Object.values(newWhiteboard), props);
    };

    const hooks: DatabaseHooks = {
      conflictHandler: (obj, objs) => GOMapCRDTMergeHook(obj, objs, context),
    };
    connection.registerHooks(hooks);

    if (subscription !== undefined) {
      connection.cancel(subscription);
    }

    const newSubscription = connection.subscribe<WhiteboardCRDT>(documentId, {
      change: handleOnUpdate,
    });
    dispatchWhiteboardSubscriptionAction(newSubscription);

    repository.getElements(documentId).then(elements => dispatchPutElementsAction(Object.values(elements), props));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  const [state, setState] = React.useState<{selected?: IElementState}>({selected: undefined});

  const {selected} = state;
  const toggleDrawer = (element?: IElementState) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" || (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }
    setState({...state, selected: element});
  };

  const onChangeElement = (attrName: string) => (event: {target: {value: string}}) => {
    if (selected !== undefined) {
      setState({selected: {...selected, [attrName]: event.target.value}});
      dispatchUpdateElementAction({...selected, [attrName]: event.target.value}, props);
    }
  };

  const onDeleteElement = () => {
    if (selected !== undefined) {
      setState({selected: undefined});
      dispatchDeleteElementAction(selected.id, props);
    }
  };

  return (
    <React.Fragment>
      {Object.values(whiteboard).map(e => (
        <Box key={"clickable-" + e.id}>{ElementComponent(e, {classes, onClick: toggleDrawer(e)}, props)}</Box>
      ))}
      <FloatingAddButton {...props} />
      <ContextMenu
        classes={styles()}
        selected={selected}
        toggleDrawer={toggleDrawer}
        onChangeElement={onChangeElement}
        onDeleteElement={onDeleteElement}
        whiteboardProps={props}
      />
    </React.Fragment>
  );
};

const dispatchCreateContainerActionPromise = ({context, repository, user}: WhiteboardProps) => (
  dispatch: ThunkDispatch<IWhiteboardState, {}, Action>
) =>
  user !== undefined
    ? repository
        .upsertElement(
          getWhiteboardKeyForUser(user),
          createContainerState(genElementId(context), "container-" + elementCounter)
        )
        .then(e => dispatch(putElementsAction([e])))
    : Promise.reject();

const dispatchCreateTableActionPromise = ({connection, context, repository, user}: WhiteboardProps) => (
  dispatch: ThunkDispatch<IWhiteboardState, {}, Action>
) => {
  // TODO: get this from state
  const spreadSheetRepository = new SpreadSheetRepository(connection, context);

  return user !== undefined
    ? spreadSheetRepository
        .getSpreadSheet(getSpreadSheetId(user))
        .then(spreadSheet =>
          repository.upsertElement(
            getWhiteboardKeyForUser(user),
            createTableState(genElementId(context), "table-" + elementCounter, spreadSheet.makeSpreadSheetView().cells)
          )
        )
        .then(e => dispatch(putElementsAction([e])))
    : Promise.reject();
};

const dispatchDeleteElementActionPromise = (id: string, {repository, user}: WhiteboardProps) => (
  dispatch: ThunkDispatch<IWhiteboardState, {}, Action>
) => {
  dispatch(deleteElementsAction([id]));
  return user !== undefined ? repository.deleteElements(getWhiteboardKeyForUser(user), [id]) : Promise.reject();
};

const dispatchPutElementsActionPromise = (elements: IElementState[], {user}: WhiteboardProps) => (
  dispatch: ThunkDispatch<IWhiteboardState, {}, Action>
) => (user !== undefined ? dispatch(putElementsAction(elements)) : Promise.reject());

const dispatchUpdateElementActionPromise = (element: IElementState, {repository, user}: WhiteboardProps) => (
  dispatch: ThunkDispatch<IWhiteboardState, {}, Action>
) => {
  dispatch(putElementsAction([element]));
  return user !== undefined ? repository.upsertElement(getWhiteboardKeyForUser(user), element) : Promise.reject();
};

const mapDispatchToProps = (dispatch: ThunkDispatch<IWhiteboardState, {}, Action>) => {
  return bindActionCreators(
    {
      dispatchCreateContainerAction: dispatchCreateContainerActionPromise,
      dispatchCreateTableAction: dispatchCreateTableActionPromise,
      dispatchDeleteElementAction: dispatchDeleteElementActionPromise,
      dispatchPutElementsAction: dispatchPutElementsActionPromise,
      dispatchUpdateElementAction: dispatchUpdateElementActionPromise,
      dispatchWhiteboardSubscriptionAction: WhiteboardSubscriptionAction,
    },
    dispatch
  );
};

const mapStateToProps = (state: IRootState, props: IWhiteboardOwnProps) => {
  const {subscription, whiteboard} = state.whiteboard;
  const {user} = state.authentication;
  return {...props, user, whiteboard, subscription};
};

export type WhiteboardProps = IWhiteboardStateProps & IWhiteboardDispatchProps & IWhiteboardOwnProps;
export default connect(mapStateToProps, mapDispatchToProps)(Whiteboard);
