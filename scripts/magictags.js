/**
 * rg-headerfilter
 */
document.addEventListener(
  "click",
  (e) => {
    let el = e.target.closest("[rg-headerfilter]");
    if (!el) return;
    e.preventDefault();
    e.stopPropagation();

    // get the grid
    const grid = RockGrid.getGrid(el);
    if (!grid) return;

    // get the column from the closest tabulator-field attribute
    const cellEl = el.closest("[tabulator-field]");
    if (!cellEl) return;

    // set the header filter
    const field = cellEl.getAttribute("tabulator-field");
    const search = el.getAttribute("rg-headerfilter") || el.textContent;
    grid.table.setHeaderFilterValue(field, search);
  },
  // this prevents tabulator from firing the click event (eg for row selection)
  // true = use the capture phase.
  // This means the event handler will run before Tabulator's handlers.
  true
);

/**
 * rg-modal: open link in a modal window
 */
document.addEventListener(
  "click",
  (e) => {
    let a = e.target.closest("a[rg-modal]");
    if (!a) return;
    let modalUrl = a.getAttribute("href");
    if (modalUrl) {
      e.preventDefault();
      e.stopPropagation();
      RockGridModal(a);
    }
  },
  true
);
