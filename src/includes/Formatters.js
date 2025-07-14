/**
 * RockGrid formatters for tabulator
 *
 * Simple usage:
 * col.formatter = RockGrid.formatters.tags;
 *
 * Providing custom formatter parameters:
 * col.formatter = RockGrid.formatters.money;
 * col.formatterParams = { renderNull: false };
 *
 * Using multiple formatters:
 * col.formatter = (cell) => {
 *   const value = cell.getValue();
 *   let out = RockGrid.formatters.tags(cell);
 *   RockGrid.formatters.background(
 *     cell,
 *     value < 0 ? "rg-bg-red-100" : "rg-bg-green-100"
 *   );
 *   return out;
 * };
 */

RockGrid.formatters = {
  /**
   * Add a background color to the cell
   *
   * Usage:
   * col.formatter = function(cell) {
   *   const value = cell.getValue();
   *   RockGrid.formatters.background(
   *     cell,
   *     value < 0 ? "rg-bg-red-100" : "rg-bg-green-100"
   *   );
   * }
   */
  background: function (cell, className) {
    const cellElement = cell.getElement();
    cellElement.classList.add(className);
  },

  /**
   * Email formatter
   *
   * Usage:
   * col.formatter = RockGrid.formatters.email;
   */
  email: function (cell, formatterParams = null) {
    let val = cell.getValue();
    if (!val) return "";

    // add stopPropagation to prevent row selection
    return `<a
      href='mailto:${val}'
      onclick="event.stopPropagation();"
    >${val}</a>`;
  },

  /**
   * Money formatter
   *
   * Usage:
   * col.formatter = RockGrid.formatters.money;
   */
  money: function (data, params = null) {
    // get value or default to 0
    const value = RockGrid.getValue(data, 0);

    // get formatter params
    const defaults = {
      currency: RockGrid.config.currency,
      locale: RockGrid.config.locale,
      hideSymbol: RockGrid.config.hideSymbol,
    };
    params = { ...defaults, ...params };

    // render null or empty cell?
    if (!value && params.renderNull === false) return "";

    // format number
    let number = new Intl.NumberFormat(params.locale, {
      style: "currency",
      currency: params.currency,
    }).format(value);

    // hide currency symbol?
    if (params.hideSymbol) number = number.replace(/[^-0-9.,]/g, "");

    // return formatted number
    return number;
  },

  /**
   * Clickable tags that also set the header filter
   *
   * Usage:
   * col.formatter = RockGrid.formatters.tags;
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

  /**
   * URL formatter
   *
   * Usage:
   * col.formatter = RockGrid.formatters.url;
   *
   * Usage with custom target:
   * col.formatter = RockGrid.formatters.url;
   * col.formatterParams = { target: "_self" };
   */
  url: function (cell, formatterParams = null) {
    let val = cell.getValue();
    if (!val) return "";
    // get target from formatter params
    const target = formatterParams?.target || "_blank";

    // add stopPropagation to prevent row selection
    return `<a
      href='${val}'
      target='${target}'
      onclick="event.stopPropagation();"
    >${val}</a>`;
  },
};
