import {Context, GOMapCRDT, PartialOrder, VectorClock, WallClockTimestamp} from "concordant-crdtlib";
import {Connection, Document} from "concordant-server";
import {SpreadSheetCRDT} from "../Components/Common/Types/AppTypes";
import SpreadSheet from "../Model/SpreadSheet";

export class SpreadSheetRepository {
  constructor(
    private readonly connection: Connection,
    private readonly context: Context<PartialOrder, WallClockTimestamp, VectorClock<WallClockTimestamp>>
  ) {}

  public getSpreadSheet(id: string): Promise<SpreadSheet> {
    return this.getSpreadSheetDocument(id).then(
      doc => new SpreadSheet(GOMapCRDT.fromJSON(doc.current(), this.context), this.context)
    );
  }

  public getSpreadSheetDocument(id: string): Promise<Document<SpreadSheetCRDT>> {
    return this.connection.get<SpreadSheetCRDT>(id, () => this.newSpreadSheetJson());
  }

  private newSpreadSheetJson() {
    return GOMapCRDT.create(this.context).toJSONObj(this.context);
  }
}
