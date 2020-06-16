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
import {Context, MVRegister, PartialOrder, VectorClock, WallClockTimestamp} from "concordant-crdtlib";
import {SpreadSheetCRDT, SpreadSheetDocument} from "../Components/Common/Types/AppTypes";
import {
  CellValue,
  CellValueType,
  ICell,
  ICellId,
  ICellInput,
  ICellValueMeta,
  ICellView,
} from "../Components/Common/Types/SpreadSheetTypes";
import {
  countDecimals,
  getIdxFromRowOrColumn,
  idCompare,
  idStringFromCellId,
  makeIdBetween,
  makeIdToTheLeft,
  makeIdToTheRight,
  makeZeroId,
  newCell,
} from "../Components/SpreadSheet/Utils";
import SpreadSheetView from "./SpreadSheetView";

export default class SpreadSheet {
  private readonly spreadSheetView: SpreadSheetView;

  constructor(
    private spreadSheetCRDT: SpreadSheetCRDT,
    private context: Context<PartialOrder, WallClockTimestamp, VectorClock<WallClockTimestamp>>
  ) {
    this.spreadSheetView = this.makeSpreadSheetView();
    this.expand(SpreadSheetView.DEFAULT_ROWS, SpreadSheetView.DEFAULT_COLUMNS);
  }

  public put(cells: ICellInput[]): void {
    cells.forEach(({row, column, value, type}) => {
      this.expand(row, column);
      if (value !== "") {
        if (value.toString().charAt(0) === "=") {
          type = "formula";
        }
        const parsedValue = Number(value);
        if (!isNaN(parsedValue)) {
          value = parsedValue;
          type = "number";
        }
      }
      const meta = {precision: undefined};
      this.putCellByPos(row, column, value, type, meta);
    });
  }

  public contains(row?: number, column?: number): boolean {
    if (row !== undefined && column !== undefined) {
      return this.spreadSheetView.contains(row, column);
    }
    return false;
  }

  public get(row: number, column: number): {[key in string]: ICell} {
    const cellPos = this.spreadSheetView.get(row, column);
    return this.spreadSheetCRDT.value()[cellPos.rowId][cellPos.columnId];
  }

  public changePrecision(cells: ICellInput[], amount: number): void {
    cells.forEach(({row, column}) => {
      if (this.spreadSheetView.contains(row, column)) {
        const cell = this.spreadSheetView.get(row, column);
        const cellValue = Number(cell.value);
        if (cell.value.toString().charAt(0) === "=" || !isNaN(cellValue)) {
          // spreadsheet rounds every value to 8 places maximum --- this is an hack
          // because we do not have access to the computed value of formulas
          let currPrecision = !isNaN(cellValue) ? countDecimals(cellValue) : 8;
          if (cell.meta && cell.meta.precision !== undefined) {
            currPrecision = cell.meta.precision;
          }
          cell.meta = {precision: Math.max(0, currPrecision + amount)};
          this.putCell(cell);
        }
      }
    });
  }

  public addColumn(column: number): void {
    if (this.spreadSheetView.cells.length === 0) {
      return;
    }
    const columnId = idStringFromCellId(this.makeNewIdInPos(column, false));
    // for each row
    Object.keys(this.spreadSheetCRDT.value()).forEach((rowId, row) => {
      const cell = {...newCell(), row, rowId, column, columnId};
      this.putCell(cell);
      this.spreadSheetView.cells[row].splice(column, 0, cell);
    });
  }

  public addRow(row: number): void {
    const rowId = idStringFromCellId(this.makeNewIdInPos(row, true));
    // for each column
    const newRow: ICellView[] = [];
    Object.keys(this.spreadSheetView.cells[0]).forEach((columnId: string, column: number) => {
      const cell = {...newCell(), row, rowId, column, columnId};
      this.putCell(cell);
      newRow[column] = cell;
    });
    this.spreadSheetView.cells.splice(row, 0, newRow);
  }

  public makeSpreadSheetView(): SpreadSheetView {
    const map = this.spreadSheetCRDT.value();
    const cells: ICellView[][] = new Array(0);
    Object.keys(map)
      .sort((a, b) => idCompare(a, b))
      .forEach((rId, rIdx) => {
        cells[rIdx] = [];
        Object.keys(map[rId])
          .sort((a, b) => idCompare(a, b))
          .forEach((cId, cIdx) => {
            const values = Object.keys(map[rId][cId]).sort();
            cells[rIdx][cIdx] = {
              ...map[rId][cId][values[0]],
              column: cIdx,
              columnId: cId,
              row: rIdx,
              rowId: rId,
            }; // copy values
          });
      });

    return new SpreadSheetView(cells);
  }

  public save(document: SpreadSheetDocument) {
    document.update(this.spreadSheetCRDT.toJSONObj(this.context));
    return document.save();
  }

