/**
 * Create a flipper to quickly filter dates and jump to the next/previous year/month/week/day
 *
 * Usage:
 * <div rg-flipper="field:date;range:year;">Y</div>
 * <div rg-flipper="field:date;range:monday;">W</div>
 * <div rg-flipper="field:date;range:month;">M</div>
 * <div rg-flipper="field:date;range:day;">D</div>
 * <div rg-flipper="field:week;range:monday;format:yy-MM-dd;">W</div>
 */
(() => {
  class Flipper {
    constructor(el, grid) {
      this.grid = grid;
      this.table = grid.table;
      this.$root = el;
      this.settings = RockGrid.parseSettings(el.getAttribute("rg-flipper"));
      this.renderButtons();
      this.handleClicks();
    }

    current() {
      let date = luxon.DateTime.local();
      const format = this.getFormat();

      if (this.settings.range === "year") date = date.toFormat(format);
      if (this.settings.range === "month") date = date.toFormat(format);
      if (this.settings.range === "day") date = date.toFormat(format);
      if (this.settings.range === "monday") {
        // Get the current week's Monday
        date = date.startOf("week").toFormat(format);
      }
      this.setFilter(date);
    }

    flip(el) {
      if (el.classList.contains("prev")) this.prev();
      if (el.classList.contains("current")) this.current();
      if (el.classList.contains("next")) this.next();
    }

    getFormat() {
      // If custom format is provided, use it
      if (this.settings.format) {
        return this.settings.format;
      }

      // Default formats for each range type
      if (this.settings.range === "year") return "yyyy";
      if (this.settings.range === "month") return "yyyy-MM";
      if (this.settings.range === "day") return "yyyy-MM-dd";
      if (this.settings.range === "monday") return "yyyy-MM-dd";

      // fallback
      return "yyyy-MM-dd";
    }

    handleClicks() {
      this.$root.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.flip(e.target);
      });
    }

    next() {
      // get current header filter value for the field
      const filter = this.table.getHeaderFilterValue(this.settings.field);
      const format = this.getFormat();
      let date;

      if (this.settings.range === "year") {
        // if filter is set, parse it, else use current year
        date = filter
          ? luxon.DateTime.fromFormat(filter, format)
          : luxon.DateTime.local();
        // add 1 year
        date = date.plus({ years: 1 }).toFormat(format);
      } else if (this.settings.range === "month") {
        date = filter
          ? luxon.DateTime.fromFormat(filter, format)
          : luxon.DateTime.local();
        date = date.plus({ months: 1 }).toFormat(format);
      } else if (this.settings.range === "day") {
        date = filter
          ? luxon.DateTime.fromFormat(filter, format)
          : luxon.DateTime.local();
        date = date.plus({ days: 1 }).toFormat(format);
      } else if (this.settings.range === "monday") {
        // if filter is set, parse it, else use current week's Monday
        date = filter
          ? luxon.DateTime.fromFormat(filter, format)
          : luxon.DateTime.local().startOf("week");
        // add 1 week
        date = date.plus({ weeks: 1 }).toFormat(format);
      } else {
        // fallback: just use current date
        date = luxon.DateTime.local().toFormat(format);
      }
      this.setFilter(date);
    }

    prev() {
      // get current header filter value for the field
      const filter = this.table.getHeaderFilterValue(this.settings.field);
      const format = this.getFormat();
      let date;

      if (this.settings.range === "year") {
        // if filter is set, parse it, else use current year
        date = filter
          ? luxon.DateTime.fromFormat(filter, format)
          : luxon.DateTime.local();
        // subtract 1 year
        date = date.minus({ years: 1 }).toFormat(format);
      } else if (this.settings.range === "month") {
        date = filter
          ? luxon.DateTime.fromFormat(filter, format)
          : luxon.DateTime.local();
        date = date.minus({ months: 1 }).toFormat(format);
      } else if (this.settings.range === "day") {
        date = filter
          ? luxon.DateTime.fromFormat(filter, format)
          : luxon.DateTime.local();
        date = date.minus({ days: 1 }).toFormat(format);
      } else if (this.settings.range === "monday") {
        // if filter is set, parse it, else use current week's Monday
        date = filter
          ? luxon.DateTime.fromFormat(filter, format)
          : luxon.DateTime.local().startOf("week");
        // subtract 1 week
        date = date.minus({ weeks: 1 }).toFormat(format);
      } else {
        // fallback: just use current date
        date = luxon.DateTime.local().toFormat(format);
      }
      this.setFilter(date);
    }

    renderButtons() {
      const label = this.$root.textContent;
      const html = `
        <span class="uk-flex">
          <button class="prev uk-button uk-button-default uk-button-small">&lt;</button>
          <button class="current uk-button uk-button-default uk-button-small">${label}</button>
          <button class="next uk-button uk-button-default uk-button-small">&gt;</button>
        </span>
        `;
      this.$root.innerHTML = html;
    }

    setFilter(date) {
      this.table.setHeaderFilterValue(this.settings.field, date);
    }
  }

  document.addEventListener("RockGrid:tableReady", (e) => {
    const grid = e.detail.grid;
    const flipperElements = grid.wrapper.querySelectorAll("[rg-flipper]");
    flipperElements.forEach((el) => new Flipper(el, grid));
  });
})();
