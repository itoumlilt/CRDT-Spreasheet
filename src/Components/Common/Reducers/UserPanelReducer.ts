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
  CLEAR_USER_PANEL_FILTERS,
  GET_CLASSES,
  GET_SCHOOLS,
  GET_USERS,
  SET_CLASS,
  SET_SCHOOL,
  UserActionTypes,
} from "../Actions/UserPanelActions";
import {IUserPanelState} from "../Types/AppTypes";

const initialState: IUserPanelState = {};

export function UserPanelReducer(state = initialState, action: UserActionTypes): IUserPanelState {
  switch (action.type) {
    case GET_SCHOOLS:
    case GET_CLASSES:
    case GET_USERS: {
      return {
        ...state,
        ...action.payload,
      };
    }
    case SET_SCHOOL: {
      return {
        ...state,
        classes: undefined,
        filteredClass: undefined,
        users: undefined,
        ...action.payload,
      };
    }
    case SET_CLASS: {
      return {
        ...state,
        users: undefined,
        ...action.payload,
      };
    }
    case CLEAR_USER_PANEL_FILTERS: {
      return {...state, filteredClass: undefined, filteredSchool: undefined};
    }
    default:
      return state;
  }
}
