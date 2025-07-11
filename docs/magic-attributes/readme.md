# Magic Attributes

RockGrid provides powerful magic attributes that enable you to add sophisticated functionality to your grids with minimal code.

## TagsFilter (rg-tagsfilter)

<img src=https://i.imgur.com/GZuLiKw.png class=blur>

The `rg-tagsfilter` magic attribute transforms a simple `<div>` element into an interactive tag-based filtering system. It automatically extracts all unique values from a specified data column, renders them as clickable tags, and enables users to filter the grid by selecting one or more tags.

### Usage

```html
<div rg-tagsfilter="field:column_name"></div>
```

### Options

- `field`: The name of the column in your grid's data source from which to extract unique values for the tags. This parameter is **required**.

### Behavior

When users click on tags, the grid filters to display only rows where the value in the specified `field` matches any of the selected tags. Clicking a selected tag again deselects it. When no tags are selected, all filters are removed and the grid shows all data.

## HeaderFilter (rg-headerfilter)

<img src=https://i.imgur.com/rjbntcH.gif class=blur>

The `rg-headerfilter` magic attribute creates clickable header filters. When an element with this attribute is placed within a column header, RockGrid automatically applies filtering to that column when the element is clicked.

### Basic Usage

```html
<span rg-headerfilter>Example Tag</span>
```

By default, RockGrid applies a header filter to the column containing the element and filters based on the element's text content.

### Custom Filter Text

You can specify custom search text that differs from the element's display text:

```html
<span rg-headerfilter="/foo/bar">Foo Bar</span>
```

In this example, clicking the element will filter for "/foo/bar" even though the element displays "Foo Bar".
