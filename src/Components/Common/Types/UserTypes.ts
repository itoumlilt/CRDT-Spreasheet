export interface IUser {
  number: string;
  firstName: string;
  lastName: string;
  role: Role;
  password: string;
  school: string;
  class: string;
  group: number;
  email: string;
}

export interface IClass {
  numGroups: number;
  className: string;
  schoolName: string;
}

export type UserId = string;

export const guest = "GUEST";
export type GuestRole = "GUEST";

export const admin = "ADMIN";
export type AdminRole = "ADMIN";

export const user = "USER";
export type UserRole = "USER";
export type Role = AdminRole | GuestRole | UserRole;
