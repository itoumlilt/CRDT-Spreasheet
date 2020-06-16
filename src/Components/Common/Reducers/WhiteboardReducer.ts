import {WhiteboardActionTypes} from "../Actions/WhiteboardActions";
import {IWhiteboardState} from "../Types/AppTypes";
import {DELETE_ELEMENTS, IElementState, PUT_ELEMENTS, WHITEBOARD_SUBSCRIPTION} from "../Types/WhiteboardTypes";

const initialState: IWhiteboardState = {
  whiteboard: {},
  // TODO: elements subscription...
};

export function WhiteboardReducer(
  state: IWhiteboardState = initialState,
  action: WhiteboardActionTypes
): IWhiteboardState {
  switch (action.type) {
    case DELETE_ELEMENTS: {
      const {ids} = action.payload;
      const {whiteboard} = state;
      const newState = {...state, whiteboard: {...whiteboard}};
      ids.forEach((id: string) => {
        delete newState.whiteboard[id];
      });
      return newState;
    }
    case PUT_ELEMENTS: {
      const {elements} = action.payload;
      const {whiteboard} = state; // copy whiteboard to trigger change
      const newState = {...state, whiteboard: {...whiteboard}};
      elements.forEach((e: IElementState) => {
        if (e.id !== undefined) {
          newState.whiteboard[e.id] = e;
        }
      });
      return newState;
    }
    case WHITEBOARD_SUBSCRIPTION: {
      const {subscription} = action.payload;
      return {...state, subscription};
    }
    default:
      return state;
  }
}
