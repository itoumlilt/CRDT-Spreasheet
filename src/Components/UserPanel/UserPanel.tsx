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
import {
  Box,
  Container,
  FormControl,
  FormLabel,
  MenuItem,
} from "@material-ui/core";
import Select from "@material-ui/core/Select";
import { WallClockTimeContext } from "concordant-crdtlib";
import { Connection } from "concordant-service";
import MaterialTable, { Column } from "material-table";
import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Action, bindActionCreators } from "redux";
import { ThunkDispatch } from "redux-thunk";
import {
  addUser,
  createClass,
  createSchool,
  deleteClass,
  deleteSchool,
  deleteUser,
  getClasses,
  getSchools,
  getUsersFor,
} from "../../Repository/UserRepository";
import {
  clearUserPanelFiltersAction,
  getClassesAction,
  getSchoolsAction,
  getUsersAction,
  setClassAction,
  setSchoolAction,
} from "../Common/Actions/UserPanelActions";
import { isAuthorized, NotAuthorized } from "../Common/Authorization";
import { styles } from "../Common/Styles/Styles";
import { IRootState } from "../Common/Types/AppTypes";
import {
  admin as ADMIN_ROLE,
  IClass,
  IUser,
  user as USER_ROLE,
} from "../Common/Types/UserTypes";

interface IUserPanelProps
  extends ISchoolTableProps,
    IClassTableProps,
    IUserTableProps {
  user?: IUser;
}

interface IUserPanelOwnProps {
  connection: Connection;
  context: WallClockTimeContext;
}

interface IUserPanelDispatchProps {
  dispatchGetSchoolsAction: typeof getSchoolsActionPromise;
  dispatchGetClassesAction: typeof getClassesActionPromise;
  dispatchGetUsersAction: typeof getUsersActionPromise;
  dispatchSetSchoolAction: typeof setSchoolAction;
  dispatchSetClassAction: typeof setClassAction;
  dispatchClearUserPanelFiltersAction: typeof clearUserPanelFiltersAction;
}

interface IUserTableProps {
  users?: IUser[];
}

interface ISchoolTableProps {
  schools?: string[];
}

interface IClassTableProps {
  filteredSchool?: string; // filter attribute
  filteredClass?: string; // filter attribute
  schools?: string[];
  classes?: IClass[];
}

const schoolColumns = [{ title: "School Name", field: "schoolName" }];

const classColumns = [{ title: "Name", field: "className" }];

const userColumns: Column<IUser>[] = [
  { title: "Number", field: "number", type: "numeric" },
  { title: "First name", field: "firstName" },
  { title: "Last name", field: "lastName" },
  { title: "Email", field: "email" },
  {
    editable: "never",
    field: "role",
    lookup: {
      admin: ADMIN_ROLE,
      user: USER_ROLE,
    },
    title: "Role",
  },
  { title: "Password", field: "password" },
  { title: "Group", field: "group", type: "numeric" },
];

const requiredFieldsUser = [
  "number",
  "firstName",
  "lastName",
  "email",
  "password",
  "group",
];
const requiredFieldsClass = ["className"];
const requiredFieldsSchool = ["schoolName"];

interface ISchool {
  schoolName: string;
}

const AttrFilter = (props: {
  filterValue?: string;
  values?: string[];
  stateChangeHandler?: (filterValue: string) => void;
  label?: string;
}) => {
  const { filterValue, values, stateChangeHandler, label } = props;

  const handleFilterChange = (event: React.ChangeEvent<{ value: unknown }>) =>
    stateChangeHandler !== undefined &&
    stateChangeHandler((event.target.value as string) || "");

  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Select
        value={filterValue || ""}
        onChange={handleFilterChange}
        displayEmpty
      >
        {values !== undefined
          ? values.map((s: string, i: number) => (
              <MenuItem value={s} key={"school_" + i}>
                {s}
              </MenuItem>
            ))
          : []}
      </Select>
    </FormControl>
  );
};

const SchoolTable = ({
  schools,
  connection,
  context,
  user,
  dispatchClearUserPanelFiltersAction,
  dispatchGetSchoolsAction,
}: UserPanelProps) => {
  if (user === undefined) {
    return <Box />;
  }

  const editable: {
    isEditable?: (rowData: ISchool) => boolean;
    onRowAdd?: (newData: ISchool) => Promise<void>;
    // onRowUpdate?: (newData: ISchool, oldData?: ISchool) => Promise<void>;
    onRowDelete?: (oldData: ISchool) => Promise<void>;
  } = {
    onRowAdd: (newData: ISchool) =>
      new Promise((resolve, reject) => {
        const newDataFields = Object.keys(newData);
        if (
          requiredFieldsSchool.some(
            (field: string) => !newDataFields.includes(field)
          )
        ) {
          return reject("Some fields are missing");
        } else {
          return createSchool(newData.schoolName, connection, context)
            .then(() => dispatchClearUserPanelFiltersAction())
            .then(() => dispatchGetSchoolsAction(connection, context))
            .then(() => resolve());
        }
      }),
    onRowDelete: (oldData) =>
      new Promise((resolve) => {
        return deleteSchool(oldData.schoolName, connection, context)
          .then(() => dispatchClearUserPanelFiltersAction())
          .then(() => dispatchGetSchoolsAction(connection, context))
          .then(() => resolve());
      }),
  };

  return (
    <MaterialTable
      title="Schools"
      columns={schoolColumns}
      data={schools ? schools.map((s: string) => ({ schoolName: s })) : []}
      editable={user.role === ADMIN_ROLE ? editable : {}}
    />
  );
};

