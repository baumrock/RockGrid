// custom formatters for tabulator + processwire
(() => {
  let cnt = 0;
  Tabulator.extendModule("format", "formatters", {
    // open modal window to edit this page
    modal: function (cell, params) {
      cnt++;
      let val = cell.getValue();
      let id = cell.getRow().getData()[params.field || "id"];
      let url = RockGrid.edit + id;
      let reload = params.reload === false ? "false" : "true";
      if (params.icon) {
        val =
          "<a href=" +
          url +
          " data-id=" +
          id +
          " rg-modal-reload=" +
          reload +
          ' title="' +
          (params.tooltip || "edit") +
          '" uk-tooltip class="rg-modal" onclick="RockGridModal(this);event.stopPropagation();event.preventDefault();"><i class="fa fa-edit"></i></a> ' +
          val;
      }
      return val;
    },
  });
})();
