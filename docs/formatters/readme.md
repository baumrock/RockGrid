# Formatters

Formatters define how the data of the cell is rendered. For example the cell value could be the ID of the row or the ID of the ProcessWire page and the formatter could transform that into an edit icon like here:

<img src=https://i.imgur.com/lo13FiZ.png class=blur alt='Cell Formatter'>

## Row Actions

A common use case is that you want to render row action buttons on the left of each row. To do this we reuse the ID column and set a formatter to render the icons instead of the actual ID:

```js
autoColumnsDefinitions: function (defs) {
  defs.forEach((col) => {
    // defaults
    col.headerFilter = true;

    // column settings
    if (col.field == "id") {
      col.headerFilter = false;
      col.headerSort = false;
      col.title = "";
      col.hozAlign = "center";
      col.width = 40;
      col.formatter = function (cell) {
        return RockGrid.link({
          icon: "edit",
          href: RockGrid.editUrl(cell.getValue()),
          tooltip: "Edit this item",
          modal: true, // open link in modal
          modalCloseReload: true, // reload grid data after modal close
        });
      };
    }
  });
  return defs;
},
```

If you want to render multiple items just chain several link() calls and increase the column width:

```js
col.width = 60;
col.formatter = function (cell) {
  return (
    RockGrid.link({
      icon: "search",
      href: RockGrid.viewUrl(cell.getValue()),
      tooltip: "anzeigen",
      class: "uk-margin-small-right",
    }) +
    RockGrid.link({
      icon: "edit",
      href: RockGrid.editUrl(cell.getValue()),
      tooltip: "bearbeiten",
      modal: true,
      modalCloseReload: true,
    })
  );
};
```

Note: In the example above we add the class `uk-margin-small-right` to the left icon to separate the icons a little bit. Another approach could be to use flexbox with gap:

```js
return "<div class='uk-flex' style='gap:10px'>"
  + RockGrid.link(...)
  + RockGrid.link(...)
  + "</div>";
```

## Coldefs

This is a lot to do to get a simple row edit link, you think? Then I have something for you:

```js
if (col.field == "id") RockGrid.coldefs["edit"](col);
```

RockGrid comes with some predefined column definitions that you can use to set a bunch of column properties at once. You can even use the coldef and then overwrite certain properties later:

```js
if (col.field == "id") {
  RockGrid.coldefs["edit"](col);
  col.title = "row actions";
  col.headerHozAlign = "center";
  col.width = 100;
}
```