const ClassTable = (props: UserPanelProps) => {
  const {
    filteredSchool,
    schools,
    classes,
    connection,
    context,
    user,
    dispatchGetClassesAction,
    dispatchSetSchoolAction,
  } = props;
  if (schools === undefined || schools.length === 0) {
    return <React.Fragment />;
  }

  const filter = (
    <AttrFilter
      filterValue={filteredSchool}
      values={schools}
      stateChangeHandler={dispatchSetSchoolAction}
      label={"School Filter"}
    />
  );

  if (
    filteredSchool === undefined ||
    classes === undefined ||
    user === undefined
  ) {
    return filter;
  }

  const editable: {
    isEditable?: (rowData: IClass) => boolean;
    isDeletable?: (rowData: IClass) => boolean;
    onRowAdd?: (newData: IClass) => Promise<void>;
    // onRowUpdate?: (newData: ISchool, oldData?: ISchool) => Promise<void>;
    onRowDelete?: (oldData: IClass) => Promise<void>;
  } = {
    onRowAdd: (newData: IClass) =>
      new Promise((resolve, reject) => {
        const newDataFields = Object.keys(newData);
        if (
          requiredFieldsClass.some(
            (field: string) => !newDataFields.includes(field)
          )
        ) {
          return reject("Some fields are missing");
        } else {
          return createClass(
            { ...newData, schoolName: filteredSchool },
            connection,
            context
          )
            .then(() =>
              dispatchGetClassesAction(filteredSchool, connection, context)
            )
            .then(() => resolve());
        }
      }),
    onRowDelete: (oldData) =>
      new Promise((resolve) => {
        return deleteClass(oldData, connection, context)
          .then(() =>
            dispatchGetClassesAction(filteredSchool, connection, context)
          )
          .then(() => resolve());
      }),
  };

  return (
    <React.Fragment>
      {filter}
      <MaterialTable
        title="Classes"
        columns={classColumns}
        // filter empty values because map does not support delete yet
        data={Object.values(classes).filter(
          (u: IClass) => u.schoolName !== undefined
        )}
        editable={user.role === ADMIN_ROLE ? editable : {}}
      />
    </React.Fragment>
  );
};

const UserTable = ({
  classes,
  users,
  filteredSchool,
  filteredClass,
  connection,
  context,
  user,
  dispatchSetClassAction,
}: UserPanelProps) => {
  if (
    filteredSchool === undefined ||
    classes === undefined ||
    classes.length === 0
  ) {
    return <React.Fragment />;
  }

  const filter = (
    <AttrFilter
      filterValue={filteredClass}
      values={classes.map((c) => c.className)}
      stateChangeHandler={dispatchSetClassAction}
      label={"Class Filter"}
    />
  );

  if (filteredClass === undefined || user === undefined) {
    return filter;
  }

  const editable: {
    isEditable?: (rowData: IUser) => boolean;
    isDeletable?: (rowData: IUser) => boolean;
    onRowAdd?: (newData: IUser) => Promise<void>;
    onRowUpdate?: (newData: IUser, oldData?: IUser) => Promise<void>;
    onRowDelete?: (oldData: IUser) => Promise<void>;
  } = {
    onRowAdd: (newData: IUser) =>
      new Promise((resolve, reject) => {
        const newDataFields = Object.keys(newData);
        if (
          requiredFieldsUser.some(
            (field: string) => !newDataFields.includes(field)
          )
        ) {
          return reject("Some fields are missing");
        } else {
          newData.role = USER_ROLE;
          newData.school = filteredSchool;
          newData.class = filteredClass;
          return addUser(
            filteredSchool,
            filteredClass,
            newData,
            connection,
            context
          )
            .then(() => getUsersFor(filteredSchool, filteredClass, connection))
            .then(() => dispatchSetClassAction(filteredClass)) // force render
            .then(() => resolve());
        }
      }),
    onRowDelete: (oldData: IUser) => {
      return new Promise((resolve) => {
        return deleteUser(
          oldData,
          filteredSchool,
          filteredClass,
          connection,
          context
        )
          .then(() => getUsersFor(filteredSchool, filteredClass, connection))
          .then(() => dispatchSetClassAction(filteredClass)) // force render
          .then(() => resolve());
      });
    },
    onRowUpdate: (newData: IUser) =>
      new Promise((resolve, reject) => {
        if (newData === undefined || newData.number === undefined) {
          return reject("bad operation");
        }
        const newDataFields = Object.keys(newData);
        if (
          requiredFieldsUser.some(
            (field: string) => !newDataFields.includes(field)
          )
        ) {
          return reject("Some fields are missing");
        } else {
          return addUser(
            filteredSchool,
            filteredClass,
            newData,
            connection,
            context
          )
            .then(() => getUsersFor(filteredSchool, filteredClass, connection))
            .then(() => resolve());
        }
      }),
  };

  return (
    <React.Fragment>
      {filter}
      <MaterialTable
        title="Users"
        columns={userColumns}
        // filter empty values because map does not support delete yet
        data={Object.values(users || []).filter(
          (u: IUser) => u.number !== undefined
        )}
        editable={user.role === ADMIN_ROLE ? editable : {}}
      />
    </React.Fragment>
  );
};

