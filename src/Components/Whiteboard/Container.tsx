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
