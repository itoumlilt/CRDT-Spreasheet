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
