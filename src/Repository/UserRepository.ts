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
  Context,
  GOMapCRDT,
  LWWRegister,
  TotalOrder,
  WallClock,
  WallClockTimestamp
} from "concordant-crdtlib";
import { Connection } from "concordant-server";
import { IClass, IUser } from "../Components/Common/Types/UserTypes";
import { stringAsKey } from "../Components/Common/Utils";

export type Schools = string[];

export interface IUsers {
  users: { [userId in string]: IUser };
}

interface IGroups {
  users: { [groupNumber in string]: { [userId in string]: IUser } };
}

export const getSchools = (
  connection: Connection,
  context: Context<TotalOrder, WallClockTimestamp, WallClock>
) => {
  return connection
    .get<LWWRegister<Schools>>(SCHOOLS_KEY, () =>
      LWWRegister.create([], context).toJSONObj(context)
    )
    .then(doc => LWWRegister.fromJSON<Schools>(doc.current(), context).value());
};

export const createSchool = (
  schoolName: string,
  connection: Connection,
  context: Context<TotalOrder, WallClockTimestamp, WallClock>
) => {
  return connection.get<Schools>(SCHOOLS_KEY).then(doc => {
    const schools = LWWRegister.fromJSON<Schools>(
      doc.current(),
      context
    ).value();
    schools.push(schoolName);
    doc.update(LWWRegister.create(schools, context).toJSONObj(context));
    return doc.save();
  });
};

// TODO: cascade delete operations
export const deleteSchool = (
  schoolName: string,
  connection: Connection,
  context: Context<TotalOrder, WallClockTimestamp, WallClock>
) => {
  return connection.get<Schools>(SCHOOLS_KEY).then(doc => {
    const schools = LWWRegister.fromJSON<Schools>(
      doc.current(),
      context
    ).value();
    const index = schools.indexOf(schoolName);
    schools.splice(index, 1);
    doc.update(LWWRegister.create(schools, context).toJSONObj(context));
    return doc.save();
  });
};

export const getClasses = (
  schoolName: string,
  connection: Connection,
  context: Context<TotalOrder, WallClockTimestamp, WallClock>
) => {
  return connection
    .get<GOMapCRDT<TotalOrder, WallClockTimestamp, WallClock>>(
      makeSchoolClassesKey(schoolName),
      () => GOMapCRDT.create(context).toJSONObj(context)
    )
    .then(doc =>
      Object.values(
        GOMapCRDT.fromJSON<TotalOrder, WallClockTimestamp, WallClock>(
          doc.current(),
          context
        ).value()
      )
    ) as Promise<IClass[]>;
};

export const createClass = (
  classParams: IClass,
  connection: Connection,
  context: Context<TotalOrder, WallClockTimestamp, WallClock>
) => {
  const { className, schoolName } = classParams;
  return (
    connection
      .get(makeSchoolClassesKey(schoolName), () =>
        GOMapCRDT.create(context).toJSONObj(context)
      )
      .then(doc => {
        const classObj = GOMapCRDT.fromJSON(doc.current(), context);
        classObj.put(
          className,
          LWWRegister.create({ ...classParams }, context)
        );
        doc.update(classObj.toJSONObj(context));
        return doc.save();
      })
      // Create Class Groups Map
      .then(() =>
        connection.get<IGroups>(makeClassGroupsKey(className, schoolName), () =>
          GOMapCRDT.create(context).toJSONObj(context)
        )
      )
  );
};

// Remove resets values
// TODO: implement delete operation and replace
export const deleteClass = (
  classParams: IClass,
  connection: Connection,
  context: Context<TotalOrder, WallClockTimestamp, WallClock>
) => {
  const { className, schoolName } = classParams;
  return connection
    .get(makeSchoolClassesKey(schoolName))
    .then(doc => {
      const classObj = GOMapCRDT.fromJSON(doc.current(), context);
      classObj.put(className, LWWRegister.create({}, context));
      doc.update(classObj.toJSONObj(context));
      return doc.save();
    })
    .then(() => connection.get(makeClassGroupsKey(className, schoolName)))
    .then(doc => {
      const emptyGroups = GOMapCRDT.create(context).toJSONObj(context);
      doc.update(emptyGroups);
      doc.save();
    });
};

