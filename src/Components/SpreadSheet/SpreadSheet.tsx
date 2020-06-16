import {Box} from "@material-ui/core";
import {VectorClockContext, WallClockTimestamp} from "concordant-crdtlib";
import {Connection, DatabaseEventEmitter, DatabaseHooks} from "concordant-server";
import _ from "lodash";
import React, {useEffect} from "react";
import {connect} from "react-redux";
import SpreadsheetComponent from "react-spreadsheet";
import {Action, bindActionCreators} from "redux";
import {ThunkDispatch} from "redux-thunk";
import SpreadSheetView from "../../Model/SpreadSheetView";
import {SpreadSheetRepository} from "../../Repository/SpreadSheetRepository";
import {
  activateCellAction,
  clickColumnHeaderAction,
  clickRowHeaderAction,
  editActiveCellAction,
  editCellsAction,
  onUpdateAction,
  spreadSheetSubscriptionAction,
} from "../Common/Actions/SpreadSheetActions";
import {IRootState, ISpreadSheetState, SpreadSheetCRDT, SpreadSheetDocument} from "../Common/Types/AppTypes";
import {
  CellValue,
  CellValueType,
  ICellView,
  ISpreadSheetConfig,
  ISpreadSheetView,
} from "../Common/Types/SpreadSheetTypes";
import {GOMapCRDTMergeHook} from "../Common/Utils";
import {ActiveMenu} from "./ActiveCellMenu";
import {makeCellRenderObj} from "./Utils";

interface ISpreadSheetStateProps extends ISpreadSheetState {
  subscription?: DatabaseEventEmitter; // only one subscription at a time
}

interface ISpreadSheetDispatchProps {
  activateCell: typeof activateCellAction;
  editCells: typeof editCellsAction;
  clickColumnHeader: typeof clickColumnHeaderAction;
  clickRowHeader: typeof clickRowHeaderAction;
  editActiveCell: typeof editActiveCellAction;
  onUpdate: typeof onUpdateAction;
  spreadSheetSubscription: typeof spreadSheetSubscriptionAction;
}

interface ISpreadSheetOwnProps {
  clientId: string;
  config: ISpreadSheetConfig;
  connection: Connection;
  context: VectorClockContext<WallClockTimestamp>;
  documentId: string;
  repository: SpreadSheetRepository;
}

