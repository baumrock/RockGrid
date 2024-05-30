# Saving Data

By default RockGrids will save selected rows and restore them when loaded. You can add any custom data to this persistant storage if you need:

```js
table.on("cellEdited", (cell) => {
  if (cell.getField() !== "forename") return;
  let val = cell.getValue();
  let forenames = grid.sleepValue.forenames || {};
  forenames[cell.getRow().getData().id] = val;
  grid.sleep("forenames", forenames);
});
```