export const getUsers = (
  connection: Connection,
  context: Context<TotalOrder, WallClockTimestamp, WallClock>
) => {
  return connection
    .get<IUsers>(makeUsersIndexKey(), () => getNewUsersCRDTasJSON(context))
    .then(doc => doc.current().users);
};

export const getUsersFor = (
  schoolName: string,
  className: string,
  connection: Connection
) => {
  return connection
    .get<IGroups>(makeClassGroupsKey(className, schoolName))
    .then(doc => {
      const users = doc.current().users;
      if (users === undefined) {
        return [];
      }
      return Object.values(users).reduce((accUsers: IUser[], group) => {
        Object.values(group).forEach(u => accUsers.push(u));
        return accUsers;
      }, []);
    });
};

export const addUser = (
  schoolName: string,
  className: string,
  user: IUser,
  connection: Connection,
  context: Context<TotalOrder, WallClockTimestamp, WallClock>
) => {
  return connection
    .get<IUsers>(makeClassGroupsKey(className, schoolName))
    .then(doc => {
      const users = GOMapCRDT.fromJSON(doc.current(), context);
      users.put(
        "users/" + user.group + "/" + user.email,
        LWWRegister.create(user, context)
      );
      doc.update(users.toJSONObj(context));
      return doc.save();
    })
    .then(() =>
      connection.get<IUsers>(makeUsersIndexKey(), () =>
        getNewUsersCRDTasJSON(context)
      )
    )
    .then(doc => {
      const users = GOMapCRDT.fromJSON(doc.current(), context);
      users.put("users/" + user.email, LWWRegister.create(user, context));
      doc.update(users.toJSONObj(context));
      return doc.save();
    });
};

export const deleteUser = (
  user: IUser,
  schoolName: string,
  className: string,
  connection: Connection,
  context: Context<TotalOrder, WallClockTimestamp, WallClock>
) =>
  connection
    .get(makeClassGroupsKey(className, schoolName))
    .then(doc => {
      const users = GOMapCRDT.fromJSON(doc.current(), context);
      users.put(
        "users/" + user.group + "/" + stringAsKey(user.email),
        LWWRegister.create({}, context)
      );
      doc.update(users.toJSONObj(context));
      return doc.save();
    })
    .then(() => connection.get<IUsers>(makeUsersIndexKey()))
    .then(doc => {
      const users = GOMapCRDT.fromJSON(doc.current(), context);
      users.put(
        "users/" + stringAsKey(user.email),
        LWWRegister.create({}, context)
      );
      doc.update(users.toJSONObj(context));
      return doc.save();
    });

const getNewUsersCRDTasJSON = (
  context: Context<TotalOrder, WallClockTimestamp, WallClock>
): IUsers => {
  const map = GOMapCRDT.create(context);
  map.put("users", GOMapCRDT.create(context));
  return map.toJSONObj(context);
};

const makeSchoolClassesKey = (schoolName: string) =>
  stringAsKey(schoolName) + "_" + CLASSES_KEY;
const makeClassGroupsKey = (className: string, schoolName: string) =>
  stringAsKey(schoolName) + "_" + stringAsKey(className) + "_" + USERS_KEY;
// const makeGroupKey = (className: string, schoolName: string, group: number) =>
//  stringAsKey(schoolName) + "_" + stringAsKey(className) + "_" + group + "_" + USERS_KEY;
const makeUsersIndexKey = () => USERS_KEY;

const USERS_KEY = "USERS";
const SCHOOLS_KEY = "SCHOOLS";
const CLASSES_KEY = "CLASSES";
