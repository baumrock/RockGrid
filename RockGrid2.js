"use strict";

// setup class
function RockGrid2() {
  this.urls = ProcessWire.config.urls;
  this.coldefs = {};
  this.grids = {}
  this.setups = {
    'default': {
      ajaxURL:true, // custom flag to use rockgrid ajax endpoint
      ajaxConfig: {
        method:"POST",
        headers: {
          "X-Requested-With": 'XMLHttpRequest',
          "Content-type": 'application/json; charset=utf-8',
        },
      },
      placeholder:"No data",
      pagination:'local',
      paginationSize:20,
      paginationSizeSelector:true,
      resizableColumns:'header',
      footerElement: "<span class='uk-float-left rg-footer-left'></span>"
        +"<span class='rg-footer-right'></span>",
      layout:"fitColumns",
      autoColumns:true,
      autoColumnsDefinitions:function(definitions) {
        definitions.forEach((col) => {
          col.headerFilter = true;
          col.headerFilterFunc = "rg2.smart";
        });
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

/**
 * Add a grid to the main object using custom setup base on a base setup
 * If no base setup is defined the grid will use the default one
 */
RockGrid2.prototype.add = function(gridName, customSetup, baseSetup) {
  // create an immutable copy of the setup to prevent modifying the original
  // setup and using the same setup for several grids
  let setup = $.extend({}, this.setups[baseSetup || 'default']);

  // by default we set the ajax url to the current grid
  // if you dont want an ajax grid set ajaxURL = false in your setup
  if(setup.ajaxURL === true) setup.ajaxURL = "/rockgrid2/"+gridName;

  // create setup object
  // first we take one of the predefined setups and merge user setup data
  // then we set all callbacks to rockgrid-callbacks
  // (see https://github.com/olifolkerd/tabulator/issues/3230)
  setup = $.extend(setup, customSetup, this.callbacks());

  // now create the grid object
  let grid = new RG2Grid(gridName, setup);
  this.grids[gridName] = grid;

  // add callbacks
  grid.addCallback("sendIDs", function(grid, $button, modal) {
    let rows = grid.table.getSelectedRows();
    let ids = rows.map(row => row.getData().id);
    let data = {ids: ids}
    $(modal.$el).find('input').each(function(i, el) {
      data[$(el).attr('name')] = $(el).val();
    });
    // console.log(data);
    grid.ajax($button.attr('name'), data, $button, modal);
  });
}

/**
 * Add column definition to definitions array
 */
RockGrid2.prototype.addDef = function(coldef, definitions) {
  definitions.push(coldef);
}

/**
 * Add column definition after other column
 * RockGrid2.addDefAfter('id', {...}, definitions);
 */
RockGrid2.prototype.addDefAfter = function(col, coldef, definitions) {
  let arr = definitions.map(x=>x.field);
  let index = arr.indexOf(col);
  definitions.splice(index+1, 0, coldef);
}

/**
 * Add column definition before other column
 */
RockGrid2.prototype.addDefBefore = function(col, coldef, definitions) {
  let fields = definitions.map(x=>x.field);
  let index = fields.indexOf(col);
  definitions.splice(index, 0, coldef);
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

/**
 * Add callbacks to the grid
 */
RockGrid2.prototype.callbacks = function() {
  let rg = this;
  return {
    dataFiltering:function(...params) { rg.trigger(this, 'dataFiltering', params); },
    dataFiltered:function(...params) { rg.trigger(this, 'dataFiltered', params); },
    rowSelectionChanged:function(...params) { rg.trigger(this, 'rowSelectionChanged', params); },
    ajaxResponse:function(url, params, response) {
      // if the ajax response returns RockFinder3 data we need to do some
      // additional actions before returning table data (eg storing data
      // of relations to the grid)
      return rg.setAjaxData(this, response);
    },
  }
}

/**
 * Return url to edit a page in the PW backend
 */
RockGrid2.prototype.editUrl = function(id) {
  return this.urls.admin+"page/edit/?id="+id;
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

/**
 * Return icon markup
 */
RockGrid2.prototype.icon = function(name, tooltip) {
  if(tooltip) {
    tooltip = tooltip.replace(/(<([^>]+)>)/gi, "").replace(/["|']/gi,'');
    tooltip = ' title="'+tooltip+'" uk-tooltip';
  }
  return '<i class="fa fa-'+name+'"'+tooltip+'></i>';
}

RockGrid2.prototype.init = function(name) {
  let grid = this.getGrid(name);
  if(!grid) return;
  grid.$root = $('#rg2-'+grid.name);
  grid.$el = grid.$root.find('.rg-grid');
  grid.el = grid.$el[0];
  grid.table = new Tabulator(grid.el, grid.setup);
}

/**
 * Return link markup
 * Usage:
 * RockGrid2.link({
 *   icon: 'edit',
 *   label: 'foo bar',
 *   tooltip: 'Edit this page',
 *   href: RockGrid2.editUrl(id),
 *   class: 'my-class',
 *   panel: true, // default
 *   reload: true,
 * });
 */
RockGrid2.prototype.link = function(data) {
  data = data || {}
  let href = data.href || '#';
  let panel = data.panel !== false ? ' rg-panel' : '';
  let reload = data.reload ? ' rg-panel-reload' : '';
  let cls = " class='"+data.class+panel+reload+"' ";
  let icon = this.icon(data.icon, data.tooltip);
  let label = icon+(data.label||'');
  return "<a href='"+href+"' "+cls+">"+label+"</a>";
}

/**
 * Move one column of the definitions after another
 */
RockGrid2.prototype.moveColAfter = function(columnToMove, otherColumn, definitions) {
  let fields = definitions.map(x=>x.field);
  let oldIndex = fields.indexOf(columnToMove);
  let col = definitions[oldIndex];
  delete definitions[oldIndex];
  this.addDefAfter(otherColumn, col, definitions);
}

/**
 * Move one column of the definitions before another
 */
RockGrid2.prototype.moveColBefore = function(columnToMove, otherColumn, definitions) {
  let fields = definitions.map(x=>x.field);
  let oldIndex = fields.indexOf(columnToMove);
  let col = definitions[oldIndex];
  delete definitions[oldIndex];
  this.addDefBefore(otherColumn, col, definitions);
}

/**
 * Set ajax data for this grid after an ajax response was received
 * This is necessary to support RockFinder3 as data source of grids
 */
RockGrid2.prototype.setAjaxData = function(table, response) {
  if(!response || typeof response != 'object') {
    UIkit.modal.alert("Invalid data received");
    return [];
  }
  if(response.error) {
    UIkit.modal.alert(response.error);
    return [];
  }
  if(response.type == 'RockFinder3') {
    let grid = this.getGrid(table);
    delete response.type;
    grid.rf3 = response;
    return response.rows;
  }
  return response;
}

RockGrid2.prototype.setColDef = function(column, def, data) {
  let coldef = this.coldefs[def];
  if(typeof coldef == 'function') return coldef(column, data);
  console.warn('coldef '+def+' not found');
}

/**
 * Usage:
 * Given a definitions array [def1, foo, def2, bar]
 * RockGrid2.setColOrder([foo, bar], definitions);
 * Result = [def1, foo, bar, def2]
 *
 * The first item is taken as reference where to add the other columns.
 * Leading and trailing elements will stay untouched.
 */
RockGrid2.prototype.setColOrder = function(order, definitions) {
  let defs = {};
  definitions.forEach(def => defs[def.field] = def);

  let newDefs = [];
  let pointer = 0;
  $.each(definitions, function(i, col) {
    // if colum is part of order array remove it from original definitions
    // it will be added later
    if(order.indexOf(col.field) < 0) newDefs.push(col);
    if(col.field == order[0]) pointer = i;
  });

  // now add the new orderd columns to the array
  $.each(order, function(i, name) {
    newDefs.splice(pointer++, 0, defs[name]);
  });

  // overwrite the array
  $.each(newDefs, function(i, def) {
    definitions[i] = newDefs[i];
  });
}

RockGrid2.prototype.tooltip = function(label, tooltip) {
  return "<span title='"+tooltip+"' uk-tooltip>"+label+"</span>";
}

RockGrid2.prototype.trigger = function(table, event, params) {
  let grid = this.getGrid(table);
  $(document).trigger('rg.'+event, {grid, params});
}

RockGrid2.prototype.util = function() {
  return UIkit.util;
}

// init class and trigger initial event
var RockGrid2 = new RockGrid2();
$(document).trigger('RockGrid2');

/**
 * Custom Tabulator Formatters
 * Usage: see checkbox coldef
 */
Tabulator.prototype.extendModule("format", "formatters", {

  // format the value of a checkbox
  // you can provide a NULL value to the cell to prevent rendering of YES/NO
  "rg2.checkbox": function(cell, formatterParams) {
    let value = cell.getValue();
    let $el = $(cell.getElement());
    if(!value) return;
    if(value === 'yes') {
      $el.css('background', RockGrid2.colors['green-100']);
      return RockGrid2.icon('check', value);
    }
    else {
      $el.css('background', RockGrid2.colors['red-100']);
      return RockGrid2.icon('times', value);
    }
  },

});

/**
 * Add coldefs that change many column properties at once
 * You can add custom coldefs easily on the RockGrid2 event
 *
 * Usage: RockGrid2.setColDef(col, 'checkbox');
 */

  // checkbox
  RockGrid2.coldefs['checkbox'] = function(col) {
    col.mutator = function(value) { return value ? 'yes' : 'no'; };
    col.formatter = 'rg2.checkbox';
    col.hozAlign = 'center';
    col.width = 60;
  }

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
 * Filters
 * Usage: col.headerFilterFunc = "rg2.smart";
 */
  Tabulator.prototype.extendModule("filter", "filters", {
    // smart filter
    "rg2.smart": function(headerValue, rowValue, rowData, filterParams){
      let filters = this;
      let search = headerValue;
      let val = rowValue;

      // searching . returns all non-empty cells
      if(search === '.') return val!==null;

      // searching ! returns all empty cells
      else if(search === '!') return val===null;

      // otherwise we use the regular like filter
      return filters['like'](search, val, rowData, filterParams);
    }
  });

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
