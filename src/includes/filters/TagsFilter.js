/**
 * Grab tags from a column and list them as clickable tags to filter the grid
 *
 * Usage:
 * <div rg-tagsfilter="field:foo;"></div>
 * <div rg-tagsfilter="field:foo;mode:and;"></div> // Match ALL selected tags
 * <div rg-tagsfilter="field:foo;mode:or;"></div>  // Match ANY selected tag (default)
 * <div rg-tagsfilter="field:foo;multiple:true;"></div> // If the field contains multiple comma-separated tags per row
 *
 * The `multiple:true` option tells the filter to treat the field as containing multiple comma-separated tags per row,
 * so each tag will be split and handled individually. Without `multiple:true`, the filter treats the field as a single tag per row.
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

          // if multiple, split by comma
          if (this.settings.multiple) {
            value.split(",").forEach((tag) => tags.add(tag.trim()));
          } else {
            tags.add(value);
          }

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
        const value = rowData[this.settings.field];

        // if multiple, split by comma and check tags based on mode
        if (this.settings.multiple) {
          const fieldTags = value.split(",").map((tag) => tag.trim());

          // Check if mode is "and" - all selected tags must be present
          if (this.settings.mode === "and") {
            return tags.every((tag) => fieldTags.includes(tag));
          } else {
            // Default "or" mode - any selected tag can match
            return tags.some((tag) => fieldTags.includes(tag));
          }
        } else {
          return tags.includes(value);
        }
      });
    }
  }

  document.addEventListener("RockGrid:tableReady", (e) => {
    const grid = e.detail.grid;
    const filterElements = grid.wrapper.querySelectorAll("[rg-tagsfilter]");
    filterElements.forEach((el) => new TagsFilter(el, grid));
  });
})();
