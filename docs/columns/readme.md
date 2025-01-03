# Columns

You can set many options for your columns. Please refer to the [tabulator docs](https://tabulator.info/docs/).

## Hide Columns

Hiding columns can be done by setting `col.visible = false;`:

```js
if (col.field == "from") col.visible = false;
else if (col.field == "to") col.visible = false;
```

RockGrid provides a shortcut for this:

```js
defs = grid.hide(defs, ["from", "to"]);
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
