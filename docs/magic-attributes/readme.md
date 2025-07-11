# Magic Attributes

RockGrid provides powerful magic attributes that enable you to add sophisticated functionality to your grids with minimal code.

## TagsFilter (rg-tagsfilter)

<img src=https://i.imgur.com/P76TJFI.gif class=blur>

The `rg-tagsfilter` magic attribute transforms a simple `<div>` element into an interactive tag-based filtering system. It automatically extracts all unique values from a specified data column, renders them as clickable tags, and enables users to filter the grid by selecting one or more tags.

### Usage

```html
<div rg-tagsfilter="field:column_name"></div>
```

### Options

- `field`: The name of the column in your grid's data source from which to extract unique values for the tags. This parameter is **required**.

### Behavior

RockGrid automatically scans the grid data and generates clickable tags for each unique value found in the specified column.

**Filtering Logic:**
- **Select tags**: Click tags to filter the grid, showing only rows where the column value matches any selected tag
- **Deselect tags**: Click a selected tag again to remove it from the filter
- **Clear all filters**: When no tags are selected, the grid displays all data without any filtering

## Flipper (rg-flipper)

<img src=https://i.imgur.com/hrd2hCj.gif class=blur>

The `rg-flipper` magic attribute creates an interactive date navigation component that allows users to quickly filter dates and navigate between different time periods (years, months, or days). It automatically renders three buttons: previous, current, and next, enabling intuitive date-based filtering.

### Usage

```html
<div rg-flipper="field:date_column;range:year;">Y</div>
<div rg-flipper="field:date_column;range:month;">M</div>
<div rg-flipper="field:date_column;range:day;">D</div>
```

### Options

- `field`: The name of the date column in your grid's data source to filter. This parameter is **required**.
- `range`: The time unit for navigation. Valid values are `year`, `month`, or `day`. This parameter is **required**.

### Behavior

RockGrid automatically transforms the element into a three-button navigation component:

**Button Layout:**
- **Previous (`<`)**: Navigate to the previous time period
- **Current (label)**: Jump to the current time period (today's year/month/day)
- **Next (`>`)**: Navigate to the next time period

**Navigation Logic:**
- **Year navigation**: Filters by year format (`yyyy`)
- **Month navigation**: Filters by year-month format (`yyyy-MM`)
- **Day navigation**: Filters by full date format (`yyyy-MM-dd`)

**Smart Filtering:**
- If a filter is already applied to the date column, the flipper uses that as the starting point for navigation
- If no filter is set, the flipper starts from the current date
- Each navigation action updates the header filter for the specified column

### Dependencies

The Flipper plugin requires the Luxon library for date manipulation. Ensure Luxon is enabled in RockGrid's module settings!

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
