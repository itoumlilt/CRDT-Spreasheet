import {GOMapCRDT, PartialOrder, VectorClock, WallClockTimestamp} from "concordant-crdtlib";
import {DatabaseEventEmitter, Document} from "concordant-server";
import SpreadSheetModel from "../../../Model/SpreadSheet";
import SpreadSheetView from "../../../Model/SpreadSheetView";
import {ActiveCell} from "./SpreadSheetTypes";
import {IClass, IUser} from "./UserTypes";
import {Whiteboard} from "./WhiteboardTypes";

export interface IRootState {
  authentication: IAuthenticationState;
  spreadSheet: ISpreadSheetState;
  userPanel: IUserPanelState;
  app: IAppState;
  whiteboard: IWhiteboardState;
}

export interface IAuthenticationState {
  user?: IUser;
}

export interface ISpreadSheetState {
  activeCell?: ActiveCell;
  activeEditCell?: ActiveCell;
  document?: SpreadSheetDocument;
  editBarValue?: string;
  spreadSheetView: SpreadSheetView;
  spreadSheet?: SpreadSheetModel;
  subscription?: DatabaseEventEmitter;
}

export interface IWhiteboardState {
  whiteboard: Whiteboard;
  subscription?: DatabaseEventEmitter;
}

export interface IUserPanelState {
  filteredSchool?: string;
  filteredClass?: string;
  schools?: string[];
  classes?: IClass[];
  users?: IUser[];
}

export interface IAppState {
  modalName?: string;
  selectedElement?: Element;
  isOnline?: boolean;
  contextMenu?: string;
  message?: string;
  severity?: string;
}

export type SpreadSheetCRDT = GOMapCRDT<PartialOrder, WallClockTimestamp, VectorClock<WallClockTimestamp>>;
export type SpreadSheetDocument = Document<SpreadSheetCRDT>;