const UserPanel = (props: UserPanelProps) => {
  const {
    classes,
    connection,
    context,
    dispatchGetClassesAction,
    dispatchGetSchoolsAction,
    dispatchGetUsersAction,
    dispatchSetSchoolAction,
    filteredClass,
    filteredSchool,
    schools,
    user,
    users,
  } = props;

  useEffect(() => {
    if (user === undefined) {
      return;
    }
    if (schools === undefined) {
      dispatchGetSchoolsAction(connection, context);
    }
    if (filteredSchool && classes === undefined) {
      dispatchGetClassesAction(filteredSchool, connection, context);
    }
    if (filteredSchool && filteredClass && users === undefined) {
      dispatchGetUsersAction(
        filteredSchool,
        filteredClass,
        connection,
        context
      );
    }
  }, [
    classes,
    connection,
    context,
    dispatchGetSchoolsAction,
    dispatchGetClassesAction,
    dispatchGetUsersAction,
    dispatchSetSchoolAction,
    schools,
    filteredClass,
    filteredSchool,
    user,
    users,
  ]);

  const styleClasses = styles();

  if (!isAuthorized(user, [ADMIN_ROLE])) {
    return NotAuthorized();
  }

  return (
    <Container className={styleClasses.container}>
      <SchoolTable classes={classes} {...props} />
      <ClassTable classes={classes} {...props} />
      <UserTable users={users} {...props} />
    </Container>
  );
};

const getSchoolsActionPromise = (
  connection: Connection,
  context: WallClockTimeContext
) => (dispatch: ThunkDispatch<IUserPanelProps, void, Action>) =>
  getSchools(connection, context).then((schools) => {
    dispatch(getSchoolsAction(schools));
  });

const getClassesActionPromise = (
  filteredSchool: string,
  connection: Connection,
  context: WallClockTimeContext
) => (dispatch: ThunkDispatch<IUserPanelProps, void, Action>) =>
  getClasses(filteredSchool, connection, context).then((classes) =>
    dispatch(getClassesAction(classes))
  );

const getUsersActionPromise = (
  filteredSchool: string,
  filteredClass: string,
  connection: Connection,
  context: WallClockTimeContext
) => (dispatch: ThunkDispatch<IUserPanelProps, void, Action>) =>
  getUsersFor(filteredSchool, filteredClass, connection).then((users) =>
    dispatch(getUsersAction(users))
  );

const mapDispatchToProps = (
  dispatch: ThunkDispatch<IUserPanelProps, void, Action>
) => {
  return bindActionCreators(
    {
      dispatchClearUserPanelFiltersAction: clearUserPanelFiltersAction,
      dispatchGetClassesAction: getClassesActionPromise,
      dispatchGetSchoolsAction: getSchoolsActionPromise,
      dispatchGetUsersAction: getUsersActionPromise,
      dispatchSetClassAction: setClassAction,
      dispatchSetSchoolAction: setSchoolAction,
    },
    dispatch
  );
};

const mapStateToProps = (state: IRootState, props: IUserPanelOwnProps) => {
  const {
    users,
    filteredSchool,
    filteredClass,
    schools,
    classes,
  } = state.userPanel;
  const { user } = state.authentication;
  return {
    classes,
    filteredSchool,
    filteredClass,
    schools,
    user,
    users,
    ...props,
  };
};

export type UserPanelProps = IUserPanelProps &
  IUserPanelDispatchProps &
  IUserPanelOwnProps;
export default connect(mapStateToProps, mapDispatchToProps)(UserPanel);
