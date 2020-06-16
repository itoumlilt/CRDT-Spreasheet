import {Context} from "concordant-crdtlib";
import React, {ReactComponentElement} from "react";
import uuid from "uuid/v1";
import {IUser} from "../Common/Types/UserTypes";
import {
  ElementType,
  IContainer,
  IDimensions,
  IElementState,
  IPosition,
  ITable,
  Whiteboard,
} from "../Common/Types/WhiteboardTypes";
import {stringAsKey} from "../Common/Utils";
import {Container} from "./Container";
import {Table} from "./Table";
import {WhiteboardProps} from "./Whiteboard";

export const genElementId = (context: Context<any, any, any>) => uuid() + "-" + context.id;

export const getWhiteboardKeyForUser = (user?: IUser) =>
  user !== undefined
    ? stringAsKey(user.school) + "_" + stringAsKey(user.class) + "_" + user.group + "_WHITEBOARD"
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
  Object.keys(whiteboard).forEach(k => {
    if (whiteboard[k] === undefined) {
      delete whiteboard[k];
    }
  });
};

export interface IElementProps {
  classes: any;
  onClick: (event: React.KeyboardEvent | React.MouseEvent) => void;
}
