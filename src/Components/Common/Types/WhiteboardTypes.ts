import {GOMapCRDT, PartialOrder, WallClock, WallClockTimestamp} from "concordant-crdtlib";
import {ComponentElement} from "react";
import {ICellView} from "./SpreadSheetTypes";

export type ElementType = "Container" | "Table";

export interface IPosition {
  x: number;
  y: number;
}

export interface IDimensions {
  width: number;
  height: number;
}

export interface IElementState {
  id: string;
  name: string;
  dimensions: IDimensions;
  position: IPosition;
  type: ElementType;
}

export interface IElement<T extends IElementState> {
  state: T;

  component(): ComponentElement<any, any>;
}

export interface IContainer extends IElementState {
  children?: Array<IElement<any>>;
}

export interface ITable extends IElementState {
  spreadSheet: ICellView[][];
}

export interface IWhiteboard {
  addElement(element: IElement<any>): void;

  removeElement(id: string): void;

  connectElements(id1: string, id2: string): void;

  disconnectElements(id1: string, id2: string): void;

  setElementPosition(id: string, position: IPosition): void;

  resizeElement(id: string, size: IDimensions): void;
}

export type WhiteboardCRDT = GOMapCRDT<PartialOrder, WallClockTimestamp, WallClock>;
export type Whiteboard = {[id in string]: IElementState};

export const DELETE_ELEMENTS = "DELETE_ELEMENTS";
export const PUT_ELEMENTS = "PUT_ELEMENTS";
export const WHITEBOARD_SUBSCRIPTION = "WHITEBOARD_SUBSCRIPTION";
