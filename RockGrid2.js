"use strict";

// setup class
function RockGrid2() {
  this.coldefs = {};
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

RockGrid2.prototype.buttonClick = function(button) {
  let $button = $(button).closest('button');
  let grid = this.getGrid(button);
  // trigger event on grid root element, eg "button.reload"
  // see grid.js for sample button events
  $(grid.grid()).trigger("button."+$button.attr('name'), grid);
}

/**
 * Get grid by name or dom element
 */
RockGrid2.prototype.getGrid = function(name) {
  if(typeof name == 'object') {
    // grid was requested by dom element
    // get name of grid from ID of root element
    let $el = $(name).closest('.RockGrid2');
    name = $el.attr('id').replace('rg2-', '');
  }
  // grid was requested by name
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

RockGrid2.prototype.setColdef = function(column, def, data) {
  let coldef = this.coldefs[def];
  if(typeof coldef == 'function') return coldef(column, data);
  console.warn('coldef '+def+' not found');
}

// init class and trigger initial event
var RockGrid2 = new RockGrid2();
$(document).trigger('RockGrid2');

/**
 * Add coldefs that change many column properties at once
 * You can add custom coldefs easily on the RockGrid2 event
 */

  // money coldef
  RockGrid2.coldefs['money'] = function(column) {
    column.formatter = 'money';
    column.formatterParams = {
      decimal:",",
      thousand:".",
    };
    column.hozAlign = 'right';
    column.bottomCalc = 'sum';
    column.bottomCalcFormatter = 'money';
    column.bottomCalcFormatterParams = {
      decimal:",",
      thousand:".",
    };
  }

/**
 * Event listeners
 */

  // button clicks
  $(document).on('click', '.rg-button', function(e) {
    e.preventDefault();
    RockGrid2.buttonClick(e.target);
  });

  // custom panel fix
  $(document).on('click', '.rg-panel:not(rg-panel-init)', function(e) {
    e.preventDefault();
    let $el = $(e.target).closest('.rg-panel');
    $el.addClass('rg-panel-init');

    // setup link element
    let $a = $el.closest('a[href]');
    if($el.hasClass('rg-panel-reload')) $a.addClass('pw-panel-reload');

    // add panel and trigger click
    $.when(pwPanels.addPanel($a)).then(function() { $a.click(); });
    return false;
  });
