import {IUser} from "../Types/UserTypes";

export const LOGIN = "login";
export const LOGIN_ERROR = "login_error";
export const LOGOUT = "logout";

export const loginAction = (user: IUser): ILoginAction => ({
  payload: {user},
  type: LOGIN,
});

export const loginErrorAction = (): ILoginErrorAction => ({
  payload: {},
  type: LOGIN_ERROR,
});

export const logoutAction = (): ILogoutAction => ({
  payload: {},
  type: LOGOUT,
});

export interface ILoginAction {
  payload: {user: IUser};
  type: typeof LOGIN;
}

export interface ILoginErrorAction {
  payload: {};
  type: typeof LOGIN_ERROR;
}

export interface ILogoutAction {
  payload: {};
  type: typeof LOGOUT;
}

export type AuthActionTypes = ILoginAction | ILoginErrorAction | ILogoutAction;
