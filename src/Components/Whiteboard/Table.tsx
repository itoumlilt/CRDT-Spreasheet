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
import {Table as TableUI, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@material-ui/core";
import React from "react";
import {defaultConfig} from "../../App"; // TODO: using configured column names. Make it part of state.
import {ICellView} from "../Common/Types/SpreadSheetTypes";
import {IElement, ITable} from "../Common/Types/WhiteboardTypes";
import {DraggableOf} from "./Draggable";
import {createBaseElementState, IElementProps} from "./Utils";
import {WhiteboardProps} from "./Whiteboard";

export const Table = (table: ITable, elementProps: IElementProps, props: WhiteboardProps) => {
  return DraggableOf<ITable>(createTableElement(table), elementProps, props);
};

export const TableElement = (table: ITable) => {
  const {
    dimensions: {height, width},
    spreadSheet,
  } = table;

  return (
    <TableContainer style={{maxHeight: height, maxWidth: width}}>
      <TableUI stickyHeader aria-label="sticky table">
        <TableHead>
          <TableRow>
            {defaultConfig.columnLabels.map((column: any) => (
              <TableCell key={column}>{column}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {spreadSheet.map((r, i) => (
            <TableRow hover role="checkbox" tabIndex={-1} key={r.length > 0 ? r[0].rowId : "r-" + i}>
              {r.map(c => {
                const value = c.value;
                return (
                  <TableCell key={c.columnId} align={"right"}>
                    {
                      // TODO: customize presentation depending on value type
                      value
                    }
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </TableUI>
    </TableContainer>
  );
};

export const createTableState = (
  id: string,
  name: string,
  spreadSheet: ICellView[][],
  dimensions = {width: 500, height: 300},
  position = {x: 0, y: 0}
): ITable => {
  const filtered = spreadSheet.filter(r => r.some(c => c.value !== "" && c.value !== undefined));
  return {spreadSheet: filtered, ...createBaseElementState(id, dimensions, position, name, "Table")};
};

const createTableElement = (table: ITable): IElement<ITable> => ({component: () => TableElement(table), state: table});
