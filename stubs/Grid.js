document.addEventListener("RockGrid:init", (e) => {
  let grid = e.detail;
  var table = new Tabulator(grid.div, {
    layout: "fitDataStretch",
    ajaxURL: grid.ajaxURL,
    autoColumns: true,
    autoColumnsDefinitions: function (definitions) {
      definitions.forEach((col) => {
        if (col.field == "foo") {
          col.visible = false;
        }
      });
      return definitions;
    },
  });
});
