/**
 * Show edit icon and open page in modal and reload grid after close
 */
RockGrid.coldefs["edit"] = function (col) {
  col.headerFilter = false;
  col.headerSort = false;
  col.title = "";
  col.width = 40;
  col.hozAlign = "center";
  col.formatter = function (cell) {
    return RockGrid.link({
      icon: "edit",
      href: RockGrid.editUrl(cell.getValue()),
      tooltip: RockGrid.x("edit"),
      modal: true,
      modalCloseReload: true,
    });
  };
};
