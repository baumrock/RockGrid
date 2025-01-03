class RockGridMaster {
  edit = ProcessWire.config.urls.admin + "page/edit/?id=";
  grids = {};
  events = {};

  add(grid) {
    this.grids[grid.li.id] = grid;
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

  viewUrl(id) {
    return ProcessWire.config.urls.admin + "page/?rockgrid-view=" + id;
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

    // handle row selection
    table.on("rowSelectionChanged", () => {
      let selectedRows = table.getSelectedRows();
      let selectedIds = selectedRows.map((row) => row.getData().id);
      this.sleep("selected", selectedIds);
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
}

// edit page in modal
function RockGridModal(el) {
  let $iframe = pwModalWindow(el.getAttribute("href"));
  $iframe.on("dialogclose", () => {
    if (el.getAttribute("rg-modal-reload") !== null)
      RockGrid.getGrid(el).reload();
  });
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
