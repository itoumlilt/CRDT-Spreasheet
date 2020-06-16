import {GOMapCRDT} from "concordant-crdtlib";
import _ from "lodash"; // TODO: Get rid of this dependency
import SpreadSheet from "../../../Model/SpreadSheet";
import SpreadSheetView from "../../../Model/SpreadSheetView";
import {SpreadSheetActionTypes} from "../Actions/SpreadSheetActions";
import {ISpreadSheetState} from "../Types/AppTypes";
import {
  ACTIVATE_CELL,
  ADD_COLUMN,
  ADD_ROW,
  CLEAR_CELL,
  DECREASE_PRECISION,
  EDIT_ACTIVE_CELL,
  EDIT_CELLS,
  ICellInput,
  INCREASE_PRECISION,
  SPREADSHEET_SUBSCRIPTION,
  UPDATE_SHEET,
} from "../Types/SpreadSheetTypes";

interface IInternalState extends ISpreadSheetState {
  spreadSheetView: SpreadSheetView;
}

const initialState: IInternalState = {
  spreadSheet: undefined,
  spreadSheetView: new SpreadSheetView(),
};

// TODO: avoid copying spreadSheetView.
// TODO: Should have an intermediate state before and after mutating the database
export function SpreadSheetReducer(state = initialState, action: SpreadSheetActionTypes): IInternalState {
  const emptyOrCloneSpreadSheet = () =>
    state.spreadSheet ? _.clone(state.spreadSheet.makeSpreadSheetView()) : new SpreadSheetView();
  switch (action.type) {
    case UPDATE_SHEET: {
      /**
       * This is action is called when Spreadsheet is updated,
       * locally or when propagation happens.
       * 
       * @argument {
            document: SpreadSheetDocument;
            context: VectorClockContext<WallClockTimestamp>;
          } action.payload New document content and it's VC
       */
      const {document, context} = action.payload;

      const spreadSheet = new SpreadSheet(GOMapCRDT.fromJSON(document.current(), context), context);

      const newSpreadSheetView = spreadSheet.makeSpreadSheetView();

      if (state.activeEditCell) {
        if (
          state.spreadSheetView.cells[state.activeEditCell.row] == null ||
          state.spreadSheetView.cells[state.activeEditCell.row][state.activeEditCell.column] == null
        ) {
          if (state.spreadSheetView.cells[state.activeEditCell.row] == null) {
            state.spreadSheetView.cells[state.activeEditCell.row] = [];
          }
          // TODO: try to get rid of this
          state.spreadSheetView.cells[state.activeEditCell.row][state.activeEditCell.column] = {
            column: state.activeEditCell.column,
            columnId: "local",
            id: "local",
            row: state.activeEditCell.row,
            rowId: "local",
            type: state.activeEditCell.type,
            value: state.activeEditCell.value || "",
          };
        } else {
          // If remote propagation, and if the user is currently editing a cell,
          // put back his text after applying changes
          newSpreadSheetView.cells[state.activeEditCell.row][state.activeEditCell.column]!.value =
            state.activeEditCell.value || "";
        }
      }

      return {
        ...state,
        document,
        spreadSheet,
        spreadSheetView: newSpreadSheetView,
      };
    }
    case ADD_COLUMN: {
      const {columnIdx, position} = action.payload;
      addColumn(parseInt(columnIdx, 10) + (position === "before" ? 0 : 1), state);
      if (state.spreadSheet && state.document) {
        state.spreadSheet.save(state.document);
      }
      return {...state, spreadSheetView: emptyOrCloneSpreadSheet()};
    }
    case ADD_ROW: {
      const {rowIdx, position} = action.payload;
      addRow(parseInt(rowIdx, 10) + (position === "before" ? 0 : 1), state);
      if (state.spreadSheet && state.document) {
        state.spreadSheet.save(state.document);
      }
      return {...state, spreadSheetView: emptyOrCloneSpreadSheet()};
    }
    case EDIT_CELLS: {
      /**
       * This action is called when the user submit a new update to one or more cells
       * The user does not have to be in edit mode to edit a cell,
       * for example when just selecting the cell and removing content,
       * that means we can EDIT_CELLS without EDIT_ACTIVE_CELL.
       *
       * @argument {Array<{key: string; row: number; column: number; value: CellValue; type: CellValueType}>} action.payload An Array of all edited cells, and the new content
       *
       * @returns Following state changes:
       * - state.spreadsheet is edited and saved with new values
       * - state.editValue set to the first cell value of edited cells (for edit bar)
       */
      const {cells} = action.payload;
      editCells(cells, state);
      // Always sets the editbar with the value of the first cell
      const editBarValue = cells.length >= 1 ? cells[0].value.toString() : state.editBarValue;
      if (state.spreadSheet && state.document) {
        state.spreadSheet.save(state.document);
      }
      return {
        ...state,
        editBarValue /* , spreadSheetView: emptyOrCloneSpreadSheet() */,
        activeEditCell: undefined,
      };
    }
    case INCREASE_PRECISION: {
      if (state.activeCell) {
        increasePrecision([state.activeCell], state);
        if (state.spreadSheet && state.document) {
          state.spreadSheet.save(state.document);
        }
      }
      return {...state};
    }
    case DECREASE_PRECISION: {
      if (state.activeCell) {
        decreasePrecision([state.activeCell], state);
      }
      if (state.spreadSheet && state.document) {
        state.spreadSheet.save(state.document);
      }
      return {...state};
    }
    case CLEAR_CELL: {
      /**
       * TODO when is this called?
       */
      const {row, column} = action.payload;
      clearCell(row, column, state);
      if (state.spreadSheet && state.document) {
        state.spreadSheet.save(state.document);
      }
      return {
        ...state,
        editBarValue: "",
        spreadSheetView: emptyOrCloneSpreadSheet(),
      };
    }
    case ACTIVATE_CELL: {
      /**
       * This action is called ... too much times ... TODO reduce this?
       * - (3 times) at init when nothing is activated: ROW=undefined;COLUMN=undefined;VALUE=;TYPE=undefined
       * - (3 times) when a cell is clicked (and not double clicked to edit-it): ROW=0;COLUMN=0;VALUE=;TYPE=undefined
       * - (2 times) when second click to edit the cell happens:ROW=0;COLUMN=0;VALUE=;TYPE=undefined
       * - (2 times) when leaving a clicked cell (and not double clicked to edit-it) by pressing ESC: ROW=undefined;COLUMN=undefined;VALUE=;TYPE=undefined
       * - It's not called when leaving or validating a double-clicked cell, for the previous cell, but 3 times for the next clicked cell (like case 2)
       * - (2 times) every time a change happens (see EDIT_ACTIVE_CELL action): ROW=0;COLUMN=0;VALUE=newval;TYPE=undefined
       *
       * @argument {row: number; column: number; value: string; type: CellValueType} action.payload
       *
       * @returns Following state changes (only if one of payload entries changed, or if state.activeCell is not set):
       * - state.activeCell set to payload
       * - state.editValue set to payload.value (or "" to cover the init undefined case)
       */
      const {row, column, value} = action.payload;
      const {activeCell} = state;
      if (activeCell && row === activeCell.row && column === activeCell.column) {
        return {
          ...state,
        };
      }
      if (
        !state.activeCell ||
        row !== state.activeCell.row ||
        column !== state.activeCell.column ||
        value !== state.activeCell.value
      ) {
        return {
          ...state,
          activeCell: action.payload,
          editBarValue: value || "",
        };
      }
      return state;
    }
    case EDIT_ACTIVE_CELL: {
      /**
       * This action is called every time the state of an active cell changes,
       * (when the user presses an input button inside an active cell),
       * - It's not called when a cell is activated
       * - It's not called when a cell is validated
       * - Modifying multiple caracters generate only one call
       * - Modifying a cell without activating it, doesn't generate a call
       *
       * @argument {value: CellValue, type: CellValueType} action.payload New Cell content
       *
       * @returns Following state changes (only if the value has changed):
       * - state.spreadSheetView.cell that is active is set to the new value
       * - state.editValue is also set to this new value
       */
      const {value, type} = action.payload;
      if (!state.activeCell || (state.activeCell && value === state.activeCell.value)) {
        return state;
      }
      // Hack: updating the spreadsheet cells directly. We should replace the spreadsheet
      if (
        state.spreadSheetView.cells[state.activeCell.row] == null ||
        state.spreadSheetView.cells[state.activeCell.row][state.activeCell.column] == null
      ) {
        if (state.spreadSheetView.cells[state.activeCell.row] == null) {
          state.spreadSheetView.cells[state.activeCell.row] = [];
        }
        // if the activeCell doesn't exist, init-it:
        // TODO: try to get rid of this
        state.spreadSheetView.cells[state.activeCell.row][state.activeCell.column] = {
          column: state.activeCell.column,
          columnId: "local",
          id: "local",
          row: state.activeCell.row,
          rowId: "local",
          type,
          value,
        };
      } else {
        // TODO Why not changing the type also?
        state.spreadSheetView.cells[state.activeCell.row][state.activeCell.column]!.value = value;
      }
      return {
        ...state,
        editBarValue: value,
        activeEditCell: {
          ...state.activeCell,
          type,
          value,
        },
      };
    }
    case SPREADSHEET_SUBSCRIPTION: {
      const {subscription} = action.payload;
      return {...state, subscription};
    }
    default:
      return state;
  }
}

function addColumn(columnIdx: number, {spreadSheet}: IInternalState) {
  if (spreadSheet) {
    spreadSheet.addColumn(columnIdx);
  }
}

function increasePrecision(cells: ICellInput[], {spreadSheet}: IInternalState) {
  if (spreadSheet) {
    spreadSheet.changePrecision(cells, 1);
  }
}

function decreasePrecision(cells: ICellInput[], {spreadSheet}: IInternalState) {
  if (spreadSheet) {
    spreadSheet.changePrecision(cells, -1);
  }
}

function addRow(rowIdx: number, {spreadSheet}: IInternalState) {
  if (spreadSheet) {
    spreadSheet.addRow(rowIdx);
  }
}

function editCells(cells: ICellInput[], {spreadSheet}: IInternalState) {
  if (spreadSheet) {
    spreadSheet.put(cells);
  }
}

function clearCell(row: number, column: number, {spreadSheet}: IInternalState) {
  if (spreadSheet) {
    spreadSheet.put([{row, column, value: "", type: "string"}]);
  }
}
