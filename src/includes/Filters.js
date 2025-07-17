/**
 * RockGrid filters for tabulator
 *
 * Simple usage:
 * col.headerFilter = true;
 * col.headerFilterFunc = "rg.smart2";
 */
Tabulator.extendModule("filter", "filters", {
  /**
   * Smart filter
   * Supports ., !, <, >, <=, >=, = and falls back to like filter
   */
  "rg.smart": function (headerValue, rowValue, rowData, filterParams) {
    const filters = this;
    const search = headerValue;
    const val = rowValue;

    // searching . returns all non-empty cells
    if (search === ".") return !(val === null || val == "");
    // searching ! returns all empty cells
    if (search === "!") return val === null || val == "";
    // number comparisons
    if (search.indexOf("<=") === 0)
      return val <= parseFloat(search.substring(2));
    if (search.indexOf(">=") === 0)
      return val >= parseFloat(search.substring(2));
    if (search.indexOf("<") === 0) return val < parseFloat(search.substring(1));
    if (search.indexOf(">") === 0) return val > parseFloat(search.substring(1));

    // = foo uses an exact match
    if (search.indexOf("=") === 0) return val === search.substring(1);

    // otherwise we use the regular like filter
    return filters["like"](search, val, rowData, filterParams);
  },

  /**
   * Smarter filter
   *
   * Just like the smart filter but you can combine multiple filters (AND/OR)
   *
   * Examples:
   * - "john AND smith" - both terms must match
   * - "john OR jane" - either term must match
   * - ">100 AND <500" - value must be between 100 and 500
   * - "! OR foo" - either empty or foo
   */
  "rg.smarter": function (headerValue, rowValue, rowData, filterParams) {
    const filters = this;
    const search = headerValue.trim();
    const val = rowValue;

    // If no search value, show all rows
    if (!search) return true;

    // Split by AND/OR operators while preserving the operators
    const parts = search.split(/\s+(AND|OR)\s+/i);
    // console.log(parts);

    // If no operators found, use the original smart filter
    if (parts.length === 1) {
      return filters["rg.smart"](search, val, rowData, filterParams);
    }

    // Process each part and operator
    let result = null;
    let currentOperator = null;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();

      if (part === "AND" || part === "OR") {
        currentOperator = part;
        continue;
      }

      // Apply the smart filter to this part
      const partResult = filters["rg.smart"](part, val, rowData, filterParams);

      // Combine results based on operator
      if (result === null) {
        result = partResult;
      } else if (currentOperator === "AND") {
        result = result && partResult;
      } else if (currentOperator === "OR") {
        result = result || partResult;
      }
    }

    return result !== null ? result : true;
  },
});
