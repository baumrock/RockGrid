# Magic Attributes

## TagsFilter (rg-tagsfilter)

<img src=https://i.imgur.com/GZuLiKw.png class=blur>

This attribute turns a simple `<div>` into a set of clickable tags that can be used to filter the grid. It automatically extracts all unique values from the specified data column, displays them as tags, and allows users to filter the grid by clicking on them.

### Usage

```html
<div rg-tagsfilter="field:column_name"></div>
```

### Options

- `field`: The name of the column in your grid's data source from which to extract the unique values for the tags. This is a **required** parameter.

When a user clicks on one or more tags, the grid will be filtered to show only the rows where the value in the specified `field` matches one of the selected tags. Clicking a tag again deselects it. If no tags are selected, the filter is removed.
