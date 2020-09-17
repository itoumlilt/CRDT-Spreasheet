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
  GOMapCRDT,
  PartialOrder,
  VectorClock,
  VectorClockContext,
  WallClockTimestamp
} from "concordant-crdtlib";
import { ICell, ICellInput } from "../Components/Common/Types/SpreadSheetTypes";
import SpreadSheet from "./SpreadSheet";
import SpreadSheetView from "./SpreadSheetView";

describe("SpreadSheet Tests", () => {
  let spreadSheet: SpreadSheet;
  beforeEach(() => {
    const clientId = "id";
    const clock = VectorClock.createFrom(new WallClockTimestamp({ clientId }));
    const ctx = new VectorClockContext(clientId, clock);
    const map: GOMapCRDT<
      ICell,
      PartialOrder,
      WallClockTimestamp,
      VectorClock<WallClockTimestamp>
    > = GOMapCRDT.create(ctx);
    spreadSheet = new SpreadSheet(map, ctx);
  });

  it("empty spreadsheet", () => {
    const cells: ICellInput[] = [
      { row: 0, column: 0, value: "v", type: "string" }
    ];
    spreadSheet.put(cells);
    const view = spreadSheet.makeSpreadSheetView();
    const newCell = view.get(0, 0);
    expect(newCell.rowId).toBe("R_0_id");
    expect(newCell.columnId).toBe("C_0_id");
  });

  it("expand table", () => {
    const nRows = 10;
    const nCols = 10;
    const cells: ICellInput[] = [
      { row: nRows, column: nCols, value: "v", type: "string" }
    ];
    spreadSheet.put(cells);
    const view = spreadSheet.makeSpreadSheetView();
    for (let i = 0; i <= nRows; i++) {
      for (let j = 0; j <= nCols; j++) {
        const newCell = view.get(i, j);
        expect(newCell.rowId).toBe("R_" + i + "_id");
        expect(newCell.columnId).toBe("C_" + j + "_id");
      }
    }
  });

  it("add column before", () => {
    const nRows = 1;
    const nCols = 10;
    const cells: ICellInput[] = [
      { row: nRows, column: nCols, value: "v", type: "string" }
    ];
    spreadSheet.put(cells);
    spreadSheet.addColumn(0);
    const view = spreadSheet.makeSpreadSheetView();
    expect(view.cells[0][0].columnId).toBe("C_-1_id");
  });

  it("add row after", () => {
    const nRows = 1;
    const nCols = 10;
    const cells: ICellInput[] = [
      { row: nRows, column: nCols, value: "v", type: "string" }
    ];
    spreadSheet.put(cells);
    spreadSheet.addRow(SpreadSheetView.DEFAULT_ROWS + 1);
    const view = spreadSheet.makeSpreadSheetView();
    expect(view.cells[SpreadSheetView.DEFAULT_ROWS + 1][0].rowId).toBe(
      "R_" + (SpreadSheetView.DEFAULT_ROWS + 1) + "_id"
    );
  });
});
