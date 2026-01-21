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

The `rg-flipper` magic attribute creates an interactive date navigation component that allows users to quickly filter dates and navigate between different time periods (years, months, weeks, or days). It automatically renders three buttons: previous, current, and next, enabling intuitive date-based filtering.

### Usage

```html
<div rg-flipper="field:date_column;range:year;">Y</div>
<div rg-flipper="field:date_column;range:month;">M</div>
<div rg-flipper="field:date_column;range:monday;">W</div>
<div rg-flipper="field:date_column;range:day;">D</div>
<div rg-flipper="field:week;range:monday;format:yy-MM-dd;">W</div>
```

### Options

- `field`: The name of the date column in your grid's data source to filter. This parameter is **required**.
- `range`: The time unit for navigation. Valid values are `year`, `month`, `monday` (week), or `day`. This parameter is **required**.
- `format`: Custom date format string (optional). If not provided, default formats are used based on the range type.

### Default Formats

- **Year**: `yyyy`
- **Month**: `yyyy-MM`
- **Monday/Week**: `yyyy-MM-dd`
- **Day**: `yyyy-MM-dd`

Note: We do **not** use week numbers (like `yyyy-WW`) for week-based filtering because week numbers can cause confusing results around the new year. For example, dates at the end of December and the beginning of January may belong to the same ISO week, but have different years, or vice versa. This can lead to situations where days from two different years are grouped under the same week number, or the same date appears in different weeks depending on the year. To avoid this ambiguity, RockGrid uses the date of the Monday that starts the week (e.g., `yy-MM-dd`) as the filter value. This approach ensures that each week is uniquely and consistently identified, even across year boundaries.

### Behavior

RockGrid automatically transforms the element into a three-button navigation component:

**Button Layout:**
- **Previous (`<`)**: Navigate to the previous time period
- **Current (label)**: Jump to the current time period (today's year/month/week/day)
- **Next (`>`)**: Navigate to the next time period

**Navigation Logic:**
- **Year navigation**: Filters by year format (`yyyy`)
- **Month navigation**: Filters by year-month format (`yyyy-MM`)
- **Monday/Week navigation**: Filters by full date format (`yyyy-MM-dd`) starting from Monday of the week
- **Day navigation**: Filters by full date format (`yyyy-MM-dd`)

**Smart Filtering:**
- If a filter is already applied to the date column, the flipper uses that as the starting point for navigation
- If no filter is set, the flipper starts from the current date
- Each navigation action updates the header filter for the specified column

### Dependencies

The Flipper plugin requires the Luxon library for date manipulation. Ensure Luxon is enabled in RockGrid's module settings!

### Tooltips

You can add tooltips to your flipper like this:

```php
<span
  rg-flipper="field:day;range:month;"
  title="Flip Month" uk-tooltip
>M</span>
```

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
