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
