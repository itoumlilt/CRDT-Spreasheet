import {Color} from "@material-ui/lab";
import {VectorClockContext, WallClockTimestamp} from "concordant-crdtlib";
import {Connection, Database} from "concordant-server";
import {DatabaseEventEmitter} from "concordant-server/dist/Database/Interfaces/Types";
import {SpreadSheetDocument} from "../Types/AppTypes";
import {
  ACTIVATE_CELL,
  ADD_COLUMN,
  ADD_ROW,
  CellValue,
  CellValueType,
  CLEAR_CELL,
  CLEAR_MESSAGE,
  CLOSE_CONTEXT_MENU,
  COLUMN_HEADER_MENU,
  CONNECTION_ESTABLISHED,
  DECREASE_PRECISION,
  EDIT_ACTIVE_CELL,
  EDIT_CELLS,
  GO_OFFLINE,
  GO_ONLINE,
  ICellInput,
  INCREASE_PRECISION,
  MODAL,
  ROW_HEADER_MENU,
  SET_MESSAGE,
  SPREADSHEET_SUBSCRIPTION,
  TOGGLE_ROW_HEADER,
  UPDATE_SHEET,
} from "../Types/SpreadSheetTypes";

export const activateCellAction = (payload: ICellInput) => ({
  payload,
  type: ACTIVATE_CELL,
});

export const addColumnAction = (columnIdx: number, position: "before" | "after") => ({
  payload: {columnIdx, position},
  type: ADD_COLUMN,
});

export const addRowAction = (rowIdx: number, position: "before" | "after") => ({
  payload: {rowIdx, position},
  type: ADD_ROW,
});

export const clearMessageAction = () => ({
  type: CLEAR_MESSAGE,
});

export const clickColumnHeaderAction = (event: Event) => ({
  payload: {element: event && event.currentTarget},
  type: COLUMN_HEADER_MENU,
});

export const clickRowHeaderAction = (event: Event) => ({
  payload: {element: event && event.currentTarget},
  type: ROW_HEADER_MENU,
});

export const closeContextMenuAction = (event: Event) => ({
  payload: {element: event && event.currentTarget},
  type: CLOSE_CONTEXT_MENU,
});

export const decreasePrecisionAction = () => ({
  payload: {},
  type: DECREASE_PRECISION,
});

export const editActiveCellAction = (value: CellValue, type: CellValueType) => ({
  payload: {value, type},
  type: EDIT_ACTIVE_CELL,
});

export const editCellsAction = (cells: ICellInput[]) => ({
  payload: {cells},
  type: EDIT_CELLS,
});

export const increasePrecisionAction = () => ({
  payload: {},
  type: INCREASE_PRECISION,
});

export const onConnectionAction = (connection: Connection, clientId: string) => ({
  payload: {connection, clientId},
  type: CONNECTION_ESTABLISHED,
});

export const onUpdateAction = (document: SpreadSheetDocument, context: VectorClockContext<WallClockTimestamp>) => ({
  payload: {document, context},
  type: UPDATE_SHEET,
});

export const spreadSheetSubscriptionAction = (subscription: DatabaseEventEmitter) => ({
  payload: {subscription},
  type: SPREADSHEET_SUBSCRIPTION,
});

interface IActivateCellAction {
  payload: {row: number; column: number; value: string; type: CellValueType};
  type: typeof ACTIVATE_CELL;
}

interface IAddColumnAction {
  payload: {columnIdx: string; position: "before" | "after"};
  type: typeof ADD_COLUMN;
}

interface IAddRowAction {
  payload: {rowIdx: string; position: "before" | "after"};
  type: typeof ADD_ROW;
}

interface IClearCellAction {
  payload: {key: string; row: number; column: number};
  type: typeof CLEAR_CELL;
}

interface IClearMessageAction {
  type: typeof CLEAR_MESSAGE;
}

interface ICloseContextMenuAction {
  payload: {element: HTMLElement};
  type: typeof CLOSE_CONTEXT_MENU;
}

interface IColumnHeaderMenuAction {
  payload: {element: HTMLElement};
  type: typeof COLUMN_HEADER_MENU;
}

interface IConnectionEstablishedAction {
  payload: {connection: Database; clientId: string};
  type: typeof CONNECTION_ESTABLISHED;
}

interface IDecreasePrecisionAction {
  type: typeof DECREASE_PRECISION;
}

interface IEditActiveCellAction {
  payload: {value: string; type: CellValueType};
  type: typeof EDIT_ACTIVE_CELL;
}

interface IEditCellsAction {
  payload: {
    cells: Array<{key: string; row: number; column: number; value: CellValue; type: CellValueType}>;
  };
  type: typeof EDIT_CELLS;
}

interface IGoOfflineAction {
  payload: {success: boolean};
  type: typeof GO_OFFLINE;
}

interface IGoOnlineAction {
  payload: {success: boolean};
  type: typeof GO_ONLINE;
}

interface IIncreasePrecisionAction {
  type: typeof INCREASE_PRECISION;
}

interface IModalAction {
  payload: {modalName: string};
  type: typeof MODAL;
}

interface IRowHeaderMenuAction {
  payload: {element: HTMLElement};
  type: typeof ROW_HEADER_MENU;
}

interface ISetMessageAction {
  payload: {message: string; severity: Color};
  type: typeof SET_MESSAGE;
}

interface ISpreadSheetSubscriptionAction {
  payload: {subscription: DatabaseEventEmitter};
  type: typeof SPREADSHEET_SUBSCRIPTION;
}

interface IToggleRowHeaderAction {
  payload: {element: HTMLElement};
  type: typeof TOGGLE_ROW_HEADER;
}

interface IUpdateSheetAction {
  payload: {
    document: SpreadSheetDocument;
    context: VectorClockContext<WallClockTimestamp>;
  };
  type: typeof UPDATE_SHEET;
}

export type SpreadSheetActionTypes =
  | IActivateCellAction
  | IAddColumnAction
  | IAddRowAction
  | IClearCellAction
  | IClearMessageAction
  | ICloseContextMenuAction
  | IColumnHeaderMenuAction
  | IConnectionEstablishedAction
  | IDecreasePrecisionAction
  | IEditActiveCellAction
  | IEditCellsAction
  | IIncreasePrecisionAction
  | IModalAction
  | IRowHeaderMenuAction
  | ISetMessageAction
  | ISpreadSheetSubscriptionAction
  | IToggleRowHeaderAction
  | IUpdateSheetAction;
