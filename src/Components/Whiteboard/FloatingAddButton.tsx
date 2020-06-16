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
