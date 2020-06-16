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
