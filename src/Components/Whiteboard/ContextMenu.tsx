import {Button, Drawer, InputLabel, List, ListItem, TextField} from "@material-ui/core";
import React from "react";
import {styles} from "../Common/Styles/Styles";
import {IElementState} from "../Common/Types/WhiteboardTypes";
import {WhiteboardProps} from "./Whiteboard";

interface IContextDrawer {
  classes: any;
  onChangeElement: (attr: string) => (event: {target: {value: string}}) => void;
  onDeleteElement: () => void;
  selected?: IElementState;
  toggleDrawer?: (element?: IElementState) => (event: React.KeyboardEvent | React.MouseEvent) => void;
  whiteboardProps: WhiteboardProps;
}

const ElementActions = (element: IElementState, props: IContextDrawer) => {
  const {id, name} = element;
  const {classes, onChangeElement, onDeleteElement} = props;
  return (
    <List>
      <ListItem>
        <InputLabel className={classes.contextMenuInputLabel}>Name</InputLabel>
        <TextField id={id + "-name"} value={name} variant="outlined" onChange={onChangeElement("name")} />
      </ListItem>
      <ListItem>
        <Button id={id + "-delete-action"} variant={"contained"} onClick={onDeleteElement}>
          Delete
        </Button>
      </ListItem>
    </List>
  );
};

export const ContextMenu = (contextMenuProps: IContextDrawer) => {
  const {selected, toggleDrawer} = contextMenuProps;
  const classes = styles();

  return selected !== undefined ? (
    <Drawer
      anchor={"right"}
      open={selected !== undefined}
      onClose={toggleDrawer && toggleDrawer(undefined)}
      BackdropProps={{
        className: classes.hideBackdrop,
      }}>
      <List className={classes.whiteboardContextMenu}>
        <ListItem>{ElementActions(selected, contextMenuProps)}</ListItem>
      </List>
    </Drawer>
  ) : (
    <React.Fragment></React.Fragment>
  );
};
