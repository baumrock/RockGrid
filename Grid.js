"use strict";
function RG2Grid(name, setup) {
  this.name = name; // grid name
  this.setup = setup; // setup data object
  this.table; // table instance (when initialized)
  this.rf3; // stores rockfinder3 data after ajax call
  this.settings = {}; // grid settings, eg applied filters

  this.callbacks = {};

  // dom elements
  this.el; // table
  this.$el; // table
  this.$root; // root container
}

RG2Grid.prototype.addCallback = function (name, callback) {
  this.callbacks[name] = callback;
};

/**
 * Listen to events
 */
RG2Grid.prototype.addListeners = function () {
  let grid = this;

  // hide/unhide buttions with the data-hidden property when selection changes
  this.table.on("rowSelectionChanged", function (data, rows) {
    let $buttons = grid.$root.find(
      '.rg-buttons button[data-hidden="!selected"]'
    );
    if (rows.length) $buttons.fadeIn();
    else $buttons.fadeOut();
  });
  $(document).on("rg.button.clearSelection", grid.$root, function (e, grid) {
    grid.table.deselectRow();
  });

  // add button to reset header filter
  this.table.on("dataFiltered", function (filters, rows) {
    let $button = grid.button("nofilter");
    if (grid.hasHeaderFilter()) $button.fadeIn();
    else $button.fadeOut();
  });
  $(document).on("rg.button.nofilter", grid.$root, function (e, grid) {
    grid.table.clearHeaderFilter();
  });

  // select all filtered rows
  this.table.on("rowSelectionChanged", function (data, rows) {
    if (!grid.setup.selectable) return;
    grid.button("selectAllFiltered").fadeIn();
  });
  $(document).on("rg.button.selectAllFiltered", grid.$root, function (e, grid) {
    grid.table.selectRow(grid.table.getRows(true));
  });
};

RG2Grid.prototype.ajax = function (callback, data, $button, modal) {
  let url = "/rockgrid2/" + this.name + "/ajax/" + callback;
  if (modal) {
    $(modal.$el).find(".rg-callback-confirm").fadeOut();
    let $body = $(modal.$el).find(".uk-modal-body");
    let loading = $button.data("loading");
    if (loading) $body.html('<i class="fa fa-spin fa-spinner"></i> ' + loading);
  }
  $.ajax({
    url,
    type: "post",
    data: JSON.stringify(data),
    dataType: "json",
    headers: { "X-Requested-With": "XMLHttpRequest" },
  })
    .done(function (data) {
      if (data.success) {
        if (modal) modal.hide();
        if ($button.data("reload")) RockGrid.getGrid($button).reload();
      } else {
        UIkit.modal.alert(data.message || "Error");
      }
    })
    .fail(function (data) {
      UIkit.modal.alert(data.message || "Error");
    });
};

RG2Grid.prototype.sse = function (callback, data, $button, modal) {
  let url = "/rockgrid2/" + this.name + "/sse/" + callback;

  if (modal) {
    $(modal.$el).find(".rg-callback-confirm").fadeOut();
    let $body = $(modal.$el).find(".uk-modal-body");
    let loading = $button.data("loading");
    if (loading) {
      $body.html(
        '<i class="fa fa-spin fa-spinner"></i> ' +
          loading +
          '<div id="sse-progress" style="display:none"></div>'
      );
    }
  }

  // first send an ajax request to store ids in the session
  $.ajax({
    url,
    type: "post",
    data: JSON.stringify(data),
    dataType: "json",
    headers: { "X-Requested-With": "XMLHttpRequest" },
  })
    .done(function (data) {
      let $progress = $("#sse-progress");
      const evtSource = new EventSource(url, { withCredentials: true });
      evtSource.onmessage = function (event) {
        console.log(event);
        if (event.data === "DONE") {
          evtSource.close();
          if (modal) modal.hide();
          if ($button.data("reload")) RockGrid.getGrid($button).reload();
        } else if ($progress) {
          $progress.fadeIn();
          $progress.html(event.data);
        }
      };
    })
    .fail(function (data) {
      UIkit.modal.alert(data.message || "Error");
    });
};

RG2Grid.prototype.ajax = function (callback, data, $button, modal) {
  let url = "/rockgrid2/" + this.name + "/cc/" + callback;
  if (modal) {
    $(modal.$el).find(".rg-callback-confirm").fadeOut();
    let $body = $(modal.$el).find(".uk-modal-body");
    let loading = $button.data("loading");
    if (loading) $body.html('<i class="fa fa-spin fa-spinner"></i> ' + loading);
  }
  $.ajax({
    url,
    type: "post",
    data: JSON.stringify(data),
    dataType: "json",
    headers: { "X-Requested-With": "XMLHttpRequest" },
  })
    .done(function (data) {
      if (data.success) {
        if (modal) modal.hide();
        if ($button.data("reload")) RockGrid.getGrid($button).reload();
      } else {
        UIkit.modal.alert(data.message || "Error");
      }
    })
    .fail(function (data) {
      UIkit.modal.alert(data.message || "Error");
    });
};

