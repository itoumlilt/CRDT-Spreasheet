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
  PartialOrder,
  VectorClock,
  WallClockTimestamp,
} from "concordant-crdtlib";
import { Connection, Document } from "concordant-server";
import { SpreadSheetCRDT } from "../Components/Common/Types/AppTypes";
import SpreadSheet from "../Model/SpreadSheet";

export class SpreadSheetRepository {
  constructor(
    private readonly connection: Connection,
    private readonly context: Context<
      PartialOrder,
      WallClockTimestamp,
      VectorClock<WallClockTimestamp>
    >
  ) {}

  public getSpreadSheet(id: string): Promise<SpreadSheet> {
    return this.getSpreadSheetDocument(id).then(
      (doc) =>
        new SpreadSheet(
          GOMapCRDT.fromJSON(doc.current(), this.context),
          this.context
        )
    );
  }

  public getSpreadSheetDocument(
    id: string
  ): Promise<Document<SpreadSheetCRDT>> {
    return this.connection.get<SpreadSheetCRDT>(id, () =>
      this.newSpreadSheetJson()
    );
  }

  private newSpreadSheetJson() {
    return GOMapCRDT.create(this.context).toJSONObj(this.context);
  }
}
