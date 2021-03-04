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
