# Columns

You can set many options for your columns. Please refer to the [tabulator docs](https://tabulator.info/docs/).

## Dynamic Columns

```js
autoColumnsDefinitions: function (defs) {
  // add dynamic columns
  defs.push({ ... });

  // set sort order
  grid.columnOrder(defs, ["id", "foo", "bar"]);

  // ...
}
```

## Hide Columns

Hiding columns can be done by setting `col.visible = false;`:

```js
if (col.field == "from") col.visible = false;
else if (col.field == "to") col.visible = false;
```

## Column Tooltips

You can use UIkit tooltips to show additional column descriptions:

```js
col.title = "<span title='This is a column tooltip' uk-tooltip>Demo</span>";
```

You could even just show an icon:

```js
col.title = "<span title='This is a column tooltip' uk-tooltip><i class='fa fa-check'></span>";
```

## Column Calculations

You can add aggregations to your columns, see https://tabulator.info/docs/6.3/column-calcs

A simple example to add a sum column:

```js
if (col.field == "hours") col.bottomCalc = "sum";
```

You can even define custom callbacks, so for example you can show different sums based on whether rows are selected or not:

```js
const table = grid.tabulator({
  // ...
  autoColumnsDefinitions: function (defs) {
    // ...
    defs.forEach((col) => {
      // ...
      if (col.field == "hours") {
        col.width = 90;
        col.hozAlign = "right";
        col.title = "Hours";
        col.bottomCalc = (values) => {
          const selectedRows = grid.table.getSelectedRows();
          let sum = 0;
          // no rows selected --> return sum of values
          if (!selectedRows.length) {
            sum = values.reduce((a, b) => a + b, 0);
            return sum.toFixed(2);
          }
          // rows selected --> return sum of selected rows
          selectedRows.forEach((row) => (sum += row.getData().hours));
          sum = sum.toFixed(2);
          return "(" + sum + ")";
        };
      }
    });
  },
});

// recalc sum when selection changes
table.on("rowSelectionChanged", () => table.recalc());
```
