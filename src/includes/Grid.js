(() => {
  RockGrid.init = function (textarea, name, jsVars, assets) {
    new Grid(textarea, name, jsVars, assets);
  };

  class Grid {
    ajaxURL;
    awake = false;
    div;
    li;
    name;
    sleepValue;
    table;
    textarea;
    wrapper;

    constructor(textarea, name, jsVars, assets) {
      this.name = name;
      this.jsVars = JSON.parse(jsVars);
      this.ajaxURL = "/rockgrid/ajax/" + name + "/";
      this.textarea = document.querySelector(textarea);
      this.sleepValue = JSON.parse(this.textarea.value || "{}");
      this.li = this.textarea.closest("li.Inputfield");
      this.div = this.li.querySelector("div.RockGrid");
      this.wrapper = this.li.querySelector("div.RockGridWrapper");

      // load assets via javascript
      // this is to make sure grids also work in repeaters that
      // are loaded via ajax when a tab is opened
      assets = JSON.parse(assets);
      if (assets.js) {
        // add script tag to the dom and wait until it's loaded
        let script = document.createElement("script");
        script.src = assets.js;
        document.head.appendChild(script);
        script.onload = () => {
          RockGrid.add(this);
          document.dispatchEvent(
            new CustomEvent("RockGrid:init", { detail: this })
          );
        };
      }
      if (assets.css) {
        document.head.appendChild(document.createElement("link")).href =
          assets.css;
      }
    }

    /**
     * Add column to definitions after a certain column
     *
     * Usage:
     * defs = grid.addAfter(defs, 'id', {...});
     */
    addAfter(definitions, fieldname, config) {
      let found = false;
      let arr = [];
      definitions.forEach((item) => {
        arr.push(item);
        if (item.field === fieldname) {
          arr.push(config);
          found = true;
        }
      });
      if (!found) definitions.push(config);
      return arr;
    }

    /**
     * Usage: grid.columnOrder(defs, ['foo', 'bar']);
     * Unlisted columns will be moved to the end
     */
    columnOrder(defs, columnNames) {
      if (!columnNames || !columnNames.length) return defs;
      return defs.sort((a, b) => {
        const indexA = columnNames.indexOf(a.field);
        const indexB = columnNames.indexOf(b.field);
        // Keep items not in columnNames at the end
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    }

    reload() {
      let table = this.table;
      return new Promise((resolve, reject) => {
        let selectedRows = table.getSelectedData();
        table
          .replaceData()
          .then(() => {
            table.selectRow(selectedRows.map((row) => row.id));
            resolve();
          })
          .catch(reject);
      });
    }

    /**
     * By default we pass the url params of the current page to every ajax
     * request of the grid. This makes it possible to easily implement filters
     * in the grid solely by updating the getData() method in the PHP file.
     */
    setupAjaxParams(config) {
      // early exit if not an ajax grid
      if (!config.ajaxURL) return;
      // early exit if custom ajaxParams already set
      if (config.ajaxParams) return;
      // by default we add all available url params to the ajax request
      config.ajaxParams = function () {
        const params = new URLSearchParams(window.location.search);
        return Object.fromEntries(params);
      };
    }

    /**
     * We use AJAX for the grid by default unless explicitly set to false
     */
    setupAjaxUrl(config) {
      if (config.ajaxURL === false) return;
      if (config.ajaxURL) return;
      config.ajaxURL = this.ajaxURL;
    }

    sleep(prop, value) {
      let oldValue = this.sleepValue;
      let oldString = JSON.stringify(oldValue);
      let newValue = JSON.parse(oldString);
      newValue[prop] = value;
      let newString = JSON.stringify(newValue);

      this.textarea.value = newString;
      if (newString !== oldString) {
        if (!this.noStateChanged)
          this.li.classList.add("InputfieldStateChanged");
      }

      this.sleepValue = newValue;
    }

    // dispatch tableBuilt event so that grids can attach their own listeners
    // tableBuilt() {
    //   document.dispatchEvent(
    //     new CustomEvent("RockGrid:tableBuilt", { detail: this })
    //   );
    // }

    tabulator(config) {
      // ---- defaults ----
      this.setupAjaxUrl(config);
      this.setupAjaxParams(config);

      // setup the tabulator table
      let grid = this;
      let table = new Tabulator(this.div, config);
      this.table = table;

      // handle row selection
      table.on("rowSelectionChanged", () => {
        let selectedRows = table.getSelectedRows();
        let selectedIds = selectedRows.map((row) => row.getData().id);

        // add class for button visibility
        if (selectedRows.length > 0) {
          this.wrapper.classList.add("has-selected-rows");
        } else {
          this.wrapper.classList.remove("has-selected-rows");
        }

        // save selected rows to hidden textarea
        this.sleep("selected", selectedIds);
      });
      // add class for button visibility
      table.on("dataFiltered", (filters, rows) => {
        if (filters.length > 0) {
          this.wrapper.classList.add("has-filtered-rows");
        } else {
          this.wrapper.classList.remove("has-filtered-rows");
        }
      });
      table.on("dataProcessed", () => {
        table.selectRow(this.sleepValue.selected || []);
      });
      table.on("dataLoaded", function (data) {
        if (typeof data == "object" && data.error) {
          alert(data.error);
        }
      });

      // log selected ids to console
      table.on("rowSelectionChanged", () => {
        const selectedRows = table.getSelectedRows();
        console.log(selectedRows.map((row) => row.getData().id));
      });

      // load all callbacks that have been attached via RockGrid.on('table:xxx')
      // attach every callback to the current table
      Object.keys(RockGrid.events).forEach((eventname) => {
        if (eventname.startsWith("table:")) {
          let tabulatorevent = eventname.slice(6);
          let callbacks = RockGrid.events[eventname];
          callbacks.forEach((callback) => {
            // console.log("add callback to grid", tabulatorevent);
            table.on(tabulatorevent, () => {
              callback(table, grid);
            });
          });
        }
      });

      return table;
    }

    trigger(eventname, detail) {
      let callbacks = RockGrid.events[eventname];
      if (!callbacks) return;
      callbacks.forEach((callback) => {
        callback(detail);
      });
    }
  }
})();
