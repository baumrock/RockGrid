// Buttons feature for RockGrid
// console.log("buttons.js");

// ### button click interception
document.addEventListener("click", (event) => {
  let button = event.target.closest(".rockgridbutton");
  if (!button) return;

  // if the button has an href attribute then we let the click through
  if (button.hasAttribute("href")) {
    return;
  }

  event.preventDefault();
  let grid = RockGrid.getGrid(button);
  if (!grid) return;
  let name = button.getAttribute("data-name");
  grid.trigger("button:" + name, button);
});

// ##### refresh/reload button
RockGrid.on("button:refresh", (button) => {
  let icon = button.querySelector("i.fa");
  if (icon) icon.classList.add("fa-spin");

  const startTime = Date.now();
  const minSpinTime = 1000; // minimum spin time in ms (1s = 1 full turn)

  // silently replace new data
  RockGrid.getGrid(button)
    .reload()
    .then(() => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minSpinTime - elapsedTime);

      setTimeout(() => {
        if (icon) icon.classList.remove("fa-spin");
      }, remainingTime);
    })
    .catch(() => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minSpinTime - elapsedTime);

      setTimeout(() => {
        if (icon) icon.classList.remove("fa-spin");
      }, remainingTime);
    });
});

// ### remove filters
RockGrid.on("button:removeFilters", (button) => {
  let table = RockGrid.getTable(button);

  // note: this will only remove header filters of the table
  // this is to make it keep programmatically added filters
  // necessary for RockCommerce Variations Grid
  table.clearHeaderFilter(true);
});
RockGrid.on("table:dataFiltered", (table, grid) => {
  setTimeout(() => {
    let headerFilters = table.getHeaderFilters();
    let button = grid.wrapper.querySelector(
      '.rockgridbutton[data-name="removeFilters"]'
    );
    if (button) {
      button.style.display = headerFilters.length ? "block" : "none";
    }
  }, 0);
});

// ### (un)select ALL
RockGrid.on("button:selectAll", (button) => {
  RockGrid.getTable(button).selectRow("all");
});
RockGrid.on("button:unselectAll", (button) => {
  RockGrid.getTable(button).deselectRow();
});
RockGrid.on("table:dataProcessed,table:rowSelectionChanged", (table, grid) => {
  let rows = table.getSelectedRows();
  let rowsTotal = table.getData().length;
  let unselect = grid.wrapper.querySelector(
    '.rockgridbutton[data-name="unselectAll"]'
  );
  if (unselect) {
    unselect.style.display = rows.length !== 0 ? "block" : "none";
  }
  let select = grid.wrapper.querySelector(
    '.rockgridbutton[data-name="selectAll"]'
  );
  if (select) {
    select.style.display = rows.length !== rowsTotal ? "block" : "none";
  }
});

// ### (un)select FILTERED
RockGrid.on("button:selectFiltered", (button) => {
  let table = RockGrid.getTable(button);
  let filteredRows = table.getRows("active"); // Get only the filtered rows
  table.selectRow(filteredRows.map((row) => row.getData().id));
});
RockGrid.on("button:unselectFiltered", (button) => {
  let table = RockGrid.getTable(button);
  let filteredRows = table.getRows("active"); // Get only the filtered rows
  table.deselectRow(filteredRows.map((row) => row.getData().id));
});
RockGrid.on(
  "table:dataProcessed,table:rowSelectionChanged,table:dataFiltered",
  (table, grid) => {
    setTimeout(() => {
      let rows = table.getSelectedRows();
      let rowsTotal = table.getData().length;
      let rowsFiltered = table.getRows("active").length;
      let show = rowsTotal !== rowsFiltered;
      let unselect = grid.wrapper.querySelector(
        '.rockgridbutton[data-name="unselectFiltered"]'
      );
      if (unselect) {
        unselect.style.display = show && rows.length !== 0 ? "block" : "none";
      }
      let select = grid.wrapper.querySelector(
        '.rockgridbutton[data-name="selectFiltered"]'
      );
      if (select) {
        select.style.display =
          show && rows.length !== rowsFiltered ? "block" : "none";
      }
    }, 0);
  }
);
