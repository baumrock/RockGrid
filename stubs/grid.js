$(document).on('RockGrid2', function() {
  // this will add the grid using the default base setup
  // if you want to use another base setup set it as 3rd argument
  // see RockGrid2.js for more details
  RockGrid2.add('{grid}', {
    autoColumnsDefinitions:function(definitions) {
      definitions.forEach((col) => {
        let name = col.field;

        if(name == 'id') {
          col.width = 50;
          col.hozAlign = 'center';
          col.formatter = function(cell) {
            let id = cell.getValue();
            return '<a href="/admin/page/edit/?id='+id+'" class="rg-panel">'+id+'</a>';
          }
        }

        col.headerFilter = true;
      });
      return definitions;
    },
  });
});
