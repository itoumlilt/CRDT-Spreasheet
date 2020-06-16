import {IClass, IUser} from "../Types/UserTypes";

export const GET_SCHOOLS = "set_schools";
export const GET_CLASSES = "get_classes";
export const GET_USERS = "get_users";
export const SET_SCHOOL = "set_school";
export const SET_CLASS = "set_class";
export const CLEAR_USER_PANEL_FILTERS = "clear_user_panel_filters";

export const getSchoolsAction = (schools: string[]): ISetSchoolsAction => ({
  payload: {schools},
  type: GET_SCHOOLS,
});

export const getClassesAction = (classes: IClass[]): IGetClassesAction => ({
  payload: {classes},
  type: GET_CLASSES,
});

export const getUsersAction = (users: IUser[]): IGetUsersAction => ({
  payload: {users},
  type: GET_USERS,
});

export const setSchoolAction = (filteredSchool: string): ISetSchoolAction => ({
  payload: {filteredSchool},
  type: SET_SCHOOL,
});

export const setClassAction = (filteredClass: string): ISetClassAction => ({
  payload: {filteredClass},
  type: SET_CLASS,
});

export const clearUserPanelFiltersAction = (): IClearUserPanelFiltersAction => ({
  payload: {},
  type: CLEAR_USER_PANEL_FILTERS,
});

export interface ISetSchoolsAction {
  payload: {schools: string[]};
  type: typeof GET_SCHOOLS;
}

export interface IGetClassesAction {
  payload: {classes: IClass[]};
  type: typeof GET_CLASSES;
}

export interface IGetUsersAction {
  payload: {users: IUser[]};
  type: typeof GET_USERS;
}

export interface ISetSchoolAction {
  payload: {filteredSchool: string};
  type: typeof SET_SCHOOL;
}

export interface ISetClassAction {
  payload: {filteredClass: string};
  type: typeof SET_CLASS;
}

export interface IClearUserPanelFiltersAction {
  payload: {};
  type: typeof CLEAR_USER_PANEL_FILTERS;
}

export type UserActionTypes =
  | ISetSchoolsAction
  | IGetClassesAction
  | IGetUsersAction
  | ISetSchoolAction
  | ISetClassAction
  | IClearUserPanelFiltersAction;
