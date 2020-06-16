import {Context, GOMapCRDT, LWWRegister, TotalOrder, WallClock, WallClockTimestamp} from "concordant-crdtlib";
import {Connection, Document} from "concordant-server";
import {IElementState, Whiteboard} from "../Components/Common/Types/WhiteboardTypes";
import {removeEmptyEntries} from "../Components/Whiteboard/Utils";

type WhiteboardCRDT = GOMapCRDT<TotalOrder, WallClockTimestamp, WallClock>;

export class WhiteboardRepository {
  constructor(
    private readonly connection: Connection,
    private readonly context: Context<TotalOrder, WallClockTimestamp, WallClock>
  ) {}

  public upsertElement(id: string, element: IElementState): Promise<IElementState> {
    return this.getWhiteboardDocument(id).then(doc => {
      const map = GOMapCRDT.fromJSON(doc.current(), this.context);
      map.put(element.id, LWWRegister.create(element, this.context));
      return doc
        .update(map.toJSONObj(this.context))
        .save()
        .then(() => element);
    });
  }

  public deleteElements(id: string, ids: string[]): Promise<Whiteboard> {
    return this.getWhiteboardDocument(id).then(doc => {
      const map = GOMapCRDT.fromJSON(doc.current(), this.context);
      ids.forEach(i => {
        map.put(i, LWWRegister.create(undefined, this.context));
      });
      return doc
        .update(map.toJSONObj(this.context))
        .save()
        .then(() => map.value());
    });
  }

  public getElements(id: string): Promise<Whiteboard> {
    return this.getWhiteboardDocument(id)
      .then(doc => GOMapCRDT.fromJSON(doc.current(), this.context).value())
      .then(whiteboard => {
        removeEmptyEntries(whiteboard);
        return whiteboard;
      });
  }

  private getWhiteboardDocument(id: string): Promise<Document<WhiteboardCRDT>> {
    return this.connection.get<WhiteboardCRDT>(id, () => this.newWhiteboardJson());
  }

  private newWhiteboardJson() {
    return GOMapCRDT.create(this.context).toJSONObj(this.context);
  }
}
