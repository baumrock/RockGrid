/**
 * Create a flipper to quickly filter dates and jump to the next/previous year/month/day
 *
 * Usage:
 * <div rg-flipper="field:date;range:year;">Y</div>
 * <div rg-flipper="field:date;range:month;">M</div>
 * <div rg-flipper="field:date;range:day;">D</div>
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
      if (this.settings.range === "year") date = date.toFormat("yyyy");
      if (this.settings.range === "month") date = date.toFormat("yyyy-MM");
      if (this.settings.range === "day") date = date.toFormat("yyyy-MM-dd");
      this.setFilter(date);
    }

    flip(el) {
      if (el.classList.contains("prev")) this.prev();
      if (el.classList.contains("current")) this.current();
      if (el.classList.contains("next")) this.next();
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
      let date;
      if (this.settings.range === "year") {
        // if filter is set, parse it, else use current year
        date = filter
          ? luxon.DateTime.fromFormat(filter, "yyyy")
          : luxon.DateTime.local();
        // add 1 year
        date = date.plus({ years: 1 }).toFormat("yyyy");
      } else if (this.settings.range === "month") {
        date = filter
          ? luxon.DateTime.fromFormat(filter, "yyyy-MM")
          : luxon.DateTime.local();
        date = date.plus({ months: 1 }).toFormat("yyyy-MM");
      } else if (this.settings.range === "day") {
        date = filter
          ? luxon.DateTime.fromFormat(filter, "yyyy-MM-dd")
          : luxon.DateTime.local();
        date = date.plus({ days: 1 }).toFormat("yyyy-MM-dd");
      } else {
        // fallback: just use current date
        date = luxon.DateTime.local().toISODate();
      }
      this.setFilter(date);
    }

    prev() {
      // get current header filter value for the field
      const filter = this.table.getHeaderFilterValue(this.settings.field);
      let date;
      if (this.settings.range === "year") {
        // if filter is set, parse it, else use current year
        date = filter
          ? luxon.DateTime.fromFormat(filter, "yyyy")
          : luxon.DateTime.local();
        // subtract 1 year
        date = date.minus({ years: 1 }).toFormat("yyyy");
      } else if (this.settings.range === "month") {
        date = filter
          ? luxon.DateTime.fromFormat(filter, "yyyy-MM")
          : luxon.DateTime.local();
        date = date.minus({ months: 1 }).toFormat("yyyy-MM");
      } else if (this.settings.range === "day") {
        date = filter
          ? luxon.DateTime.fromFormat(filter, "yyyy-MM-dd")
          : luxon.DateTime.local();
        date = date.minus({ days: 1 }).toFormat("yyyy-MM-dd");
      } else {
        // fallback: just use current date
        date = luxon.DateTime.local().toISODate();
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
