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
  Clock,
  Context,
  GOMapCRDT,
  Order,
  StateCRDT,
  Timestamp
} from "concordant-crdtlib";
import { Document } from "concordant-server";

export const stringAsKey = (s: string) =>
  s.replace(/\s/g, "").replace(" ", "_");
export const GOMapCRDTMergeHook = <
  V,
  O extends Order,
  T extends Timestamp<T>,
  C extends Clock<O, T, C>,
  CTX extends Context<O, T, C>
>(
  obj: Document<StateCRDT<V, O, T, C>>,
  objs: Array<Document<StateCRDT<V, O, T, C>>>,
  context: Context<any, any, any>
) => {
  if (objs.length > 0) {
    const mapObj = GOMapCRDT.fromJSON(obj.current(), context);
    objs.forEach((o: any) => {
      const mapO = GOMapCRDT.fromJSON(o.current(), context);
      mapObj.merge(mapO);
    });
    return mapObj.toJSONObj(context);
  }
  throw new Error("Unexpected call");
};