  private expand(nRows: number, nColumns: number): void {
    if (Object.keys(this.spreadSheetCRDT.value()).length === 0) {
      const rowId = idStringFromCellId(makeZeroId(true, this.context.id));
      const columnId = idStringFromCellId(makeZeroId(false, this.context.id));
      const cell = newCell();
      const {value, type} = cell;
      this.spreadSheetCRDT.put(rowId + "/" + columnId, MVRegister.create({value, type}, this.context));
      this.spreadSheetView.cells[0] = [];
      this.spreadSheetView.cells[0][0] = {...cell, row: 0, rowId, column: 0, columnId};
    }
    const map = this.spreadSheetCRDT.value();

    const sortedRows = Object.keys(map).sort((a, b) => idCompare(a, b));
    const sortedColumns = Object.keys(map[sortedRows[0]]).sort((a, b) => idCompare(a, b));

    // First expand reference column
    while (sortedColumns.length <= nColumns) {
      const lastColId = sortedColumns[sortedColumns.length - 1];
      const columnId = idStringFromCellId(makeIdToTheRight(lastColId, false, this.context.id));
      sortedColumns.push(columnId);
      // Update every row
      sortedRows.forEach((rowId, row) => {
        const column = sortedColumns.length - 1;
        if (!this.contains(row, column)) {
          const cell = newCell();
          this.spreadSheetCRDT.put(rowId + "/" + columnId, MVRegister.create(cell, this.context));
          this.spreadSheetView.cells[row][column] = {...cell, column, columnId, row, rowId};
        }
      });
    }

    while (sortedRows.length <= nRows) {
      const lastRowId = sortedRows[sortedRows.length - 1];
      const rowId = idStringFromCellId(makeIdToTheRight(lastRowId, true, this.context.id));
      sortedRows.push(rowId);
      const row = sortedRows.length - 1;
      this.spreadSheetView.cells[row] = [];
      sortedColumns.forEach((columnId, column) => {
        if (!this.contains(row, column)) {
          const cell = newCell();
          this.spreadSheetCRDT.put(rowId + "/" + columnId, MVRegister.create(cell, this.context));
          this.spreadSheetView.cells[row][column] = {...cell, column, columnId, row, rowId};
        }
      });
    }
  }

  private putCell(cell: ICellView) {
    const value = this.replaceTableReferencesWithIds(cell.value);
    const obj = MVRegister.create(
      {
        id: cell.id,
        meta: cell.meta,
        type: cell.type,
        value,
      },
      this.context
    );
    this.spreadSheetCRDT.put(cell.rowId + "/" + cell.columnId, obj);
  }

  /*private putCellById(id: string, value: CellValue, type: CellValueType) {
    const cell = this.spreadSheetView.getById(id);
    cell.value = value;
    cell.type = type;
    this.putCell(cell);
  }*/

  // When putting by position, create cell if not existing
  private putCellByPos(row: number, column: number, value: CellValue, type: CellValueType, meta?: ICellValueMeta) {
    this.expand(row, column);
    const cell = this.spreadSheetView.get(row, column);
    cell.value = value;
    cell.type = type;
    if (meta !== undefined) {
      cell.meta = meta;
    }
    this.putCell(cell);
  }

  private makeNewIdInPos(pos: number, forRow: boolean): ICellId {
    let cellPos;
    let cellBef;
    if (forRow) {
      cellPos =
        pos >= this.spreadSheetView.cells.length || !this.spreadSheetView.cells[pos][0]
          ? undefined
          : this.spreadSheetView.cells[pos][0];
      cellBef =
        pos - 1 >= this.spreadSheetView.cells.length || pos - 1 < 0 || !this.spreadSheetView.cells[pos - 1][0]
          ? undefined
          : this.spreadSheetView.cells[pos - 1][0];
    } else {
      cellPos =
        this.spreadSheetView.cells.length === 0 || pos >= this.spreadSheetView.cells[0].length
          ? undefined
          : this.spreadSheetView.cells[0][pos];
      cellBef =
        this.spreadSheetView.cells.length === 0 || pos - 1 < 0 || !this.spreadSheetView.cells[0][pos - 1]
          ? undefined
          : this.spreadSheetView.cells[0][pos - 1];
    }
    if (cellBef === undefined && cellPos === undefined) {
      return makeZeroId(forRow, this.context.id);
    } else if (cellBef === undefined && cellPos !== undefined) {
      return makeIdToTheLeft(forRow ? cellPos.rowId : cellPos.columnId, forRow, this.context.id);
    } else if (cellBef !== undefined && cellPos === undefined) {
      return makeIdToTheRight(forRow ? cellBef.rowId : cellBef.columnId, forRow, this.context.id);
    } else {
      return makeIdBetween(
        forRow ? cellBef!.rowId : cellBef!.columnId,
        forRow ? cellPos!.rowId : cellPos!.columnId,
        forRow,
        this.context.id
      );
    }
  }

  private replaceTableReferencesWithIds(value: CellValue): CellValue {
    if (typeof value === "string" && value.charAt(0) === "=") {
      const regex = /((\$*[A-Z]+)(\$*[0-9]+))/gm;
      let m = regex.exec(value);
      while (m !== null) {
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }
        const matchedRow = m[3];
        const matchedCol = m[2];
        const row = getIdxFromRowOrColumn(matchedRow);
        const column = getIdxFromRowOrColumn(matchedCol);
        if (row < 0 || column < 0) {
          return value;
        }

        this.expand(row, column); // enforce cell always not null
        const cell = this.spreadSheetView.cells[row] && this.spreadSheetView.cells[row][column];
        if (cell !== null) {
          value = value.replace(m[1], `'${cell.id}'`);
        }
        m = regex.exec(value);
      }
    }
    return value;
  }
}
