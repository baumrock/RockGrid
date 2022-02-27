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

        if(name == 'money') {
          // set the money coldef (sets formatter and params)
          // see RockGrid2.js for details what is happening
          rg2.setColDef(col, 'money');

          // here we overwrite the default money formatter so that we can
          // show how to colorize cells based on their value while still using
          // a tabulator formatter to format the cells value
          // see https://bit.ly/3vo1ZEw
          col.formatter = function(cell, params, callback) {
            let moneyFormatter = cell.getTable().modules.format.getFormatter("money");
            let formatted = moneyFormatter(cell, params, callback);
            let $el = $(cell.getElement());

            if(cell.getValue()<50) $el.css('background', rg2.colors['red-100']);
            else $el.css('background', rg2.colors['green-100']);

            return formatted;
          };
        }

      });
      return definitions;
    },
  });
});
