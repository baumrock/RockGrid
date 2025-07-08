/**
 * RockGrid formatters for tabulator
 *
 * Simple usage:
 * col.formatter = RockGrid.formatters.tags;
 *
 * Advanced usage (apply multiple formatters):
 * col.formatter = (cell) => {
 *   const value = cell.getValue();
 *   let out = RockGrid.formatters.tags(cell);
 *   RockGrid.formatters.background(
 *     value < 0
 *       ? "rg-bg-red-100"
 *       : "rg-bg-green-100"
 *   );
 *   return out;
 * };
 */

RockGrid.formatters = {
  /**
   * Clickable tags that also set the header filter
   */
  tags: function (cell) {
    let val = cell.getValue();
    if (!val) return "";
    // split by comma
    const tags = val.split(",");
    return tags
      .map((tag) => `<span class='tag' rg-headerfilter='${tag}'>${tag}</span>`)
      .join(" ");
  },

  background: function (cell, className) {
    const cellElement = cell.getElement();
    cellElement.classList.add(className);
  },
};
