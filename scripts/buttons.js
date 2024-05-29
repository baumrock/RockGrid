// Buttons feature for RockGrid

// ##### global button click interception
document.addEventListener("click", (event) => {
  let button = event.target.closest(".rockgridbutton");
  if (!button) return;
  event.preventDefault();
  let grid = RockGrid.getGrid(button);
  if (!grid) return;
  document.dispatchEvent(
    new CustomEvent("RockGrid:buttonClick", {
      detail: { grid, button, name: button.getAttribute("data-name") },
    })
  );
});

// ##### reload button
(() => {
  document.addEventListener("RockGrid:buttonClick", (e) => {
    if (e.detail.name !== "refresh") return;

    // make icon spin
    let button = e.detail.button;
    let icon = button.querySelector("i.fa");
    if (icon) {
      icon.classList.add("fa-spin");
    }

    // silently replace new data
    let grid = e.detail.grid;
    grid.reload().then(() => {
      if (icon) icon.classList.remove("fa-spin");
    });
  });
})();

// ### (un)select ALL
(() => {
  document.addEventListener("RockGrid:buttonClick", (e) => {
    // selectAll
    if (e.detail.name !== "selectAll") return;
    let table = e.detail.grid.table;
    table.selectRow("all");
  });
  document.addEventListener("RockGrid:buttonClick", (e) => {
    // unselectAll
    if (e.detail.name !== "unselectAll") return;
    let table = e.detail.grid.table;
    table.deselectRow();
  });
  document.addEventListener("RockGrid:tableBuilt", (e) => {
    // button visibility
    let grid = e.detail;
    let toggleButtons = function () {
      let rows = grid.table.getSelectedRows();
      let rowsTotal = grid.table.getData().length;
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
    };
    grid.table.on("rowSelectionChanged", toggleButtons);
    grid.table.on("dataProcessed", toggleButtons);
  });
})();

// ### (un)select FILTERED
(() => {
  document.addEventListener("RockGrid:buttonClick", (e) => {
    // selectFiltered
    if (e.detail.name !== "selectFiltered") return;
    let table = e.detail.grid.table;
    let filteredRows = table.getRows("active"); // Get only the filtered rows
    table.selectRow(filteredRows.map((row) => row.getData().id));
  });
  document.addEventListener("RockGrid:buttonClick", (e) => {
    // unselectFiltered
    if (e.detail.name !== "unselectFiltered") return;
    let table = e.detail.grid.table;
    let filteredRows = table.getRows("active"); // Get only the filtered rows
    table.deselectRow(filteredRows.map((row) => row.getData().id));
  });
  document.addEventListener("RockGrid:tableBuilt", (e) => {
    // button visibility
    let grid = e.detail;
    let toggleButtons = function () {
      setTimeout(() => {
        let rows = grid.table.getSelectedRows();
        let rowsTotal = grid.table.getData().length;
        let rowsFiltered = grid.table.getRows("active").length;
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
    };
    grid.table.on("rowSelectionChanged", toggleButtons);
    grid.table.on("dataProcessed", toggleButtons);
    grid.table.on("dataFiltered", toggleButtons);
  });
})();

// ### remove filters
(() => {
  document.addEventListener("RockGrid:buttonClick", (e) => {
    // remove all filters
    if (e.detail.name !== "removeFilters") return;
    let table = e.detail.grid.table;

    // note: this will only remove header filters of the table
    // this is to make it keep programmatically added filters
    // necessary for RockCommerce Variations Grid
    table.clearHeaderFilter(true);
  });
  document.addEventListener("RockGrid:tableBuilt", (e) => {
    // button visibility
    let grid = e.detail;
    let toggleButtons = function () {
      setTimeout(() => {
        let rowsTotal = grid.table.getData().length;
        let rowsFiltered = grid.table.getRows("active").length;
        let button = grid.wrapper.querySelector(
          '.rockgridbutton[data-name="removeFilters"]'
        );
        if (button) {
          button.style.display = rowsTotal !== rowsFiltered ? "block" : "none";
        }
      }, 0);
    };
    grid.table.on("dataFiltered", toggleButtons);
  });
})();
