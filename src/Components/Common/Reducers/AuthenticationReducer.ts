import {AuthActionTypes, LOGIN, LOGOUT} from "../Actions/AuthenticationActions";
import {IAuthenticationState} from "../Types/AppTypes";

const initialState: IAuthenticationState = {
  user: undefined,
};

export function AuthenticationReducer(state = initialState, action: AuthActionTypes): IAuthenticationState {
  switch (action.type) {
    case LOGIN: {
      const {user} = action.payload;
      return {user};
    }
    case LOGOUT: {
      return {user: undefined};
    }
    default:
      return state;
  }
}
