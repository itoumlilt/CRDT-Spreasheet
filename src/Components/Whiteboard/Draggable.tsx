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
