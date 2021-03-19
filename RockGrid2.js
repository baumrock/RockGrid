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

  // predefined color codes
  // see https://davidpiesse.github.io/tailwind-md-colours/
  this.colors = {
    "transparent": "transparent",
    "black": "#000000",
    "white": "#ffffff",
    "red": "#f44336",
    "red-50": "#ffebee",
    "red-100": "#ffcdd2",
    "red-200": "#ef9a9a",
    "red-300": "#e57373",
    "red-400": "#ef5350",
    "red-500": "#f44336",
    "red-600": "#e53935",
    "red-700": "#d32f2f",
    "red-800": "#c62828",
    "red-900": "#b71c1c",
    "red-100-accent": "#ff8a80",
    "red-200-accent": "#ff5252",
    "red-400-accent": "#ff1744",
    "red-700-accent": "#d50000",
    "blue": "#2196f3",
    "blue-50": "#e3f2fd",
    "blue-100": "#bbdefb",
    "blue-200": "#90caf9",
    "blue-300": "#64b5f6",
    "blue-400": "#42a5f5",
    "blue-500": "#2196f3",
    "blue-600": "#1e88e5",
    "blue-700": "#1976d2",
    "blue-800": "#1565c0",
    "blue-900": "#0d47a1",
    "blue-100-accent": "#82b1ff",
    "blue-200-accent": "#448aff",
    "blue-400-accent": "#2979ff",
    "blue-700-accent": "#2962ff",
    "green": "#4caf50",
    "green-50": "#e8f5e9",
    "green-100": "#c8e6c9",
    "green-200": "#a5d6a7",
    "green-300": "#81c784",
    "green-400": "#66bb6a",
    "green-500": "#4caf50",
    "green-600": "#43a047",
    "green-700": "#388e3c",
    "green-800": "#2e7d32",
    "green-900": "#1b5e20",
    "green-100-accent": "#b9f6ca",
    "green-200-accent": "#69f0ae",
    "green-400-accent": "#00e676",
    "green-700-accent": "#00c853",
    "yellow": "#ffeb3b",
    "yellow-50": "#fffde7",
    "yellow-100": "#fff9c4",
    "yellow-200": "#fff59d",
    "yellow-300": "#fff176",
    "yellow-400": "#ffee58",
    "yellow-500": "#ffeb3b",
    "yellow-600": "#fdd835",
    "yellow-700": "#fbc02d",
    "yellow-800": "#f9a825",
    "yellow-900": "#f57f17",
    "yellow-100-accent": "#ffff8d",
    "yellow-200-accent": "#ffff00",
    "yellow-400-accent": "#ffea00",
    "yellow-700-accent": "#ffd600",
    "orange": "#ff9800",
    "orange-50": "#fff3e0",
    "orange-100": "#ffe0b2",
    "orange-200": "#ffcc80",
    "orange-300": "#ffb74d",
    "orange-400": "#ffa726",
    "orange-500": "#ff9800",
    "orange-600": "#fb8c00",
    "orange-700": "#f57c00",
    "orange-800": "#ef6c00",
    "orange-900": "#e65100",
    "orange-100-accent": "#ffd180",
    "orange-200-accent": "#ffab40",
    "orange-400-accent": "#ff9100",
    "orange-700-accent": "#ff6d00",
    "grey": "#9e9e9e",
    "grey-50": "#fafafa",
    "grey-100": "#f5f5f5",
    "grey-200": "#eeeeee",
    "grey-300": "#e0e0e0",
    "grey-400": "#bdbdbd",
    "grey-500": "#9e9e9e",
    "grey-600": "#757575",
    "grey-700": "#616161",
    "grey-800": "#424242",
    "grey-900": "#212121",
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

/**
 * Return fill pattern to use for ExcelJS
 * @return object
 */
RockGrid2.prototype.bg = function(color) {
  return {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: this.colors[color].replace('#','') },
  }
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