RG2Grid.prototype.button = function (name) {
  return this.$root.find(".rg-buttons button[name=" + name + "]");
};

RG2Grid.prototype.getCallback = function (name) {
  return this.callbacks[name];
};

RG2Grid.prototype.hasHeaderFilter = function () {
  if (!this.table) return false;
  return !!this.table.getHeaderFilters().length;
};

/**
 * Reload ajax grid
 */
RG2Grid.prototype.reload = function () {
  let table = this.table;
  var headerFilters = table.getHeaderFilters();
  table.setData().then(function () {
    $.each(headerFilters, function (i, filter) {
      table.setHeaderFilterValue(filter.field, filter.value);
    });
    table.redraw();
  });
};

RG2Grid.prototype.util = function () {
  return UIkit.util;
};

/**
 * Create an xls file from grid data
 */
RG2Grid.prototype.xls = async function (opt) {
  if (typeof ExcelJS == "undefined") {
    alert(
      "Set $this->rg2->loadXLS = true; in grid constructor to load ExcelJS"
    );
    return;
  }

  let name = opt.name || "data"; // filename
  let sheets = opt.sheets || { Sheet1: {} }; // sheets

  const wb = new ExcelJS.Workbook();
  for (var sheetName in sheets) {
    let sheet = sheets[sheetName];

    let ws = wb.addWorksheet(sheetName);
    if (typeof sheet.sheetAdded == "function") sheet.sheetAdded(ws);

    // get rows of table
    // filter can be set via sheet.rowRange setting
    // eg sheets: { 'FooSheet': { rowRange: 'visible' }}
    // see http://tabulator.info/docs/4.9/components#row-lookup
    let rows = this.table.getRows(sheet.rowRange);
    if (typeof sheet.rowsLoaded == "function") rows = sheet.rowsLoaded(rows);

    // iterate rows
    let columns = {};
    $.each(rows, function (rowindex, row) {
      let obj = row.getData();
      row = ws.addRow(Object.values(obj));

      // row callback
      // change cell values or add formatting, hyperlinks etc.
      // see https://github.com/exceljs/exceljs#value-types
      if (typeof sheet.rowCallback == "function") {
        sheet.rowCallback(row, rowindex);
      }
    });
  }

  const buf = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buf]), name + ".xlsx");
};

/**
 * Callbacks
 */
// $(document).on('click', '.rg-callback-confirm', function(e) {
//   e.preventDefault();

//   // new html
//   let $ok = $(e.target);
//   $ok.fadeOut();
//   let $form = $ok.closest('form');
//   let $body = $form.find('.uk-modal-body');
//   $body.html('<i class="fa fa-spin fa-spinner"></i> '+$form.data('loading'));

//   // fire callback
//   let grid = RockGrid.getGrid(e.target);
//   let callback = grid.getCallback($form.data('callback'));
//   callback(grid, $button);
// });
$(document).on("click", ".rg-buttons button[data-callback]", function (e) {
  let grid = RockGrid.getGrid(e.target);
  let $button = $(e.target).closest("button");
  let callback = grid.getCallback($button.data("callback"));
  if (!callback) return;

  // get confirm message or markup
  // confirmmarkup is a css selector to grab html from
  // eg 'confirmmarkup' => '#myhiddenelement'
  let confirm = $button.data("confirm");
  let confirmmarkup = $button.data("confirmmarkup");
  if (confirmmarkup) confirm = $(confirmmarkup).html();

  // if a confirm message is set we ask for confirmation
  // you can prevent the confirmation question by shift+click
  if (confirm && !e.shiftKey) {
    let modal = UIkit.modal.dialog(
      "<form>" +
        '<div class="uk-modal-body">' +
        confirm +
        "</div>" +
        '<div class="uk-modal-footer uk-text-right">' +
        '<button class="uk-button uk-button-default uk-modal-close" type="button" autofocus>Cancel</button>' +
        '<button class="uk-button uk-button-primary rg-callback-confirm" onClick="return false">Ok</button>' +
        "</div></form>"
    );

    $(modal.$el)
      .find(".rg-callback-confirm")
      .on("click", function () {
        callback(grid, $button, modal);
      });
  } else {
    // no confirm message, so we call the callback directly
    callback(grid, $button);
  }
});

/**
 * Buttons
 */

// reload
$(document).on("rg.button.reload", ".RockGrid", function (e, grid) {
  grid.reload();
});
