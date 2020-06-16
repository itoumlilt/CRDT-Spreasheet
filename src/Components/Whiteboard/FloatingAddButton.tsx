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
  ClickAwayListener,
  Fab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Popper,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import GridOnIcon from "@material-ui/icons/GridOn";
import StopIcon from "@material-ui/icons/Stop";
import React from "react";
import {styles} from "../Common/Styles/Styles";
import {WhiteboardProps} from "./Whiteboard";

export const FloatingAddButton = (props: WhiteboardProps) => {
  const classes = styles();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const id = open ? "simple-popper" : undefined;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleOnAddContainer = () => props.dispatchCreateContainerAction(props);
  const handleOnAddTable = () => props.dispatchCreateTableAction(props);
  const handleClickAway = () => setAnchorEl(null);

  return (
    <Box>
      <Fab aria-label={"label"} aria-describedby={id} onClick={handleClick} className={classes.fab} color={"primary"}>
        <AddIcon />
      </Fab>
      <Popper id={id} open={open} anchorEl={anchorEl}>
        <ClickAwayListener onClickAway={handleClickAway}>
          <Paper>
            <List component="nav" aria-label="main mailbox folders">
              <ListItem button onClick={handleOnAddContainer}>
                <ListItemIcon>
                  <StopIcon />
                </ListItemIcon>
                <ListItemText primary="Add Container" />
              </ListItem>
              <ListItem button onClick={handleOnAddTable}>
                <ListItemIcon>
                  <GridOnIcon />
                </ListItemIcon>
                <ListItemText primary="Add Table" />
              </ListItem>
            </List>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
};
