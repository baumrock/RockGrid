/**
 * RockGrid filters for tabulator
 *
 * Usage:
 * col.headerFilter = true;
 * col.headerFilterFunc = "rg.smarter";
 */
Tabulator.extendModule("filter", "filters", {
  /**
   * Smart filter
   * Supports ., !, <, >, <=, >=, = and falls back to like filter
   */
  "rg.smart": function (filterVal, rowVal, rowData, filterParams) {
    const search = filterVal.trim();
    const val = rowVal;

    // searching . returns all non-empty cells
    if (search === ".") return !(val === null || val == "");
    // searching ! returns all empty cells
    if (search === "!") return val === null || val == "";

    // number comparisons - use existing filters
    if (search.indexOf("<=") === 0)
      return this["<="](
        parseFloat(search.substring(2)),
        val,
        rowData,
        filterParams
      );
    if (search.indexOf(">=") === 0)
      return this[">="](
        parseFloat(search.substring(2)),
        val,
        rowData,
        filterParams
      );
    if (search.indexOf("<") === 0)
      return this["<"](
        parseFloat(search.substring(1)),
        val,
        rowData,
        filterParams
      );
    if (search.indexOf(">") === 0)
      return this[">"](
        parseFloat(search.substring(1)),
        val,
        rowData,
        filterParams
      );
    if (search.indexOf("=") === 0)
      return this["="](search.substring(1).trim(), val, rowData, filterParams);

    // we got a string like "ne ci"
    // convert this to "ne AND ci" to find "New York City"
    if (search.includes(" ")) {
      // Split by spaces and join with AND for fuzzy search
      const terms = search.split(/\s+/).filter((term) => term.length > 0);
      if (terms.length > 1) {
        const fuzzySearch = terms.join(" AND ");
        return this["rg.smarter"](fuzzySearch, val, rowData, filterParams);
      }
    }

    // otherwise we use the regular like filter
    return this["like"](search, val, rowData, filterParams);
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
  "rg.smarter": function (filterVal, rowVal, rowData, filterParams) {
    const filters = this;
    const search = filterVal.trim();

    // If no search value, show all rows
    if (!search) return true;

    // Split by AND/OR operators while preserving the operators
    const parts = search.split(/\s+(AND|OR)\s+/i);

    // If no operators found, use the original smart filter
    if (parts.length === 1) {
      return filters["rg.smart"](search, rowVal, rowData, filterParams);
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
      const partResult = filters["rg.smart"](
        part,
        rowVal,
        rowData,
        filterParams
      );

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
