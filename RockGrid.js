class RockGridMaster {
  edit = ProcessWire.config.urls.admin + "page/edit/?id=";
  grids = {};
  events = {};
  coldefs = {};
  modal = false;

  add(grid) {
    this.grids[grid.li.id] = grid;
  }

  confirm(data) {
    // use modal dialog instead of confirm for custom ok/cancel callbacks
    const modal = UIkit.modal.dialog(`
      <div class="uk-modal-body">${data.message}</div>
      <div class="uk-modal-footer uk-text-right">
        <button class="uk-button uk-button-default uk-modal-close" type="button" style="transform: translateY(-1px);">${data.cancelLabel}</button>
        <button class="uk-button uk-button-primary ui-button ok uk-position-relative">
          <div class="uk-position-center spinner" style="opacity: 0;"><div uk-spinner="ratio: 0.5"></div></div>
          <div class="label">${data.okLabel}</div>
        </button>
      </div>
    `);

    // ok clicked
    const okButton = modal.$el.querySelector(".ok");
    okButton.addEventListener("click", () => {
      okButton.querySelector(".label").style.opacity = 0;
      okButton.querySelector(".spinner").style.opacity = 1;
      if (data.confirm) data.confirm(modal);
    });

    // cancel clicked
    const cancelButton = modal.$el.querySelector(".uk-modal-close");
    cancelButton.addEventListener("click", () => {
      if (data.reject) data.reject(modal);
    });
  }

  editUrl(id) {
    return ProcessWire.config.urls.admin + "page/edit/?id=" + id;
  }

  getGrid(el) {
    let li = el.closest(".InputfieldRockGrid");
    if (!li) return false;
    return this.grids[li.id];
  }

  getTable(el) {
    return this.getGrid(el).table;
  }

  icon(name, tooltip) {
    if (!name) return "";
    if (tooltip) {
      tooltip = tooltip.replace(/(<([^>]+)>)/gi, "").replace(/["|']/gi, "");
      tooltip = ' title="' + tooltip + '" uk-tooltip';
    }
    return '<i class="fa fa-' + name + '"' + tooltip + "></i>";
  }

  /**
   * Return link markup
   * Usage:
   * RockGrid.link({
   *   icon: 'edit',
   *   label: 'foo bar',
   *   tooltip: 'Edit this page',
   *   href: RockGrid.editUrl(id),
   *   class: 'my-class',
   *   panel: true, // default
   *   reload: true,
   * });
   */
  link(data) {
    data = data || {};
    let href = data.href || "#";
    let cls = " class='" + data.class + "' ";
    let icon = this.icon(data.icon);
    let label = data.label || "";
    label = icon + (label ? " " + label : "");
    let tooltip = data.tooltip
      ? " title='" + data.tooltip + "' uk-tooltip"
      : "";
    const suffix = data.suffix || "";
    // onclick makes sure we do not select the row if the link is clicked and
    // row selection is enabled in the grid's settings
    const modal = data.modal
      ? "onclick='RockGridModal(this);event.stopPropagation();event.preventDefault();'"
      : "";
    const modalCloseReload = data.modalCloseReload ? " rg-modal-reload " : "";
    return (
      "<a href='" +
      href +
      "' " +
      cls +
      tooltip +
      " " +
      modal +
      modalCloseReload +
      suffix +
      ">" +
      label +
      "</a>"
    );
  }

  /**
   * Registers an event listener for the specified event name.
   *
   * @param {string} eventname - The name of the event to listen for. Multiple events can be specified, separated by commas.
   * @param {function} callback - The function to call when the event is triggered.
   * @returns void
   *
   * Usage:
   *
   * // Register a single event
   * RockGrid.on('eventName', (event) => {
   *   console.log('Event triggered:', event);
   * });
   *
   * // Register multiple events
   * RockGrid.on('event1,event2', (event) => {
   *   console.log('One of the events triggered:', event);
   * });
   */
  on(eventname, callback) {
    if (eventname.includes(",")) {
      eventname.split(",").forEach((event) => this.on(event.trim(), callback));
      return;
    }
    let events = this.events[eventname] || [];
    events.push(callback);
    this.events[eventname] = events;
  }

  sse(config) {
    // Send data to the server
    fetch(config.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify(config.data),
    })
      .then((response) => response.json())
      .then((responseData) => {
        // create stream to receive server-sent events
        let eventSource = new EventSource(config.url, {
          withCredentials: true,
        });

        // send stream to onConnect callback
        if (config.onConnect) config.onConnect(eventSource);

        let interval = false;

        let messages = [];
        const processMessages = () => {
          while (messages.length) {
            try {
              config.onMessage(messages.shift());
            } catch (error) {
              console.error("Error processing message:", error);
            }
          }
        };

        eventSource.onmessage = function (event) {
          const msg = event.data;
          if (msg === "rockgrid-sse-done") {
            eventSource.close();
            clearInterval(interval);
            processMessages();
            if (config.onDone) config.onDone();
          } else {
            messages.push(msg);
          }
        };

        // message processor via setInterval
        // this is to make sure the browser updates the UI properly
        interval = setInterval(processMessages, 250);

        // errors
        eventSource.onerror = function (event) {
          console.error("EventSource failed:", event);
        };
      })
      .catch((error) => {
        console.error("Error sending data to server:", error);
      });
  }

  /**
   * Create a view url based on the page id
   * Handy when we know the id but don't know the url of the page.
   */
  viewUrl(id) {
    return ProcessWire.config.urls.admin + "page/?rockgrid-view=" + id;
  }

  x(key) {
    const translations = ProcessWire.config.RockGridTranslations;
    // if key is found return it, otherwise return key
    return translations[key] || key;
  }
}

var RockGrid = new RockGridMaster();

class RockGridGrid {
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

  sleep(prop, value) {
    let oldValue = this.sleepValue;
    let oldString = JSON.stringify(oldValue);
    let newValue = JSON.parse(oldString);
    newValue[prop] = value;
    let newString = JSON.stringify(newValue);

    this.textarea.value = newString;
    if (newString !== oldString) {
      if (!this.noStateChanged) this.li.classList.add("InputfieldStateChanged");
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
    let grid = this;
    let table = new Tabulator(this.div, config);
    this.table = table;
    this.updateButtonVisibility();

    // handle row selection
    table.on("rowSelectionChanged", () => {
      let selectedRows = table.getSelectedRows();
      let selectedIds = selectedRows.map((row) => row.getData().id);

      // save selected rows to hidden textarea
      this.sleep("selected", selectedIds);
      this.updateButtonVisibility();
    });
    table.on("dataProcessed", () => {
      table.selectRow(this.sleepValue.selected || []);
    });
    table.on("dataLoaded", function (data) {
      if (typeof data == "object" && data.error) {
        alert(data.error);
      }
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

  updateButtonVisibility() {
    const hasSelectedRows = this.table.getSelectedRows().length > 0;

    // update li class
    if (hasSelectedRows) {
      this.wrapper.classList.add("has-selected-rows");
      this.wrapper.classList.remove("no-selected-rows");
    } else {
      this.wrapper.classList.remove("has-selected-rows");
      this.wrapper.classList.add("no-selected-rows");
    }
  }
}

// edit page in modal
// this modal will
// - have save buttons in the bottom right corner (out of the iframe)
// - automatically close on save
// - automatically reload the grid after close
function RockGridModal(el) {
  let link = document.createElement("a");
  let $link = $(link);
  $link.attr("href", el.getAttribute("href"));
  $link.addClass("pw-modal");
  $link.attr("data-autoclose", "");
  $link.attr("data-buttons", "button.ui-button[type=submit]");
  $link.on("click", pwModalOpenEvent);
  $link.on("pw-modal-closed", (e) => {
    RockGrid.getGrid(el).reload();
    $link.remove();
  });
  $link.click();
}

// ### modal click interception
document.addEventListener("click", (e) => {
  let a = e.target.closest("a[rg-modal]");
  if (!a) return;
  let modalUrl = a.getAttribute("href");
  if (modalUrl) {
    e.preventDefault();
    RockGridModal(a);
  }
});
