import React from "react";
import {IContainer, IElement} from "../Common/Types/WhiteboardTypes";
import {DraggableOf} from "./Draggable";
import {createBaseElementState, IElementProps} from "./Utils";
import {WhiteboardProps} from "./Whiteboard";

export const Container = (container: IContainer, elementProps: IElementProps, props: WhiteboardProps) => {
  return DraggableOf<IContainer>(createContainerElement(container), elementProps, props);
};

const Children = () => {
  // TODO: Support rendering of Children of different types
  // {element.children !== undefined && element.children.map(c => Component(c, props))}
  return <div />;
};

export const createContainerState = (
  id: string,
  name: string,
  dimensions = {width: 100, height: 100},
  position = {x: 0, y: 0}
): IContainer => ({...createBaseElementState(id, dimensions, position, name, "Container")});

const createContainerElement = (container: IContainer): IElement<IContainer> => ({
  component: Children,
  state: container,
});
