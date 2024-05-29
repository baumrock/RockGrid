class RockGridMaster {
  edit = ProcessWire.config.urls.admin + "page/edit/?id=";
  grids = {};

  add(grid) {
    this.grids[grid.li.id] = grid;
  }

  getGrid(el) {
    let li = el.closest(".InputfieldRockGrid");
    if (!li) return false;
    return this.grids[li.id];
  }

  getTable(el) {
    return this.getGrid(el).table;
  }
}
var RockGrid = new RockGridMaster();

class RockGridGrid {
  ajaxURL;
  awake = false;
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
    RockGrid.add(this);
    document.dispatchEvent(new CustomEvent("RockGrid:init", { detail: this }));
  }

  getSleepValue() {
    let selectedRows = this.table.getSelectedRows();
    let selectedIds = selectedRows.map((row) => row.getData().id);
    return {
      selected: selectedIds,
    };
  }

  reload() {
    let table = this.table;
    return new Promise((resolve, reject) => {
      let selectedRows = table.getSelectedData();
      table
        .replaceData()
        .then(() => {
          table.selectRow(selectedRows.map((row) => row.id));
          resolve();
        })
        .catch(reject);
    });
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
    let oldValue = this.textarea.value;
    let newValue = JSON.stringify(this.sleepValue);
    if (oldValue !== newValue) {
      this.textarea.value = newValue;
      if (this.awake) this.li.classList.add("InputfieldStateChanged");
    }
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
    this.awake = true;
  }
}

// edit page in modal
function RockGridModal(el) {
  let $iframe = pwModalWindow(el.getAttribute("href"));
  $iframe.on("dialogclose", () => {
    if (el.getAttribute("rg-modal-reload") !== null)
      RockGrid.getGrid(el).reload();
  });
}
