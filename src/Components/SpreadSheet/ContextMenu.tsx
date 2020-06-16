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
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import React from "react";
import {connect} from "react-redux";
import {bindActionCreators, Dispatch} from "redux";
import {addColumnAction, addRowAction, closeContextMenuAction} from "../Common/Actions/SpreadSheetActions";
import {IRootState} from "../Common/Types/AppTypes";
import {COLUMN_HEADER_MENU, ISpreadSheetConfig, ROW_HEADER_MENU} from "../Common/Types/SpreadSheetTypes";

const ContextMenu = (props: Props) => {
  const {selectedElement, config, contextMenu, closeContextMenu} = props;
  if (!config.config.expand) {
    // currently menu only has expansion controls
    return <div />;
  }
  return (
    <Menu
      id="menu-header-button"
      anchorEl={selectedElement}
      anchorOrigin={{
        horizontal: "left",
        vertical: "top",
      }}
      keepMounted
      transformOrigin={{
        horizontal: "right",
        vertical: "top",
      }}
      open={selectedElement !== undefined}
      onClose={closeContextMenu}>
      {selectedElement && contextMenuItems(contextMenu, props)}
    </Menu>
  );
};

const contextMenuItems = (contextMenu: string, props: Props) => {
  const {addColumn, addRow, selectedElement} = props;
  switch (contextMenu) {
    case COLUMN_HEADER_MENU: {
      const columnIdx = selectedElement.attributes.column.value;
      const addColumnAfter = () => addColumn(columnIdx, "after");
      const addColumnBefore = () => addColumn(columnIdx, "before");
      return [
        <MenuItem key="addColBefore" onClick={addColumnBefore}>
          Add Column Before
        </MenuItem>,
        <MenuItem key="addColAfter" onClick={addColumnAfter}>
          {" "}
          Add Column After{" "}
        </MenuItem>,
      ];
    }
    case ROW_HEADER_MENU: {
      const rowIdx = selectedElement.attributes.row.value;
      const addRowAfter = () => addRow(rowIdx, "after");
      const addRowBefore = () => addRow(rowIdx, "before");
      return [
        <MenuItem key="addRowBefore" onClick={addRowBefore}>
          Add Row Before
        </MenuItem>,
        <MenuItem key="addRowAfter" onClick={addRowAfter}>
          {" "}
          Add Row After{" "}
        </MenuItem>,
      ];
    }
  }
};

const mapStateToProps = ({app}: IRootState) => {
  const {selectedElement, contextMenu} = app;
  return {selectedElement, contextMenu};
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators(
    {
      addColumn: addColumnAction,
      addRow: addRowAction,
      closeContextMenu: closeContextMenuAction,
    },
    dispatch
  );
};

interface IContextMenuOwnProps {
  config: ISpreadSheetConfig;
}

interface IContextMenuStateProps {
  selectedElement: any;
  contextMenu: any;
}

interface IContextMenuDispatchProps {
  addColumn: typeof addColumnAction;
  addRow: typeof addRowAction;
  closeContextMenu: typeof closeContextMenuAction;
}

type Props = IContextMenuStateProps & IContextMenuDispatchProps & IContextMenuOwnProps;
export default connect(mapStateToProps, mapDispatchToProps)(ContextMenu);
