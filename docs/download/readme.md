# Download

RockGrid provides powerful data export capabilities through Tabulator's built-in download functionality. You can export your grid data in various formats including CSV, JSON, XLSX, and more.

Please check out the docs at https://tabulator.info/docs/6.3/download

## XLSX Download

For XLSX downloads RockGrid comes with its own implementation as I found tabulator's implementation hard to setup and hard to work with.

That's why RockGrid uses https://github.com/exceljs/exceljs instead of https://docs.sheetjs.com/

With this library it is not only possible to export boring plain data! You can apply column filters to your excel, add styling like background colors or you can add a link to your id column that, when clicked, points the user directly to your PW backend to edit that page 🚀😎

### Adding a download button

First we need to add a download button to our grid:

```php
public function buildUI(): void
{
  $this->buttonsRight->add([
    'name' => 'xlsx',
    'icon' => 'file-excel-o',
    'tooltip' => 'XLSX Export',
  ]);
}
```

So far this button does not do anything, so in our grid's JS file we need to add the click handler:

```js
// the part after : needs to match your buttons name
RockGrid.on("button:xlsx", (el) => {
  const table = RockGrid.getTable(el);
  // get active data (all filtered rows)
  const rows = table.getData("active");
  // log active rows to console - you can leave this here
  // as it can be handy for copying the data to the clipboard
  console.log(rows);

  // create a new workbook and download it
  RockGrid.excel({
    filename: "my-excel",
    sheets: [
      {
        name: "Exported Data",
        rows: rows,
      },
    ],
  });
});
```

### The `RockGrid.excel()` method

The `RockGrid.excel()` method takes a single configuration object with the following properties:

- `filename` (string): The name of the file to be downloaded (without extension).
- `sheets` (array): An array of sheet objects to be created in the workbook.

Each sheet object can have the following properties:

- `name` (string): The name of the worksheet. Defaults to "Sheet1", "Sheet2" etc.
- `rows` (array): An array of data rows. Each row can be an array of cell values or an object. See exceljs docs for details.
- `columns` (object): Column configuration object. Keys are column names, values are column settings. Set to `false` to exclude a column.
- `sheetCallback` (function): A callback function that is executed after the sheet is created. It receives the `worksheet` object, `columns` array, and `columnSettings` object as arguments. You can use this to set column properties or other sheet-level settings.
- `rowCallback` (function): A callback function that is executed for each row added to the sheet. It receives the `row` object and the original `rowData` as arguments. This is useful for custom cell styling or formatting.

### Basic Example

The most basic usage is to provide the rows to be exported. The data from `table.getData("active")` is an array of objects, which works out of the box. `exceljs` will create columns based on the keys of the first object and use them as headers.

```js
// the part after : needs to match your buttons name
RockGrid.on("button:xlsx", (el) => {
  const table = RockGrid.getTable(el);
  // get active data (all filtered rows)
  const rows = table.getData("active");

  // create a new workbook and download it
  RockGrid.excel({
    filename: "my-excel",
    sheets: [
      {
        name: "Exported Data",
        rows: rows,
      },
    ],
  });
});
```
This will create an Excel file named `my-excel.xlsx` with one sheet named "Exported Data" containing all the filtered data from your grid.

### Advanced Example from RockInvoice

```js
// xlsx button
RockGrid.on("button:xlsx", (el) => {
  const table = RockGrid.getTable(el);
  // get active data (all filtered rows)
  const rows = table.getData("active");
  // log active rows to console - you can leave this here
  // as it can be handy for copying the data to the clipboard
  console.log(rows);

  // create a new workbook
  RockGrid.excel({
    filename: "rockinvoice-export",
    sheets: [
      {
        rows,
        columns: {
          id: { width: 10 },
          pdf: { width: 10 },
          group: { width: 20 },
          // more columns here
          hasFile: false,
          clone: false,
        },
        sheetCallback: function (sheet) {
          sheet.autoFilter = "A1:M1";
        },
        rowCallback: function (row, rowData) {
          row.getCell("id").value = {
            text: rowData.id,
            hyperlink: RockGrid.httpEditUrl(rowData.id),
          };
          if (rowData.pdf) {
            row.getCell("pdf").value = {
              text: "PDF",
              hyperlink: rowData.pdf,
            };
          }
        },
      },
    ],
  });
});
```

### Column Configuration
By default, all columns from your data are exported and will use the column key (field property) as the header text. You can control which columns are exported and their properties using the `columns` object:

```js
columns: {
  id: { width: 10 },
  title: { width: 30 },
  date: { width: 15 },
  // Exclude columns by setting them to false
  internalField: false,
  hiddenColumn: false,
}
```

To set custom column headers, you can use the `header` property:

```js
columns: {
  id: { width: 10, header: "Invoice ID" },
  title: { width: 30, header: "Invoice Title" },
  date: { width: 15, header: "Created Date" },
  // Exclude columns by setting them to false
  internalField: false,
  hiddenColumn: false,
}
```

### Sheet Callback

The `sheetCallback` function allows you to configure the worksheet after it's created:

```js
sheetCallback: function (sheet, columns, columnSettings) {
  // Add auto-filter to the first row
  sheet.autoFilter = "A1:M1";

  // Set column widths
  sheet.getColumn("A").width = 15;
  sheet.getColumn("B").width = 25;

  // Add styling to header row
  sheet.getRow(1).font = { bold: true };
}
```

### Row Callback

The `rowCallback` function allows you to customize each row as it's added:

```js
rowCallback: function (row, rowData) {
  // Add hyperlinks to specific cells
  row.getCell("id").value = {
    text: rowData.id,
    hyperlink: RockGrid.httpEditUrl(rowData.id),
  };

  // Add conditional formatting
  if (rowData.status === "paid") {
    row.getCell("status").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF90EE90" } // Light green
    };
  }
}
```
