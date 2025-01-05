document.addEventListener("RockGrid:init", (e) => {
  const grid = e.detail;

  // do everything below only for this specific grid
  if (grid.name !== "{gridHash}") return;

  // grid settings
  // grid.noStateChanged = true;

  // build the tabulator table
  const table = grid.tabulator({
    // https://tabulator.info/docs/6.3/layout#layout
    layout: "fitColumns",
    ajaxURL: grid.ajaxURL,
    autoColumns: true,
    autoColumnsDefinitions: function (defs) {
      defs.forEach((col) => {
        // defaults
        col.headerFilter = true;

        // individual settings
        // if (col.field == "foo") col.visible = false;
        // if (col.field == "bar") col.title = "Bar Column";
      });
      return defs;
    },

    // enable row selection
    selectableRows: true,
    // selectableRowsRangeMode: "click",
  });
});
