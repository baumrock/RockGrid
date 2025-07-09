(() => {
  const config = ProcessWire.config.RockGrid;
  class RockGrid {
    coldefs = {};
    config = config.config;
    edit = ProcessWire.config.urls.admin + "page/edit/?id=";
    events = {};
    grids = {};

    add(grid) {
      this.grids[grid.li.id] = grid;
    }

    ajax(url, options) {
      // prepare url
      url = ProcessWire.config.urls.root + "rockgrid/ajax/" + url;
      if (!url.endsWith("/")) url += "/";

      const defaultOptions = {
        method: "POST",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      };

      options = { ...defaultOptions, ...options };

      // if body is an object, convert it to FormData
      // this is necessary to send the data as multipart/form-data
      // which is necessary for ProcessWire to use data for $input->post()
      if (options.body) {
        // If it's a plain object, create FormData and append properties
        if (typeof options.body === "object") {
          const formData = new FormData();
          Object.keys(options.body).forEach((key) => {
            formData.append(key, options.body[key]);
          });
          options.body = formData;
        }
      }

      return fetch(url, options)
        .then((res) => {
          if (res.status > 399) {
            return res.text().then((text) => {
              throw new Error(text, res.status);
            });
          }

          // close modal?
          if (options.hideModal) options.hideModal.hide();

          // reload grid?
          if (options.reloadGrid) options.reloadGrid.reload();

          return res;
        })
        .catch((err) => {
          console.error(err);
          alert(err.message || err);
        });
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

    /**
     * Helper for formatters to either get the value from a cell or a plain value
     */
    getValue(data, defaultValue = null) {
      const val = typeof data === "object" ? data.getValue() : data;
      return val || defaultValue;
    }

    icon(name, tooltip) {
      if (!name) return "";
      if (tooltip) {
        tooltip = tooltip.replace(/(<([^>]+)>)/gi, "").replace(/["|']/gi, "");
        tooltip = ' title="' + tooltip + '" uk-tooltip';
      }
      return '<i class="fa fa-' + name + '"' + tooltip + "></i>";
    }

    // init() is added in /includes/Grid.js

    /**
     * Return link markup
     * Usage:
     * RockGrid.link({
     *   icon: 'edit',
     *   label: 'foo bar',
     *   tooltip: 'Edit this page',
     *   href: RockGrid.editUrl(id),
     *   class: 'my-class',
     *   modal: true,
     *   reload: true,
     * });
     */
    link(data) {
      data = data || {};
      const href = data.href || "#";
      const cls = data.class ? `class='${data.class}'` : "";
      const icon = this.icon(data.icon);
      const tooltip = data.tooltip ? `title='${data.tooltip}' uk-tooltip` : "";
      const modal = data.modal ? "rg-modal" : "";
      const modalCloseReload = data.modalCloseReload ? " rg-modal-reload " : "";
      return `<a
          href='${href}'
          ${cls}
          ${tooltip}
          ${modal}
          ${modalCloseReload}
          ${data.suffix}
        >${icon}${data.label || ""}</a>`;
    }

    /**
     * Edit page in modal
     *
     * This modal will
     * - have save buttons in the bottom right corner (out of the iframe)
     * - automatically close on save
     * - automatically reload the grid after close
     */
    modal(el) {
      let link = document.createElement("a");
      let $link = $(link);
      $link.attr("href", el.getAttribute("href"));
      $link.addClass("pw-modal");
      $link.attr("data-autoclose", "");
      $link.attr("data-buttons", "button.ui-button[type=submit]");
      $link.on("click", pwModalOpenEvent);
      $link.on("pw-modal-closed", (e) => {
        this.getGrid(el).reload();
        $link.remove();
      });
      $link.click();
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
        eventname
          .split(",")
          .forEach((event) => this.on(event.trim(), callback));
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
      return config.translations[key] || key;
    }
  }
  window.RockGrid = new RockGrid();
})();
