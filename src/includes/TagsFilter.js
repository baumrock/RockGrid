/**
 * Grab tags from a column and list them as clickable tags to filter the grid
 *
 * Usage:
 * <div rg-tagsfilter="{field:foo; multiple:true; explode:comma;}"></div>
 */
(() => {
  class TagsFilter {
    constructor(el, grid) {
      this.grid = grid;
      this.table = grid.table;
      this.$root = el;
      this.settings = RockGrid.parseSettings(el.getAttribute("rg-tagsfilter"));
      this.table.on("dataLoaded", this.dataLoaded.bind(this));
    }

    dataLoaded(data) {
      const tags = this.getTags(data);
      if (this.tagsChanged(tags)) this.renderTags(tags);
      else this.updateFilter();
    }

    /**
     * Get a unique array of tags from the data
     */
    getTags(data) {
      const tags = [
        ...data.reduce((tags, row) => {
          const value = row[this.settings.field];
          if (value) tags.add(value);
          return tags;
        }, new Set()),
      ];
      // return tags sorted alphabetically (case insensitive)
      return tags.sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
      );
    }

    renderTags(tags) {
      this.$root.innerHTML = "";
      tags.forEach((tag) => this.renderTag(tag));
      this.oldTags = JSON.stringify(tags);
    }

    renderTag(tag) {
      // <span class="tag">xxx</span>
      const tagEl = document.createElement("span");
      tagEl.classList.add("tag");
      tagEl.textContent = tag;
      this.$root.appendChild(tagEl);
      tagEl.addEventListener("click", () => this.toggleTag(tagEl));
    }

    tagsChanged(tags) {
      const old = this.oldTags || "";
      return JSON.stringify(tags) !== old;
    }

    toggleTag(tag) {
      tag.classList.toggle("active");
      this.updateFilter();
    }

    updateFilter() {
      const tagElements = this.$root.querySelectorAll(".tag.active");
      const tags = Array.from(tagElements).map((tag) => tag.textContent);
      if (!tags.length) return this.table.setFilter();
      this.table.setFilter((rowData) => {
        return tags.includes(rowData[this.settings.field]);
      });
    }
  }

  document.addEventListener("RockGrid:tableReady", (e) => {
    const table = e.detail.table;
    const grid = e.detail.grid;
    const filterElements = grid.wrapper.querySelectorAll("[rg-tagsfilter]");
    filterElements.forEach((el) => new TagsFilter(el, grid));
  });
})();
