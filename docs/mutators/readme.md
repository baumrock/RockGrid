# Mutators

Mutators change the value of the cell. Compared to `Formatters` this will not only affect how the cell is rendered but also which value is used for filtering and sorting.

## Dynamic Column

Mutators can also be used to create dynamic columns that rely on data from another column.

Let's say we had a mysql date from a ProcessWire Datetime field in the column `from` and we only want to show the day in the format `YYYY-MM-DD` in a dedicated column:

```js
// we add the column after the "id" column
defs = grid.addAfter(defs, "id", {
  // we set a custom field value that we can use in other places to work
  // with our new data
  field: "day",

  // set the title of the column
  title: "Datum",

  // set the width of the column
  width: 100,

  // use a mutator to define the cell value
  mutator: function (value, data) {
    // grab the "from" data column
    const from = data.from;

    // if no from date is set return early
    if (!from) return;

    // use the luxon library to parse the date from mysql format
    // please note that you have to enable luxon in the module settings!
    const date = luxon.DateTime.fromFormat(from, "yyyy-MM-dd HH:mm:ss");

    // return iso date as YYYY-MM-DD
    return date.toISODate();
  },
});
```
