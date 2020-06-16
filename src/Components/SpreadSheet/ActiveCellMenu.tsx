import {
  Button,
  createStyles,
  FormControl,
  FormHelperText,
  makeStyles,
  MenuItem,
  Select,
  Theme,
  Toolbar,
} from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar/AppBar";
import React from "react";
import {connect} from "react-redux";
import {Action, bindActionCreators} from "redux";
import {ThunkDispatch} from "redux-thunk";
import SpreadSheet from "../../Model/SpreadSheet";
import {decreasePrecisionAction, editCellsAction, increasePrecisionAction} from "../Common/Actions/SpreadSheetActions";

import ClassNames from "classnames";
import {IRootState} from "../Common/Types/AppTypes";
import {ActiveCell} from "../Common/Types/SpreadSheetTypes";

interface IActiveMenuStateProps {
  activeCell: ActiveCell;
  spreadSheet?: SpreadSheet;
}

interface IActiveMenuDispatchProps {
  increasePrecision: typeof increasePrecisionAction;
  decreasePrecision: typeof decreasePrecisionAction;
  editCells: typeof editCellsAction;
}

const cellMenuStyle = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      bottom: 0,
      flexGrow: 1,
      top: "auto",
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },

    conflicting: {
      backgroundColor: "rgba(255,242,0,0.53)",
    },
  })
);

// The check of value type is a bit of an hack because we do not have access to the computed value
const ActiveMenuInner = ({
  activeCell,
  spreadSheet,
  increasePrecision,
  editCells,
  decreasePrecision,
}: ActiveMenuProps) => {
  const cellRefs =
    spreadSheet && spreadSheet.contains(activeCell.row, activeCell.column)
      ? spreadSheet.get(activeCell.row, activeCell.column)
      : {};
  const classes = cellMenuStyle();
  const keys = Object.keys(cellRefs).sort();
  const editCellsHandler = (event: React.ChangeEvent<{value: unknown}>) => {
    editCells([
      {
        column: activeCell.column,
        row: activeCell.row,
        type: cellRefs[keys[event.target.value as number]]!.type,
        value: cellRefs[keys[event.target.value as number]]!.value,
      },
    ]);
  };
  // If all values arew empty automatically save
  return (
    <AppBar position="fixed" color="default" className={classes.appBar}>
      <Toolbar>
        <React.Fragment>
          <FormControl className={classes.formControl}>
            <FormHelperText>Select Value</FormHelperText>
            <Select
              disabled={keys.length <= 1}
              value={keys.length === 0 ? "" : 0}
              onChange={editCellsHandler}
              className={ClassNames(classes.selectEmpty, keys.length > 1 && classes.conflicting)}>
              {keys.map((k, i) => {
                const value = cellRefs[k]!.value;
                return (
                  <MenuItem key={k} value={i}>
                    {value}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </React.Fragment>
        {(!isNaN(Number(activeCell.value)) || activeCell.value.toString().charAt(0) === "=") && (
          <React.Fragment>
            <Button onClick={increasePrecision}>Increase Precision</Button>
            <Button onClick={decreasePrecision}>Decrease Precision</Button>
          </React.Fragment>
        )}
      </Toolbar>
    </AppBar>
  );
};

const mapDispatchToProps = (dispatch: ThunkDispatch<ActiveMenuProps, {}, Action>) => {
  return bindActionCreators(
    {
      decreasePrecision: decreasePrecisionAction,
      editCells: editCellsAction,
      increasePrecision: increasePrecisionAction,
    },
    dispatch
  );
};

const mapActiveMenuStateToProps = (state: IRootState) => {
  const {spreadSheet} = state.spreadSheet;
  let {activeCell} = state.spreadSheet;
  if (activeCell === undefined) {
    activeCell = {column: 0, row: 0, type: "number", value: ""};
  }

  return {activeCell, spreadSheet};
};

type ActiveMenuProps = IActiveMenuStateProps & IActiveMenuDispatchProps;
export const ActiveMenu = connect(mapActiveMenuStateToProps, mapDispatchToProps)(ActiveMenuInner);