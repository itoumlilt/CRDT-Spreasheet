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
import {DatabaseEventEmitter} from "concordant-server/dist/Database/Interfaces/Types";
import {WHITEBOARD_SUBSCRIPTION} from "../Types/WhiteboardTypes";
import {DELETE_ELEMENTS, IElementState, PUT_ELEMENTS} from "../Types/WhiteboardTypes";

export const deleteElementsAction = (ids: string[]): IDeleteElementsAction => ({
  payload: {ids},
  type: DELETE_ELEMENTS,
});

export const putElementsAction = (elements: IElementState[]): IPutElementsAction => ({
  payload: {elements},
  type: PUT_ELEMENTS,
});

export const WhiteboardSubscriptionAction = (subscription: DatabaseEventEmitter): IWhiteboardSubscriptionAction => ({
  payload: {subscription},
  type: WHITEBOARD_SUBSCRIPTION,
});

interface IDeleteElementsAction {
  payload: {ids: string[]};
  type: typeof DELETE_ELEMENTS;
}

interface IPutElementsAction {
  payload: {elements: IElementState[]};
  type: typeof PUT_ELEMENTS;
}

interface IWhiteboardSubscriptionAction {
  payload: {subscription: DatabaseEventEmitter};
  type: typeof WHITEBOARD_SUBSCRIPTION;
}

export type WhiteboardActionTypes = IDeleteElementsAction | IPutElementsAction | IWhiteboardSubscriptionAction;
