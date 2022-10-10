<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RockGrid Debugger</title>
  <script type='text/javascript' src='/site/modules/RockGrid/tabulator/js/tabulator.min.js'></script>
  <link type='text/css' href='/site/modules/RockGrid/tabulator/css/tabulator.min.css' rel='stylesheet' />
  <style>
    html,
    body {
      height: 100vh;
      padding: 0;
      margin: 0;
      overflow: hidden;
    }
  </style>
</head>

<body>
  <div id="table"></div>
  <script>
    let data = <?= $data ?>;
    if (typeof data === 'object' && data.error) {
      alert(data.error);
    } else if (!Array.isArray(data)) {
      alert('error, see console');
      console.log(data);
    } else {
      let table = new Tabulator('#table', {
        height: '100%',
        layout: "fitColumns",
        data,
        autoColumns: true,
        autoColumnsDefinitions: function(definitions) {
          definitions.forEach((column) => {
            column.headerFilter = true;
          });
          return definitions;
        },
      });
    }
  </script>
</body>

</html>