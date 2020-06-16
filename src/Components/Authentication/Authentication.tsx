import {Box, Button, Container, TextField} from "@material-ui/core";
import {WallClockTimeContext} from "concordant-crdtlib";
import {Connection} from "concordant-server";
import React, {useState} from "react";
import {getUsers} from "../../Repository/UserRepository";
import {loginAction, loginErrorAction, logoutAction} from "../Common/Actions/AuthenticationActions";
import {admin, IUser} from "../Common/Types/UserTypes";

export const SECRET_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || "ADMIN";

interface ILoginState {
  email: string;
  password: string;
}

interface IAuthenticationProps {
  user?: IUser;
  login: typeof loginAction;
  loginError: typeof loginErrorAction;
  logout: typeof logoutAction;
  connection: Connection;
  context: WallClockTimeContext;
}

const adminUser: IUser = {
  class: "admin",
  email: "admin",
  firstName: "admin",
  group: 0,
  lastName: "admin",
  number: "0",
  password: SECRET_PASSWORD,
  role: admin,
  school: "admin",
};

const isAdminUser = (username: string, password: string) =>
  username === adminUser.email && password === adminUser.password;

export const Authentication = ({user, login, loginError, logout, connection, context}: IAuthenticationProps) => {
  const [loginState, setLoginState] = useState<ILoginState>({email: "", password: ""});
  const {email, password} = loginState;

  const handleChange = (name: keyof ILoginState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoginState({...loginState, [name]: event.target.value});
  };

  const handleLogin = () => {
    if (isAdminUser(email, password)) {
      login(adminUser);
    } else {
      getUsers(connection, context).then(users => {
        const currUser = users[email];
        if (currUser !== undefined && currUser.password === password) {
          login(currUser);
        } else {
          loginError();
        }
      });
    }
  };
  return (
    <Container maxWidth={"xs"}>
      <Box width={130}>
        {user === undefined && (
          <React.Fragment>
            <TextField
              label={"Email"}
              value={loginState.email}
              onChange={handleChange("email")}
              variant="outlined"
              margin={"dense"}
            />
            <TextField
              label={"Password"}
              value={loginState.password}
              onChange={handleChange("password")}
              type={"password"}
              variant="outlined"
              margin={"dense"}
            />
          </React.Fragment>
        )}
      </Box>
      <Box>
        <Button variant="contained" href={"#"} onClick={user ? logout : handleLogin}>
          {user ? "Sign out" : "Sign in"}
        </Button>
      </Box>
    </Container>
  );
};
