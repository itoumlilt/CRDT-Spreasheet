import {LinearProgress, Typography} from "@material-ui/core";
import Box from "@material-ui/core/Box";
import React from "react";

export default (msg: string) => (
  <Box alignItems="center" p={1} m={1} bgcolor="background.paper" css={{height: "200px"}}>
    <LinearProgress />
    <Typography>{msg}</Typography>
  </Box>
);
