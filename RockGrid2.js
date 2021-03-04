"use strict";

// setup class
function RockGrid2() {
  this.grids = {}
  this.setups = {
    'default': {
      pagination: "local",
      paginationSize: 25,
      layout:"fitColumns",
      autoColumns:true,
    },
  }
}

RockGrid2.prototype.add = function(name, data) {
  let grid = new RG2Grid();
  grid.name = name;
  grid.setup = data;
  this.grids[name] = grid;
}

RockGrid2.prototype.getGrid = function(name) {
  return this.grids[name] || false;
}

RockGrid2.prototype.getSetup = function(name) {
  return this.setups[name || 'default'];
}

RockGrid2.prototype.init = function(name) {
  let grid = this.getGrid(name);
  if(!grid) return;
  grid.table = new Tabulator(grid.grid(), grid.setup);
}

// init class and trigger initial event
var RockGrid2 = new RockGrid2();
$(document).trigger('RockGrid2');

// event listeners
