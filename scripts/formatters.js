// custom formatters for tabulator + processwire
(() => {
  let cnt = 0;
  Tabulator.extendModule("format", "formatters", {
    // open modal window to edit this page
    modal: function (cell, params) {
      cnt++;
      let val = cell.getValue();
      let id = cell.getRow().getData()[params.field || "id"];
      if (params.icon) {
        val =
          "<a href=# data-id=" +
          id +
          ' title="' +
          (params.tooltip || "edit") +
          '" uk-tooltip class="rg-modal" onclick="RockGridEdit(this);event.stopPropagation();"><i class="fa fa-edit"></i></a> ' +
          val;
      }
      return val;
    },
  });
})();
