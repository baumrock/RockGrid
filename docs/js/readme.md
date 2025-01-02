# JS File

In the grid's JS file you can define everything that is frontend-related.

## Custom Settings

You can define custom settings for your grid here:

```js
document.addEventListener("RockGrid:init", (e) => {
  const grid = e.detail;

  // do everything below only for this specific grid
  if (grid.name !== "Your-Grid-Name") return;

  // grid settings
  // ...
});
```

### noStateChanged

RockGrid will by default write some data to a hidden textarea to save selected rows, for example. This might be what you want in most scenarios, but sometimes you have readonly grids (for example to list all child pages) and you don't want to save any data.

As a consequence of writing to a hidden textarea, RockGrid will also add the `InputfieldStateChanged` class to the Inputfield whenever it detects a change. This will then result in a warning when you (or RockFrontend's livereload feature) try to reload the page.

To prevent this from happening you can disable it:

```js
grid.noStateChanged = true;
```
