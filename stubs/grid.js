$(document).on('RockGrid2', function() {
  let rg2 = RockGrid2;

  // this will add the grid using the default base setup
  // if you want to use another base setup set it as 3rd argument
  // see RockGrid2.js for more details
  rg2.add('{grid}', {
    autoColumnsDefinitions:function(definitions) {
      definitions.forEach((col) => {
        let name = col.field;

        if(name == 'id') {
          rg2.setColDef(col, 'edit');
        }

        col.headerFilter = true;
      });
      return definitions;
    },
  });
});
