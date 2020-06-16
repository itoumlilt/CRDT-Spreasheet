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
import { createMuiTheme, createStyles, makeStyles } from "@material-ui/core";

export const theme = createMuiTheme({
  palette: {
    secondary: {
      main: "#f0f0f0"
    }
  },
  typography: {
    body2: {
      fontWeight: "bold"
    }
  }
});

export const styles = makeStyles(() =>
  createStyles({
    baseContainer: { paddingTop: 20 },
    container: {
      display: "flex",
      flexWrap: "wrap",
      "& > *": {
        margin: theme.spacing(1),
        width: "100%"
      }
    },
    contextDrawer: {
      width: 250
    },
    contextMenuInputLabel: {
      marginLeft: 10,
      marginRight: 10
    },
    draggableContainer: {
      border: "1px black solid"
    },
    editBar: { marginTop: 10, marginBottom: 65 },
    filterBar: {
      "& > *": {
        margin: theme.spacing(1)
      },
      display: "flex",
      flexWrap: "wrap"
    },
    hideBackdrop: {
      background: "none"
    },
    noEditBar: { marginTop: 40, marginBottom: 65 },

    tableContainer: {
      margin: 10,
      padding: 10
    },

    paper: {},

    spreadSheetContainer: {
      height: "100",
      overflowX: "scroll",
      width: "100%"
    },

    fab: {
      bottom: theme.spacing(2),
      position: "absolute",
      right: theme.spacing(2)
    },
    whiteboardContextMenu: {
      width: 250
    },
    notepadContainer: {
      height: "100%",
      width: "100%"
    }
  })
);
