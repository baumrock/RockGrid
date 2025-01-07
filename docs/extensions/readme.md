# Extensions

## Filters

#### rg.smart

The smart filter (`rg.smart`) is a powerful and flexible filter that can be applied to any column in your RockGrid table. It provides various filtering options including empty/non-empty checks and numeric comparisons.

##### Usage

To use the smart filter, set the column's `headerFilterFunc` to `"rg.smart"`:

```javascript
col.headerFilterFunc = "rg.smart";
```

##### Filter Syntax

The smart filter supports several special characters and operators:

###### Special Characters

- `.` - Shows all non-empty cells
- `!` - Shows all empty cells (null or empty string)

###### Numeric Comparisons

- `>=value` - Greater than or equal to value
- `<=value` - Less than or equal to value
- `>value` - Greater than value
- `<value` - Less than value

###### Default Behavior

If none of the special characters or numeric comparisons are used, the filter falls back to a "like" comparison, which performs a case-insensitive partial match.

##### Examples

```javascript
// Show all records where the value is not empty
"."

// Show all empty records
"!"

// Show all records with values greater than 100
">100"

// Show all records with values less than or equal to 50
"<=50"

// Regular text search (uses "like" filter)
"search term"
