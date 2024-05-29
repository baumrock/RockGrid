class _RockGrids {
  grids = {};

  add(grid) {
    this.grids[grid.li.id] = grid;
  }

  getGrid(el) {
    let li = el.closest(".InputfieldRockGrid");
    if (!li) return false;
    return this.grids[li.id];
  }
}
var RockGrids = new _RockGrids();

class RockGrid {
  ajaxURL;
  div;
  li;
  name;
  sleepValue;
  table;
  textarea;
  wrapper;

  constructor(textarea, name) {
    this.name = name;
    this.ajaxURL = "/rockgrid-ajax/" + name + "/";
    this.textarea = document.querySelector(textarea);
    this.li = this.textarea.closest("li.Inputfield");
    this.div = this.li.querySelector("div.RockGrid");
    this.wrapper = this.li.querySelector("div.RockGridWrapper");
    RockGrids.add(this);
    document.dispatchEvent(new CustomEvent("RockGrid:init", { detail: this }));
  }

  getSleepValue() {
    let selectedRows = this.table.getSelectedRows();
    let selectedIds = selectedRows.map((row) => row.getData().id);
    return {
      selected: selectedIds,
    };
  }

  tableBuilt(table) {
    this.table = table;

    // add events necessary for all tables
    table.on("rowSelectionChanged", this.updateTextarea.bind(this));

    // dispatch tableBuilt event so that grids can attach their own listeners
    document.dispatchEvent(
      new CustomEvent("RockGrid:tableBuilt", { detail: this })
    );

    // wakeup the grid (load filters and selected rows)
    this.wakeup();
  }

  updateTextarea() {
    let sleepValue = this.getSleepValue();
    this.sleepValue = sleepValue;
    document.dispatchEvent(
      new CustomEvent("RockGrid:sleepValue", {
        detail: { grid: this, value: sleepValue },
      })
    );
    this.textarea.value = JSON.stringify(this.sleepValue);
    this.li.classList.add("InputfieldStateChanged");
  }

  wakeup() {
    try {
      let data = JSON.parse(this.textarea.value || "{}");
      if (typeof data.selected == "object") {
        this.table.selectRow(data.selected);
      }
    } catch (error) {
      console.error(error);
    }
  }
}

// intercept button click events
document.addEventListener("click", (event) => {
  let button = event.target.closest(".rockgridbutton");
  if (!button) return;
  event.preventDefault();
  let grid = RockGrids.getGrid(button);
  if (!grid) return;
  document.dispatchEvent(
    new CustomEvent("RockGrid:buttonClick", {
      detail: { grid, button, name: button.getAttribute("data-name") },
    })
  );
});

// ##### buttons #####

// reload button
document.addEventListener("RockGrid:buttonClick", (e) => {
  if (e.detail.name !== "refresh") return;

  // make icon spin
  let button = e.detail.button;
  let icon = button.querySelector("i.fa");
  if (icon) {
    icon.classList.add("fa-spin");
  }

  // silently replace new data
  let table = e.detail.grid.table;
  let selectedRows = table.getSelectedData();
  table.replaceData().then(() => {
    table.selectRow(selectedRows.map((row) => row.id));

    // make icon stop spinning
    if (icon) icon.classList.remove("fa-spin");
  });
});

// selectAll
document.addEventListener("RockGrid:buttonClick", (e) => {
  if (e.detail.name !== "selectAll") return;
  let table = e.detail.grid.table;
  table.selectRow("all");
});
// unselectAll
document.addEventListener("RockGrid:buttonClick", (e) => {
  if (e.detail.name !== "unselectAll") return;
  let table = e.detail.grid.table;
  table.deselectRow();
});
// button visibility
document.addEventListener("RockGrid:tableBuilt", (e) => {
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

// selectFiltered
document.addEventListener("RockGrid:buttonClick", (e) => {
  if (e.detail.name !== "selectFiltered") return;
  let table = e.detail.grid.table;
  let filteredRows = table.getRows("active"); // Get only the filtered rows
  table.selectRow(filteredRows.map((row) => row.getData().id));
});
// unselectFiltered
document.addEventListener("RockGrid:buttonClick", (e) => {
  if (e.detail.name !== "unselectFiltered") return;
  let table = e.detail.grid.table;
  let filteredRows = table.getRows("active"); // Get only the filtered rows
  table.deselectRow(filteredRows.map((row) => row.getData().id));
});
// button visibility
document.addEventListener("RockGrid:tableBuilt", (e) => {
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

// remove all filters
document.addEventListener("RockGrid:buttonClick", (e) => {
  if (e.detail.name !== "removeFilters") return;
  let table = e.detail.grid.table;
  table.clearFilter(true);
});
// button visibility
document.addEventListener("RockGrid:tableBuilt", (e) => {
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
