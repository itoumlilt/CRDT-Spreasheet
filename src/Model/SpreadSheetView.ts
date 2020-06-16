import {CellValue, ICellView, ISpreadSheetView} from "../Components/Common/Types/SpreadSheetTypes";
import {getRowAndColumnFromPos} from "../Components/SpreadSheet/Utils";

type uuid = string;
type CellIndex = {[id in uuid]: ICellView};

export default class SpreadSheetView implements ISpreadSheetView {
  public static DEFAULT_COLUMNS = 5;
  public static DEFAULT_ROWS = 40;
  private readonly cellIndex: CellIndex;

  constructor(public cells: ICellView[][] = new Array(SpreadSheetView.DEFAULT_ROWS)) {
    this.cellIndex = {};
    for (const row in this.cells) {
      if (!this.cells[row]) {
        continue;
      }
      for (const column in this.cells[0]) {
        if (this.cells[row][column]) {
          this.cellIndex[this.cells[row][column]!.id] = this.cells[row][column];
        }
      }
    }

    for (const row in this.cells) {
      if (!this.cells[row]) {
        continue;
      }
      for (const column in this.cells[0]) {
        if (!this.cells[row][column]) {
          continue;
        }
        this.cells[row][column].value = this.replaceIdsWithTableReferences(this.cells[row][column].value);
      }
    }
  }

  public size() {
    const nRows = this.cells.length;
    const nColumns = this.cells.reduce((currMax: number, rowCols: any) => (rowCols > currMax ? rowCols : currMax), 0);
    return {nRows, nColumns};
  }

  public contains(row: number, column: number) {
    return this.cells[row] !== undefined && this.cells[row][column] !== undefined;
  }

  public get(row: number, column: number): ICellView {
    return this.cells[row][column];
  }

  public containsId(id: any): boolean {
    return this.cellIndex[id] !== undefined;
  }

  public getById(id: any): ICellView {
    const {row, column} = this.cellIndex[id];
    return this.cells[row][column];
  }

  private replaceIdsWithTableReferences(value: CellValue): CellValue {
    if (typeof value === "string" && value.charAt(0) === "=") {
      const regex = /'([\w-]*)'/gm;
      let vs = value as string;
      let m = regex.exec(vs);
      while (m !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }

        const res = this.getById(m[1]);
        if (res != null) {
          const {row: r, column: c} = res;
          vs = vs.replace(m[0], getRowAndColumnFromPos(r, c));
        }

        m = regex.exec(value);
      }
      return vs;
    } else {
      return value;
    }
  }
}
