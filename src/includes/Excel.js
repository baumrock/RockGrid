RockGrid.excel = async function (config) {
  let name = config.filename || config.name || "data"; // filename
  let sheets = config.sheets || { Sheet1: {} }; // sheets

  const wb = new ExcelJS.Workbook();

  let i = 1;
  for (const sheet of sheets) {
    const sheetName = sheet.name || "Sheet" + i++;

    const ws = wb.addWorksheet(sheetName);
    const rows = sheet.rows || [];

    // create a default columns array from received data
    const columns = [];
    const columnSettings = sheet.columns || {};
    if (
      rows.length > 0 &&
      rows[0] instanceof Object &&
      !(rows[0] instanceof Array)
    ) {
      Object.keys(rows[0]).forEach((k) => {
        // k is the received column data object from tabulator
        // for the id column this is "id"
        // we then merge settings set by the user via columns: { ... }

        // if columnSettings[k] is false, skip it
        if (columnSettings[k] === false) return;

        // otherwise add the column to the columns array
        columns.push({
          header: k,
          key: k,
          ...columnSettings[k],
        });
      });
    }

    // ensure that we have the sort order of columnSettings
    const columnKeys = Object.keys(columnSettings);
    columns.sort((a, b) => {
      const indexA = columnKeys.indexOf(a.key);
      const indexB = columnKeys.indexOf(b.key);
      return indexA - indexB;
    });
    ws.columns = columns;
    // console.log(columns);

    // if a callback is defined, call it
    if (typeof sheet.sheetCallback == "function")
      sheet.sheetCallback(ws, columns, columnSettings);

    // iterate rows
    rows.forEach((rowData, rowindex) => {
      const row = ws.addRow(rowData);
      if (typeof sheet.rowCallback == "function") {
        sheet.rowCallback(row, rowData);
      }
    });
  }

  try {
    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf]), name + ".xlsx");
  } catch (error) {
    console.error("Error generating Excel file:", error);
    throw error;
  }
};
