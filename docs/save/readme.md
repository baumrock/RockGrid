# Saving Data

By default RockGrids will save selected rows and restore them when loaded. You can add any custom data to this persistant storage if you need.

```js
document.addEventListener("RockGrid:sleepValue", (e) => {
  // get grid and current sleepvalue
  let grid = e.detail.grid;
  let value = e.detail.value;
  console.log(value, 'old value');

  // add custom data
  value.foo = "bar";
  console.log(value, 'new value');

  // write back the new value that will be saved
  grid.sleepValue = value;
});
```