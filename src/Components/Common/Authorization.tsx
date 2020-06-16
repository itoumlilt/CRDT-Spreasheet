import {Typography} from "@material-ui/core";
import React from "react";
import {guest as GUEST_ROLE, IUser, Role} from "./Types/UserTypes";

export const isAuthorized = (user?: IUser, authorized?: Role[]) => {
  if (authorized === undefined || authorized.length === 0 || authorized.includes(GUEST_ROLE)) {
    return true;
  }
  if (user === undefined) {
    return false;
  }
  return authorized.includes(user.role);
};

export const NotAuthorized = () => <Typography component={"h2"}> Not authorized. Please sign in.</Typography>;
