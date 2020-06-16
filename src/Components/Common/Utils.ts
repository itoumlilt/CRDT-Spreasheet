import {Clock, Context, GOMapCRDT, Order, StateCRDT, Timestamp} from "concordant-crdtlib";
import {Document} from "concordant-server";

export const stringAsKey = (s: string) => s.replace(/\s/g, "").replace(" ", "_");
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
