# CSS

RockGrid does currently not offer a way to load custom CSS with your grid. But it's easy with ProcessWire to achieve this!

## Global CSS

If you need some global CSS rules (for example for styling tags on multiple grids), you can add them to `/site/templates/admin.less`:

```less
// add global styles here
.InputfieldRockGrid {
  // this is to test if the css get's loaded
  border: 5px solid blue;

  // tags
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    .tag {
      background: @background-muted-background;
      border-width: 1px;
      border-style: solid;
      border-color: @pw-inputfield-border-color;
      padding: 2px 5px;
      border-radius: 5px;
    }
  }
}
```

The cell formatter to create the necessary markup could look like this:

```js
if (col.field == "tags") {
  col.title = "Tags";
  col.width = 200;
  col.formatter = function (cell) {
    let tags = cell.getValue();
    if (!tags) return "";
    // split tags by comma
    tags = tags.split(",");
    // loop all tags
    let html = "<div class='tags'>";
    tags.forEach((tag) => {
      // only show the last part of the url as tag /foo/bar/baz -> baz
      tag = tag.split("/").pop();
      html += "<span class='tag'>" + tag + "</span>";
    });
    return html + "</div>";
  };
}
```

And the result would look like this:

<img src=tags.png class=blur alt='Tags Example'>
