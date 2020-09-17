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
import Snackbar from "@material-ui/core/Snackbar";
import { makeStyles, Theme } from "@material-ui/core/styles";
import MuiAlert, { AlertProps, Color } from "@material-ui/lab/Alert";
import React from "react";
import { AlertTitle } from "@material-ui/lab";

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    "& > * + *": {
      marginBottom: theme.spacing(2),
    },
    width: "100%",
  },
}));

export default function AppAlert({
  clearMessage,
  message,
  severity,
}: {
  clearMessage?: () => void;
  message?: string;
  severity?: Color;
}) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Snackbar
        anchorOrigin={{
          horizontal: "center",
          vertical: "top",
        }}
        open={message !== undefined}
        autoHideDuration={3000}
        onClose={clearMessage}
      >
        <Alert onClose={clearMessage} severity={severity}>
          {message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export function AppErrorAlert({
  message,
}: {
  title?: string;
  message?: string;
}) {
  return (
    <Alert severity="error">
      <AlertTitle>Error</AlertTitle>
      {message}
    </Alert>
  );
}
