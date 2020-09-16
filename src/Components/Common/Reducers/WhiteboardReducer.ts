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
import { WhiteboardActionTypes } from "../Actions/WhiteboardActions";
import { IWhiteboardState } from "../Types/AppTypes";
import {
  DELETE_ELEMENTS,
  IElementState,
  PUT_ELEMENTS,
  WHITEBOARD_SUBSCRIPTION,
} from "../Types/WhiteboardTypes";

const initialState: IWhiteboardState = {
  whiteboard: {},
  // TODO: elements subscription...
};

export function WhiteboardReducer(
  state: IWhiteboardState = initialState,
  action: WhiteboardActionTypes
): IWhiteboardState {
  switch (action.type) {
    case DELETE_ELEMENTS: {
      const { ids } = action.payload;
      const { whiteboard } = state;
      const newState = { ...state, whiteboard: { ...whiteboard } };
      ids.forEach((id: string) => {
        delete newState.whiteboard[id];
      });
      return newState;
    }
    case PUT_ELEMENTS: {
      const { elements } = action.payload;
      const { whiteboard } = state; // copy whiteboard to trigger change
      const newState = { ...state, whiteboard: { ...whiteboard } };
      elements.forEach((e: IElementState) => {
        if (e.id !== undefined) {
          newState.whiteboard[e.id] = e;
        }
      });
      return newState;
    }
    case WHITEBOARD_SUBSCRIPTION: {
      const { subscription } = action.payload;
      return { ...state, subscription };
    }
    default:
      return state;
  }
}
