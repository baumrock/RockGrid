"use strict";

// setup class
function RockGrid2() {
  this.coldefs = {};
  this.grids = {}
  this.setups = {
    'default': {
      ajaxURL:true, // custom flag to use rockgrid endpoint
      pagination:'local',
      paginationSize:20,
      layout:"fitColumns",
      autoColumns:true,
      autoColumnsDefinitions:function(definitions) {
        definitions.forEach((col) => { col.headerFilter = true; });
        return definitions;
      },
    },
  }
}

RockGrid2.prototype.add = function(name, data, setup) {
  setup = this.setups[setup || 'default'];

  // by default we set the ajax url to the current grid
  // if you dont want an ajax grid set ajaxURL = false in your setup
  if(setup.ajaxURL === true) setup.ajaxURL = "/rockgrid2/"+name;

  // create setup object
  // first we take one of the predefined setups and merge user setup data
  // then we set all callbacks to rockgrid-callbacks (see https://github.com/olifolkerd/tabulator/issues/3230)
  setup = $.extend(setup, data, this.callbacks());

  // now create the grid object
  this.grids[name] = new RG2Grid(name, setup);
}

RockGrid2.prototype.buttonClick = function(button) {
  let $button = $(button).closest('button');
  let grid = this.getGrid(button);
  // trigger event on grid root element, eg "button.reload"
  // see grid.js for sample button events
  grid.$el.trigger("rg.button."+$button.attr('name'), [grid, $button]);
}

RockGrid2.prototype.callbacks = function() {
  let rg = this;
  return {
    dataFiltering:function(...params) { rg.trigger(this, 'dataFiltering', params); },
    dataFiltered:function(...params) { rg.trigger(this, 'dataFiltered', params); },
  }
}

/**
 * Get grid by name or dom element
 */
RockGrid2.prototype.getGrid = function(name) {
  if(typeof name == 'object') {
    // is it a tabulator object? then it has an "element" property
    if(name.element) name = name.element;

    // get grid by dom element
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
  grid.$root = $('#rg2-'+grid.name);
  grid.$el = grid.$root.find('.rg-grid');
  grid.el = grid.$el[0];
  grid.table = new Tabulator(grid.el, grid.setup);
}

RockGrid2.prototype.setColdef = function(column, def, data) {
  let coldef = this.coldefs[def];
  if(typeof coldef == 'function') return coldef(column, data);
  console.warn('coldef '+def+' not found');
}

RockGrid2.prototype.trigger = function(table, event, params) {
  let grid = this.getGrid(table);
  $(document).trigger('rg.'+event, {grid, params});
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
