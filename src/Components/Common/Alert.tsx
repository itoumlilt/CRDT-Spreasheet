import Snackbar from "@material-ui/core/Snackbar";
import {makeStyles, Theme} from "@material-ui/core/styles";
import MuiAlert, {AlertProps, Color} from "@material-ui/lab/Alert";
import React from "react";
import {AlertTitle} from "@material-ui/lab";

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
        onClose={clearMessage}>
        <Alert onClose={clearMessage} severity={severity}>
          {message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export function AppErrorAlert({message}: {title?: string; message?: string}) {
  return (
    <Alert severity="error">
      <AlertTitle>Error</AlertTitle>
      {message}
    </Alert>
  );
}
