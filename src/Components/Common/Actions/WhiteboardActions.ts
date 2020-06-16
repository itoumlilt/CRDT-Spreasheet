import {DatabaseEventEmitter} from "concordant-server/dist/Database/Interfaces/Types";
import {WHITEBOARD_SUBSCRIPTION} from "../Types/WhiteboardTypes";
import {DELETE_ELEMENTS, IElementState, PUT_ELEMENTS} from "../Types/WhiteboardTypes";

export const deleteElementsAction = (ids: string[]): IDeleteElementsAction => ({
  payload: {ids},
  type: DELETE_ELEMENTS,
});

export const putElementsAction = (elements: IElementState[]): IPutElementsAction => ({
  payload: {elements},
  type: PUT_ELEMENTS,
});

export const WhiteboardSubscriptionAction = (subscription: DatabaseEventEmitter): IWhiteboardSubscriptionAction => ({
  payload: {subscription},
  type: WHITEBOARD_SUBSCRIPTION,
});

interface IDeleteElementsAction {
  payload: {ids: string[]};
  type: typeof DELETE_ELEMENTS;
}

interface IPutElementsAction {
  payload: {elements: IElementState[]};
  type: typeof PUT_ELEMENTS;
}

interface IWhiteboardSubscriptionAction {
  payload: {subscription: DatabaseEventEmitter};
  type: typeof WHITEBOARD_SUBSCRIPTION;
}

export type WhiteboardActionTypes = IDeleteElementsAction | IPutElementsAction | IWhiteboardSubscriptionAction;
