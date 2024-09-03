document.addEventListener("RockGrid:init", (e) => {
  const grid = e.detail;

  // do everything below only for this specific grid
  if (grid.name !== "{gridHash}") return;

  // build the tabulator table
  const table = grid.tabulator({
    layout: "fitDataStretch",
    ajaxURL: grid.ajaxURL,
    autoColumns: true,
    autoColumnsDefinitions: function (defs) {
      defs.forEach((col) => {
        if (col.field == "foo") {
          col.visible = false;
        }
      });
      return defs;
    },

    // enable row selection (it's even saveable!)
    selectableRows: true,
  });
});
