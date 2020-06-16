import {
  cellIdFromIdString,
  getIdxFromRowOrColumn,
  getRowAndColumnFromPos,
  idCompare,
  makeIdBetween,
  makeIdToTheRight,
  makeZeroId,
} from "./Utils";

describe("getIdxFromRowOrColumn", () => {
  it("column 0", () => {
    const stringValue = "A";
    const actualValue = getIdxFromRowOrColumn(stringValue);
    expect(actualValue).toEqual(0);
  });

  it("row 0", () => {
    const stringValue = "0";
    const actualValue = getIdxFromRowOrColumn(stringValue);
    expect(actualValue).toEqual(-1);
  });

  it("column limit", () => {
    const stringValue = "Z";
    const actualValue = getIdxFromRowOrColumn(stringValue);
    expect(actualValue).toEqual(25);
  });

  it("column limit +1", () => {
    const stringValue = "AA";
    const actualValue = getIdxFromRowOrColumn(stringValue);
    expect(actualValue).toEqual(26);
  });
});

describe("getRowAndColumnFromPos", () => {
  it("position 0 0", () => {
    const row = 0;
    const column = 0;
    const actualValue = getRowAndColumnFromPos(row, column);
    expect(actualValue).toEqual("A1");
  });

  it("position 0 0", () => {
    const row = 0;
    const column = 26;
    const actualValue = getRowAndColumnFromPos(row, column);
    expect(actualValue).toEqual("AA1");
  });
});

describe("Create and order row/column ids", () => {
  it("makeZeroId", () => {
    const id = makeZeroId(true, "client");
    const idFromString = cellIdFromIdString("R_0_client");
    expect(idFromString).toEqual(id);
  });

  it("makeIdToTheRight R_0_client and undefined", () => {
    const id = makeIdToTheRight("R_0_client", true, "client");
    const idFromString = cellIdFromIdString("R_1_client");
    expect(idFromString).toEqual(id);
  });

  it("makeIdBetween R_0 and R_1", () => {
    const id = makeIdBetween("R_0_client", "R_1_client", true, "client");
    const idFromString = cellIdFromIdString("R_1_0_client");
    expect(idFromString).toEqual(id);
  });

  it("makeIdBetween R_0_0 and R_1_0_client", () => {
    const id = makeIdBetween("R_1_0_client", "R_1_client", true, "client");
    const idFromString = cellIdFromIdString("R_1_0_0_client");
    expect(idFromString).toEqual(id);
  });

  it("id compare", () => {
    const res0 = idCompare("R_0_a", "R_0_b");
    expect(res0).toBeLessThan(0);
    const res1 = idCompare("R_0_a", "R_1_a");
    expect(res1).toBeLessThan(0);
    const res2 = idCompare("R_0_0_a", "R_0_a");
    expect(res2).toBeLessThan(0);
  });
});
