class _RockGrids {
  grids = {};

  add(grid) {
    this.grids[grid.li.id] = grid;
  }
}
var RockGrids = new _RockGrids();

class RockGrid {
  div;
  li;
  sleepValue;
  table;
  textarea;
  wrapper;

  constructor(textarea) {
    this.textarea = document.querySelector(textarea);
    this.li = this.textarea.closest("li.Inputfield");
    this.div = this.li.querySelector("div.RockGrid");
    this.wrapper = this.li.querySelector("div.RockGridWrapper");
    RockGrids.add(this);

    // dispatch init event
    document.dispatchEvent(new CustomEvent("RockGrid:init", { detail: this }));
    document.dispatchEvent(
      new CustomEvent("RockGrid:afterInit", { detail: this })
    );
  }

  afterInit() {
    this.table = Tabulator.findTable(this.div)[0];
    this.table.on("tableBuilt", this.wakeup.bind(this));
    this.table.on("rowSelectionChanged", this.updateTextarea.bind(this));
  }

  getSleepValue() {
    let selectedRows = this.table.getSelectedRows();
    let selectedIds = selectedRows.map((row) => row.getData().id);
    return {
      selected: selectedIds,
    };
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
      let data = JSON.parse(this.textarea.value || "");
      this.table.selectRow(data.selected);
    } catch (error) {
      console.error(error);
    }
  }
}

document.addEventListener("RockGrid:afterInit", (e) => {
  e.detail.afterInit();
});
