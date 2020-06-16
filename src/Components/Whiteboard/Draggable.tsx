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
import {Box} from "@material-ui/core";
import React from "react";
import Draggable, {DraggableEventHandler} from "react-draggable";
import {IElement, IElementState} from "../Common/Types/WhiteboardTypes";
import {IElementProps} from "./Utils";
import {WhiteboardProps} from "./Whiteboard";

export const DraggableOf = <E extends IElementState>(
  {component, state}: IElement<E>,
  elementProps: IElementProps,
  props: WhiteboardProps
) => {
  const {dispatchUpdateElementAction} = props;
  const {
    dimensions: {width, height},
    position,
  } = state;
  const handleStopDrag: DraggableEventHandler = (event, data) => {
    const {x, y} = data;
    const newElement = {...state, position: {x, y}};
    dispatchUpdateElementAction(newElement, props);
  };

  return (
    <Draggable key={state.id} onStop={handleStopDrag} position={position}>
      <Box className={elementProps.classes.draggableContainer} style={{width, height}} onClick={elementProps.onClick}>
        {component()}
      </Box>
    </Draggable>
  );
};
