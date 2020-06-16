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
import uuid from "uuid/v4";
import {
  CellValue,
  CellValueType,
  ICell,
  ICellId,
  ICellViewRender,
  ISpreadSheetView,
} from "../Common/Types/SpreadSheetTypes";
import {IUser} from "../Common/Types/UserTypes";
import {stringAsKey} from "../Common/Utils";

export const getSpreadSheetId = (user?: IUser): string =>
  user !== undefined
    ? stringAsKey(user.school) + "_" + stringAsKey(user.class) + "_" + user.group + "_SPREADSHEET"
    : "DEFAULT_SPREADSHEET";

const baseCharCode = "A".charCodeAt(0);
const maxCharCode = "Z".charCodeAt(0);
const radix = maxCharCode - baseCharCode + 1;

export const getIdxFromRowOrColumn = (rowOrColumn: string): number => {
  const row = parseInt(rowOrColumn, 10) - 1;
  if (!isNaN(row)) {
    return row;
  } else {
    let res = 0;
    rowOrColumn
      .split("")
      .reverse()
      .forEach((char: string, idx: number) => {
        const digitInt = idx === 0 ? char.charCodeAt(0) - baseCharCode : char.charCodeAt(0) - baseCharCode + 1;
        res += digitInt * Math.pow(radix, idx);
      });
    return res;
  }
};

export const getRowAndColumnFromPos = (row: number, column: number): string => {
  let div = Math.floor(column / radix);
  let mod = column % radix;
  let res = "";
  while (div >= 0) {
    res = String.fromCharCode(baseCharCode + mod) + res;
    if (div > 0) {
      div = Math.floor(div / radix);
      mod = div % radix;
    } else {
      break;
    }
  }
  return res + (row + 1);
};

const separator = "_";

// TODO: make id to the right
//  Make id between (R_0 -> R_0_0) For add column

export const makeZeroId = (row: boolean, clientId: string): ICellId => {
  return {numbers: [0], row, clientId};
};

export const makeIdBetween = (id1s: string, id2s: string, row: boolean, clientId: string): ICellId => {
  const id1 = cellIdFromIdString(id1s);
  const id2 = cellIdFromIdString(id2s);

  const {numbers: n1} = id1;
  const {numbers: n2} = id2;
  if (n1.length <= n2.length) {
    n2.push(0);
    return {numbers: n2, row, clientId};
  } else {
    n1[n1.length - 1]++;
    return {numbers: n1, row, clientId};
  }
};

export const makeIdToTheRight = (ids: string, row: boolean, clientId: string): ICellId => {
  const id = cellIdFromIdString(ids);
  const numbers = [id.numbers[0] + 1];
  return {numbers, row, clientId};
};

export const makeIdToTheLeft = (ids: string, row: boolean, clientId: string): ICellId => {
  const id = cellIdFromIdString(ids);
  const numbers = [id.numbers[0] - 1];
  return {numbers, row, clientId};
};

export const idCompare = (id1: string, id2: string): number => {
  return cellIdCompare(cellIdFromIdString(id1), cellIdFromIdString(id2));
};

export const cellIdCompare = (id1: ICellId, id2: ICellId): number => {
  const {numbers: n1} = id1;
  const {numbers: n2} = id2;

  for (let i = 0; i < n1.length && i < n2.length; i++) {
    if (n1[i] !== n2[i]) {
      return n1[i] - n2[i];
    }
  }
  if (n1.length > n2.length) {
    return -1;
  } else if (n1.length < n2.length) {
    return 1;
  } else {
    return id1.clientId.localeCompare(id2.clientId);
  }
};

// Removed ClientId from id for specific case of BASF

export const cellIdFromIdString = (id: string): ICellId => {
  const tokens = id.split(separator);
  return {
    clientId: "", // tokens[tokens.length - 1],
    numbers: tokens.slice(1, tokens.length /*tokens.length - 1*/).map((n: any) => parseInt(n, 10)),
    row: tokens[0] === "R",
  };
};

export const idStringFromCellId = (cellId: ICellId): string => {
  return (cellId.row ? "R" : "C") + separator + cellId.numbers.join(separator) /* + separator + cellId.clientId*/;
};

export const newCell = (value: CellValue = "", type: CellValueType = "string"): ICell => {
  return {
    id: uuid(),
    type,
    value,
  };
};

export const countDecimals = (value: number) => {
  if (Math.floor(value) === value) {
    return 0;
  }
  return value.toString().split(".")[1].length || 0;
};

export const makeCellRenderObj = (
  props: {row: number; column: number; editable: boolean; meta: any},
  spreadSheet: ISpreadSheetView
): ICellViewRender | null => {
  const {row, column} = props;
  const cell = spreadSheet.cells[row][column];
  if (cell) {
    return {key: cell.id, ...props, value: processValue(cell.value, spreadSheet)};
  }
  return null;
};

const processValue = (value: CellValue, spreadSheet: ISpreadSheetView): CellValue => {
  const regex = /=('(.*)')*/gm;
  if (typeof value !== "string" || value.charAt(0) !== "=") {
    return value;
  }
  let m = regex.exec(value);
  while (m !== null) {
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    const id = m[2];
    if (id === undefined) {
      break;
    }
    const cell = spreadSheet.getById(id);
    if (cell !== null) {
      const {row, column} = cell;
      const posString = getRowAndColumnFromPos(row, column);
      value = value.replace(m[1], posString);
    }
    m = regex.exec(value);
  }
  return value;
};
