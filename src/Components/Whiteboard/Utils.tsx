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
import { Context } from "concordant-crdtlib";
import React, { ReactComponentElement } from "react";
import uuid from "uuid/v1";
import { IUser } from "../Common/Types/UserTypes";
import {
  ElementType,
  IContainer,
  IDimensions,
  IElementState,
  IPosition,
  ITable,
  Whiteboard,
} from "../Common/Types/WhiteboardTypes";
import { stringAsKey } from "../Common/Utils";
import { Container } from "./Container";
import { Table } from "./Table";
import { WhiteboardProps } from "./Whiteboard";

export const genElementId = (context: Context<any, any, any>) =>
  uuid() + "-" + context.id;

export const getWhiteboardKeyForUser = (user?: IUser) =>
  user !== undefined
    ? stringAsKey(user.school) +
      "_" +
      stringAsKey(user.class) +
      "_" +
      user.group +
      "_WHITEBOARD"
    : "DEFAULT_WHITEBOARD";

export const createBaseElementState = (
  id: string,
  dimensions: IDimensions,
  position: IPosition,
  name: string,
  type: ElementType
): IElementState => ({
  dimensions,
  id,
  name,
  position,
  type,
});

export const ElementComponent = (
  element: IElementState,
  elementProps: IElementProps,
  props: WhiteboardProps
): ReactComponentElement<any, any> => {
  switch (element.type) {
    case "Container":
      return Container(element as IContainer, elementProps, props);
    case "Table":
      return Table(element as ITable, elementProps, props);
  }
};

// While we do not support removes properly
export const removeEmptyEntries = (whiteboard: Whiteboard): void => {
  Object.keys(whiteboard).forEach((k) => {
    if (whiteboard[k] === undefined) {
      delete whiteboard[k];
    }
  });
};

export interface IElementProps {
  classes: any;
  onClick: (event: React.KeyboardEvent | React.MouseEvent) => void;
}
