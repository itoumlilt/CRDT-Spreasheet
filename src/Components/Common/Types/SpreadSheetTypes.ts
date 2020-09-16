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
import {
  Context,
  PartialOrder,
  VectorClock,
  WallClockTimestamp,
} from "concordant-crdtlib";

export interface ICellId {
  row: boolean;
  clientId: string;
  numbers: number[];
}

export type CellValue = string | number;
export type CellValueType = "string" | "number" | "boolean" | "formula";

export interface ICellValueMeta {
  precision?: number;
}

export interface ICell {
  id: string;
  value: CellValue;
  type: CellValueType;
  meta?: ICellValueMeta;
  version?: number; // To support different versions of the cell.
}

export interface ICellInput {
  row: number;
  column: number;
  value: CellValue;
  type: CellValueType;
}

export type ActiveCell = ICellInput;

export interface ICellView {
  id: string;
  value: CellValue;
  type: CellValueType;
  meta?: ICellValueMeta;
  version?: number;
  row: number;
  rowId: string;
  column: number;
  columnId: string;
}

export interface ICellViewRender {
  value: CellValue;
  editable: boolean;
  key: string;
  row: number;
  column: number;
}

export interface ISpreadSheetConfig {
  title: string;
  headerHeight: number;
  cellHeight: number;
  cellWidth: number;
  columnLabels: string[];
  columnTypes: CellValueType[];
  config: {
    editBar: boolean;
    expand: boolean;
  };
}

export type SpreadSheetContext = Context<
  PartialOrder,
  WallClockTimestamp,
  VectorClock<WallClockTimestamp>
>;

export interface ISpreadSheetView {
  cells: ICellView[][];

  containsId(id: string): boolean;

  getById(id: string): ICellView;

  size(): { nRows: number; nColumns: number };
}

export const ACTIVATE_CELL = "ACTIVATE_CELL";
export const ADD_COLUMN = "ADD_COLUMN";
export const ADD_ROW = "ADD_ROW";
export const CLEAR_CELL = "CLEAR_CELL";
export const CLEAR_MESSAGE = "CLEAR_MESSAGE";
export const CLOSE_CONTEXT_MENU = "CLOSE_CONTEXT_MENU";
export const COLUMN_HEADER_MENU = "COLUMN_HEADER_MENU";
export const CONNECTION_ESTABLISHED = "CONNECTION_ESTABLISHED";
export const DECREASE_PRECISION = "DECREASE_PRECISION";
export const EDIT_ACTIVE_CELL = "EDIT_ACTIVE_CELL";
export const EDIT_CELLS = "EDIT_CELLS";
export const GO_OFFLINE = "GO_OFFLINE";
export const GO_ONLINE = "GO_ONLINE";
export const INCREASE_PRECISION = "INCREASE_PRECISION";
export const MODAL = "MODAL";
export const ROW_HEADER_MENU = "ROW_HEADER_MENU";
export const SET_MESSAGE = "SET_MESSAGE";
export const SPREADSHEET_SUBSCRIPTION = "SPREADSHEET_SUBSCRIPTION";
export const TOGGLE_ROW_HEADER = "TOGGLE_ROW_HEADER";
export const UPDATE_SHEET = "UPDATE_SHEET";
