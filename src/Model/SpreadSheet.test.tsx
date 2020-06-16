import {GOMapCRDT, PartialOrder, VectorClock, VectorClockContext, WallClockTimestamp} from "concordant-crdtlib";
import {ICell, ICellInput} from "../Components/Common/Types/SpreadSheetTypes";
import SpreadSheet from "./SpreadSheet";

describe("SpreadSheet Tests", () => {
  let spreadSheet: SpreadSheet;
  beforeEach(() => {
    const clientId = "id";
    const clock = VectorClock.createFrom(new WallClockTimestamp({clientId}));
    const ctx = new VectorClockContext(clientId, clock);
    const map: GOMapCRDT<ICell, PartialOrder, WallClockTimestamp, VectorClock<WallClockTimestamp>> = GOMapCRDT.create(
      ctx
    );
    spreadSheet = new SpreadSheet(map, ctx);
  });

  it("empty spreadsheet", () => {
    const cells: ICellInput[] = [{row: 0, column: 0, value: "v", type: "string"}];
    spreadSheet.put(cells);
    const view = spreadSheet.makeSpreadSheetView();
    const newCell = view.get(0, 0);
    expect(newCell.rowId).toBe("R_0_id");
    expect(newCell.columnId).toBe("C_0_id");
  });

  it("expand table", () => {
    const nRows = 10;
    const nCols = 10;
    const cells: ICellInput[] = [{row: nRows, column: nCols, value: "v", type: "string"}];
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
    const cells: ICellInput[] = [{row: nRows, column: nCols, value: "v", type: "string"}];
    spreadSheet.put(cells);
    spreadSheet.addColumn(-1);
    const view = spreadSheet.makeSpreadSheetView();
    expect(view.cells[0][0].columnId).toBe("C_-1_id");
  });

  it("add row after", () => {
    const nRows = 1;
    const nCols = 10;
    const cells: ICellInput[] = [{row: nRows, column: nCols, value: "v", type: "string"}];
    spreadSheet.put(cells);
    spreadSheet.addRow(2);
    const view = spreadSheet.makeSpreadSheetView();
    expect(view.cells[2][0].rowId).toBe("R_2_id");
  });
});
