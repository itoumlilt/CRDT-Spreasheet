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
  GOMapCRDT,
  LWWRegister,
  TotalOrder,
  WallClock,
  WallClockTimestamp,
} from "concordant-crdtlib";
import { Connection, Document } from "concordant-server";
import {
  IElementState,
  Whiteboard,
} from "../Components/Common/Types/WhiteboardTypes";
import { removeEmptyEntries } from "../Components/Whiteboard/Utils";

type WhiteboardCRDT = GOMapCRDT<TotalOrder, WallClockTimestamp, WallClock>;

export class WhiteboardRepository {
  constructor(
    private readonly connection: Connection,
    private readonly context: Context<TotalOrder, WallClockTimestamp, WallClock>
  ) {}

  public upsertElement(
    id: string,
    element: IElementState
  ): Promise<IElementState> {
    return this.getWhiteboardDocument(id).then((doc) => {
      const map = GOMapCRDT.fromJSON(doc.current(), this.context);
      map.put(element.id, LWWRegister.create(element, this.context));
      return doc
        .update(map.toJSONObj(this.context))
        .save()
        .then(() => element);
    });
  }

  public deleteElements(id: string, ids: string[]): Promise<Whiteboard> {
    return this.getWhiteboardDocument(id).then((doc) => {
      const map = GOMapCRDT.fromJSON(doc.current(), this.context);
      ids.forEach((i) => {
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
      .then((doc) => GOMapCRDT.fromJSON(doc.current(), this.context).value())
      .then((whiteboard) => {
        removeEmptyEntries(whiteboard);
        return whiteboard;
      });
  }

  private getWhiteboardDocument(id: string): Promise<Document<WhiteboardCRDT>> {
    return this.connection.get<WhiteboardCRDT>(id, () =>
      this.newWhiteboardJson()
    );
  }

  private newWhiteboardJson() {
    return GOMapCRDT.create(this.context).toJSONObj(this.context);
  }
}