const SpreadSheet = (props: SpreadSheetProps) => {
  const {
    activateCell,
    clickColumnHeader,
    clickRowHeader,
    config,
    connection,
    context,
    documentId,
    editActiveCell,
    editCells,
    repository,
    spreadSheetView,
    onUpdate,
    spreadSheetSubscription,
    subscription,
  } = props;

  const handleEditActiveCell = (value: CellValue, type: CellValueType) => {
    return editActiveCell(value, type);
  };
  const handleActivateCell = (row: number, column: number, value: CellValue, type: CellValueType) =>
    activateCell({
      column,
      row,
      type,
      value,
    });

  useEffect(() => {
    const handleOnUpdate = (key: string, update: SpreadSheetDocument) => {
      return onUpdate(update, context);
    };

    const hooks: DatabaseHooks = {
      conflictHandler: (obj, objs) => GOMapCRDTMergeHook(obj, objs, context),
    };

    connection.registerHooks(hooks);

    if (subscription !== undefined) {
      connection.cancel(subscription);
    }
    const newSubscription = connection.subscribe<SpreadSheetCRDT>(documentId, {
      change: handleOnUpdate,
    });

    spreadSheetSubscription(newSubscription);

    repository.getSpreadSheetDocument(documentId).then(newSpreadSheet => onUpdate(newSpreadSheet, context));
    // eslint-disable-next-line
  }, [documentId]); // onEffect only called when documentId changes. When that happens refresh subscription

  const handleCommit = (state: any) => {
    if (!editCells) {
      return;
    }
    const ops: Array<{row: number; column: number; value: CellValue; type: CellValueType}> = [];
    if (state.pasteCounter && state.pasteCounter !== state.lastPasteCounter) {
      const {selected, copied, hasCut} = state;
      const selectedRows = Object.keys(selected);
      Object.keys(copied).forEach((rowIdx, selectRowIdx) => {
        const selectedCols = Object.keys(selected[selectedRows[selectRowIdx]]);
        return Object.keys(copied[rowIdx]).forEach((colIdx: string, selectedColIdx: number) => {
          const row = parseInt(selectedRows[selectRowIdx], 10);
          const column = parseInt(selectedCols[selectedColIdx], 10);
          if (selected[row][column] && copied[rowIdx] && copied[rowIdx][colIdx] && copied[rowIdx][colIdx].value) {
            if (hasCut === state.pasteCounter) {
              ops.push({
                column: parseInt(colIdx, 10),
                row: parseInt(rowIdx, 10),
                type: "string",
                value: "",
              });
            }
            ops.push({row, column, value: copied[rowIdx][colIdx].value, type: copied[rowIdx][colIdx].type});
          }
        });
      });
    } else {
      state.lastCommit.forEach(({nextCell}: any) => {
        if (nextCell) {
          const {row, column, value, type} = nextCell;
          if (row !== undefined && column !== undefined && value !== undefined) {
            ops.push({row, column, value, type: type || "string"});
          }
        }
      });
    }
    return editCells(ops);
  };

  return (
    <Box>
      <SpreadsheetComponent
        onCellCommit={handleCommit}
        data={mapSpreadSheetToData(spreadSheetView || new SpreadSheetView())}
        onClickColumnHeader={clickColumnHeader}
        onClickRowHeader={clickRowHeader}
        onEditValue={handleEditActiveCell}
        onActivateCell={handleActivateCell} // try not to trigger the event if is the same cell
        columnLabels={config.columnLabels}
      />
      <ActiveMenu {...props} />
    </Box>
  );
};

const mapSpreadSheetToData = (spreadSheet: ISpreadSheetView): ICellView[][] => {
  let {nRows, nColumns} = spreadSheet.size();
  nRows = Math.max(SpreadSheetView.DEFAULT_ROWS, nRows);
  nColumns = Math.max(SpreadSheetView.DEFAULT_COLUMNS, nColumns);
  const array = new Array(nRows);
  _.range(nRows).forEach((r: any) => {
    array[r] = new Array(nColumns);
    _.range(nColumns).forEach((c: number) => {
      const cellProps = {row: r, column: c, editable: true};
      if (spreadSheet.cells[r] && spreadSheet.cells[r][c] && spreadSheet.cells[r][c] !== null) {
        array[r][c] = makeCellRenderObj({...cellProps, meta: spreadSheet.cells[r][c].meta}, spreadSheet);
      }
    });
  });
  return array;
};

const mapDispatchToProps = (dispatch: ThunkDispatch<ISpreadSheetState, {}, Action>) => {
  return bindActionCreators(
    {
      activateCell: activateCellAction,
      clickColumnHeader: clickColumnHeaderAction,
      clickRowHeader: clickRowHeaderAction,
      editActiveCell: editActiveCellAction,
      editCells: editCellsAction,
      onUpdate: onUpdateAction,
      spreadSheetSubscription: spreadSheetSubscriptionAction,
    },
    dispatch
  );
};

const mapStateToProps = (state: IRootState, props: ISpreadSheetOwnProps) => {
  const {activeCell, spreadSheetView, editBarValue, subscription} = state.spreadSheet;
  const {documentId, clientId} = props;
  return {activeCell, spreadSheetView, documentId, clientId, editBarValue, subscription};
};

export type SpreadSheetProps = ISpreadSheetStateProps & ISpreadSheetDispatchProps & ISpreadSheetOwnProps;
export default connect(mapStateToProps, mapDispatchToProps)(SpreadSheet);
