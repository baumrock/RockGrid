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
 * Button events
 */

  // reload
  $(document).on('rg.button.reload', '.RockGrid2', function(e, grid) {
    grid.reload();
  });

  // reset header filters
  $(document).on('rg.table.dataFiltered', function(e, params) {
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
