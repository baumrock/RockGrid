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
