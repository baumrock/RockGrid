// ##### formatters for tabulator + processwire #####
Tabulator.extendModule("format", "formatters", {
  // open modal window to edit this page
  modal: function (cell, params) {
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

// ##### editors for tabulator + processwire #####
Tabulator.extendModule("edit", "editors", {
  calc: function (cell, onRendered, success, cancel, editorParams) {
    //create and style input
    var cellValue = cell.getValue() || "";
    input = document.createElement("input");
    input.value = cellValue;
    input.style.padding = "4px";
    input.style.width = "100%";
    input.style.boxSizing = "border-box";
    input.style.textAlign = "right";

    onRendered(function () {
      input.focus();
      input.select();
      input.style.height = "100%";
    });

    function calc() {
      str = input.value.toString();
      let baseprice = document.querySelector(
        "#Inputfield_rc_product_baseprice"
      ).value;
      str = str.replace(/p/g, baseprice);
      str = str.replace(/,/g, ".");
      val = math.evaluate(str);
      val = Math.round(val * 100) / 100;
      success(val);
    }

    function onChange(e) {
      if (input.value != cellValue) {
        calc();
      } else {
        cancel();
      }
    }

    // submit new value on blur or change
    input.addEventListener("change", onChange);
    input.addEventListener("blur", onChange);

    // submit new value on enter
    input.addEventListener("keydown", function (e) {
      if (e.keyCode == 13) {
        // enter
        calc();
      }
      if (e.keyCode == 27) {
        // escape
        cancel();
      }
    });

    return input;
  },
});
