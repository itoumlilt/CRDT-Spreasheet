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
import { Color } from "@material-ui/lab";
import { Database } from "concordant-service";
import { AppActionTypes } from "../Actions/AppActions";
import {
  AuthActionTypes,
  LOGIN,
  LOGIN_ERROR,
} from "../Actions/AuthenticationActions";
import { SpreadSheetActionTypes } from "../Actions/SpreadSheetActions";
import {
  CLEAR_MESSAGE,
  CLOSE_CONTEXT_MENU,
  COLUMN_HEADER_MENU,
  CONNECTION_ESTABLISHED,
  GO_OFFLINE,
  GO_ONLINE,
  ROW_HEADER_MENU,
  SET_MESSAGE,
  TOGGLE_ROW_HEADER,
} from "../Types/SpreadSheetTypes";

interface IInternalState {
  clientId: string;
  connection?: Database;
  contextMenu?: string;
  isOnline: boolean;
  selectedElement?: Element;
  severity?: Color;
  message?: string;
}

const initialState: IInternalState = {
  clientId: "",
  isOnline: false,
};

export function AppReducer(
  state = initialState,
  action: AppActionTypes | AuthActionTypes | SpreadSheetActionTypes
): IInternalState {
  switch (action.type) {
    case CLOSE_CONTEXT_MENU: {
      return { ...state, selectedElement: undefined, contextMenu: undefined };
    }
    case COLUMN_HEADER_MENU:
    case ROW_HEADER_MENU:
    case TOGGLE_ROW_HEADER: {
      const selectedElement =
        action.payload.element === state.selectedElement
          ? undefined
          : action.payload.element;
      return { ...state, selectedElement, contextMenu: action.type };
    }
    case CONNECTION_ESTABLISHED: {
      const { connection, clientId } = action.payload;
      return {
        ...state,
        clientId,
        connection,
        isOnline: true,
      };
    }
    case GO_OFFLINE: {
      const { success } = action.payload;
      return {
        ...state,
        isOnline: !success,
      };
    }
    case GO_ONLINE: {
      const { success } = action.payload;
      return {
        ...state,
        isOnline: success,
      };
    }
    case LOGIN: {
      return {
        ...state,
        message: "User successfully logged in",
        severity: "success",
      };
    }
    case LOGIN_ERROR: {
      return {
        ...state,
        message: "user or password incorrect",
        severity: "error",
      };
    }
    case SET_MESSAGE: {
      const { message, severity } = action.payload;
      return {
        ...state,
        message,
        severity,
      };
    }
    case CLEAR_MESSAGE: {
      return {
        ...state,
        message: undefined,
        severity: undefined,
      };
    }
    default:
      return state;
  }
}
