"use strict";
function RG2Grid() {
  this.el; // dom element
  this.name; // grid name
  this.setup; // setup data object
  this.table; // table instance (when initialized)
}

/**
 * Get grid dom element
 */
RG2Grid.prototype.grid = function() {
  return $('#rg2-'+this.name+' .rg-grid')[0];
}

/**
 * Reload ajax grid
 */
RG2Grid.prototype.reload = function() {
  let table = this.table;
  var headerFilters = table.getHeaderFilters();
  table.setData().then(function() {
    $.each(headerFilters, function(i, filter) {
      table.getColumn(filter.field).setHeaderFilterValue(filter.value);
    });
  });
}


/**
 * Button events
 */

  // reload
  $(document).on('button.reload', '.RockGrid2', function(e, grid) {
    grid.reload();
  });
