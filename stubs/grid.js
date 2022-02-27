$(document).on('RockGrid2', function() {
  let rg2 = RockGrid2;

  // this will add the grid using the default base setup
  // if you want to use another base setup set it as 3rd argument
  // see RockGrid2.js for more details
  rg2.add('{grid}', {

    // here you can set any properties of your grid
    paginationSize: 15,

    // column definitions
    autoColumnsDefinitions:function(definitions) {

      // you can add custom columns from JS like this:
      definitions.push({
        field: 'money',
        title: 'Dynamic Money Column',
        formatter: function(cell) {
          // demo of a cell formatter
          // responsible for the visual representation of the cell
          return cell.getValue() + " (Euro)";
        },
        mutator: function() {
          // demo of a cell mutator
          // responsible for the cell value (used for filtering)
          return Math.floor(Math.random() * 101);
        },

        // these settings are redundant as they are set by default
        // they are here for better understanding
        // try filtering your money column like this: <50
        // I plan to improve the smart filter to support filters like <50 >20
        // but this will likely not happen very soon...
        headerFilter: true,
        headerFilterFunc: 'rg2.smart',
      });

      // loop all definitions and set column settings
      definitions.forEach((col) => {
        let name = col.field;

        // example how to use the link() helper
        if(name == 'id') {
          col.width = 50;
          col.hozAlign = 'center';
          col.formatter = function(cell) {
            let id = cell.getValue();
            return rg2.link({
              icon: 'edit',
              href: rg2.editUrl(id),
              tooltip: 'Edit this page',
              panel: true,
            });
          }
        }

        // example how to use a predefined coldef
        // you can use this technique with your own coldefs as well
        if(name == 'title') {
          rg2.setColDef(col, 'edit');
        }

        // use the page id and format it as if it was a money column
        // this is to show how you can easily format number values to money format
        // it also adds a sum row at the bottom of the table that shows
        // instant sum of all filtered rows
        // See RockGrid2.js to see how the money coldef was implemented
        if(name == 'money') {
          rg2.setColDef(col, 'money');
        }

      });
      return definitions;
    },
  });
});
