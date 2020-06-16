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
