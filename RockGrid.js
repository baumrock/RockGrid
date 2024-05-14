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
  }
}
