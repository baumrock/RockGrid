# RockGrid Filters

RockGrid provides powerful filtering capabilities through custom filter functions that extend Tabulator's built-in filtering system. These filters can be applied to any column in your RockGrid table.

## Quick Start

To use any of the RockGrid filters, set the column's `headerFilterFunc` property:

```javascript
// Enable header filtering
col.headerFilter = true;

// Use smart filter
col.headerFilterFunc = "rg.smart";

// Or use the smarter filter for complex queries
col.headerFilterFunc = "rg.smarter";
```

## rg.smart

The smart filter (`rg.smart`) is a versatile filter that supports multiple filtering operations in a single input field. It automatically detects the type of filter to apply based on the input syntax.

### Special Characters

- **`.`** - Shows all non-empty cells (any value that is not null or empty string)
- **`!`** - Shows all empty cells (null or empty string values)

### Numeric Comparisons

- **`>= value`** - Greater than or equal to value
- **`<= value`** - Less than or equal to value
- **`> value`** - Greater than value
- **`< value`** - Less than value

### Exact Match

- **`=value`** - Exact match (case-sensitive)

### Fuzzy Search

The smart filter includes built-in fuzzy search functionality. When you enter multiple words separated by spaces, it automatically performs an AND search across all terms.

**How it works:**
- Enter multiple words separated by spaces (e.g., "ne ci")
- The filter automatically converts this to "ne AND ci"
- This finds records where both "ne" and "ci" appear anywhere in the value
- Perfect for finding "New York City" when searching for "ne ci"

### Default Behavior

If none of the special characters or operators are used, the filter performs a case-insensitive partial match (like filter).

### Examples

```javascript
// Show all records where the value is not empty
"."

// Show all empty records
"!"

// Show all records with values greater than 100
">100"

// Show all records with values less than or equal to 50
"<=50"

// Show all records with values between 10 and 100
">=10 AND <=100"

// Exact match for "John"
"=John"

// Regular text search (uses "like" filter)
"john"  // matches "John", "Johnson", "johnny", etc.
```

## rg.smarter

The smarter filter (`rg.smarter`) extends the smart filter with the ability to combine multiple filter conditions using logical operators. This allows for complex filtering scenarios that would otherwise require multiple filter inputs.

### Logical Operators

- **`AND`** - Both conditions must be true
- **`OR`** - Either condition can be true

### Examples

```javascript
// Show all records with values between 10 and 100
">= 10 AND <= 100"

// Show all records with values less than 50 OR greater than 200
"< 50 OR > 200"

// Show all records that are not empty AND contain "active"
". AND active"

// Show all records that are empty OR contain "pending"
"! OR pending"

// Show all records with values between 100 and 500 OR exactly "special"
">= 100 AND <= 500 OR =special"

// Show all records containing "admin" OR "manager" OR "supervisor"
"admin OR manager OR supervisor"
```
