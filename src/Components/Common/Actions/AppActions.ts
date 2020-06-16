import {GO_OFFLINE, GO_ONLINE} from "../Types/SpreadSheetTypes";

export const goOnlineAction = (): IGoOnlineAction => ({
  payload: {success: true},
  type: GO_ONLINE,
});

export const goOfflineAction = (): IGoOfflineAction => ({
  payload: {success: true},
  type: GO_OFFLINE,
});

interface IGoOnlineAction {
  payload: {success: boolean};
  type: typeof GO_ONLINE;
}

interface IGoOfflineAction {
  payload: {success: boolean};
  type: typeof GO_OFFLINE;
}

export type AppActionTypes = IGoOnlineAction | IGoOfflineAction;
