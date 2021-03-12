"use strict";
function RG2Grid(name, setup) {
  this.name = name; // grid name
  this.setup = setup; // setup data object
  this.table; // table instance (when initialized)

  // dom elements
  this.el; // table
  this.$el; // table
  this.$root; // root container
}

RG2Grid.prototype.button = function(name) {
  return this.$root.find('.rg-buttons button[name='+name+']');
}

RG2Grid.prototype.hasHeaderFilter = function() {
  if(!this.table) return false;
  return !!this.table.getHeaderFilters().length;
}

/**
 * Reload ajax grid
 */
RG2Grid.prototype.reload = function() {
  let table = this.table;
  var headerFilters = table.getHeaderFilters();
  table.setData().then(function() {
    $.each(headerFilters, function(i, filter) {
      table.setHeaderFilterValue(filter.field, filter.value);
    });
    table.redraw();
  });
}

/**
 * Create an xls file from grid data
 */
RG2Grid.prototype.xls = async function(opt) {
  if(typeof ExcelJS == 'undefined') {
    alert('Set $this->rg2->loadXLS = true; in grid constructor to load ExcelJS');
    return;
  }

  let row;
  let name = opt.name || "data"; // filename
  let sheets = opt.sheets || {'Sheet1':{}}; // sheets

  const wb = new ExcelJS.Workbook()
  for(var sheetName in sheets) {
    let sheet = sheets[sheetName];
    let ws = wb.addWorksheet(sheetName);

    // get rows of table
    // filter can be set via sheet.rowRange setting
    // eg sheets: { 'FooSheet': { rowRange: 'visible' }}
    // see http://tabulator.info/docs/4.9/components#row-lookup
    let rows = this.table.getRows(sheet.rowRange);
    if(typeof sheet.rowsLoaded == 'function') rows = sheet.rowsLoaded(rows);

    // iterate rows
    $.each(rows, function(index, row) {
      // if a row mutator is set execute it now
      if(typeof sheet.rowMutator == 'function') sheet.rowMutator(row);

      // get row values
      let data = Object.values(row.getData());

      // add data to sheet
      row = ws.addRow(data);
      if(typeof sheet.rowFormatter == 'function') sheet.rowFormatter(row, index);
    });
  }

  const buf = await wb.xlsx.writeBuffer()
  // saveAs(new Blob([buf]), name+'.xlsx')
}

/**
 * Button events
 */

  // reload
  $(document).on('rg.button.reload', '.RockGrid2', function(e, grid) {
    grid.reload();
  });

  // reset header filters
  $(document).on('rg.dataFiltered', function(e, params) {
    // show or hide filter button
    let grid = params.grid;
    let $button = grid.button('nofilter');
    if(grid.hasHeaderFilter()) $button.fadeIn();
    else $button.fadeOut();
  });
  $(document).on('rg.button.nofilter', '.RockGrid2', function(e, grid) {
    // handle button click
    grid.table.clearHeaderFilter();
  });
