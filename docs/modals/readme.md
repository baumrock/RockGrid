# Modals

When working with RockGrid we often open links in modal windows to make sure we stay on the page that shows the grid and don't lose any filters or applied sorting.

## Reload grid when modal is closed

A common need is to reload the grid data when a modal has been closed, for example after creating a new grid item (row entry).

```js
// reload grid after a pw modal has been closed
$(document).on("pw-modal-closed", () => {
  grid.reload();
});
```
