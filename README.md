# RockGrid2

RockGrid2 is the successor of [RockDataTables](https://processwire.com/talk/topic/15524-previewdiscussion-rockdatatables/), [RockGrid](https://processwire.com/talk/topic/19539-deprecated-rockgrid-powerful-performant-and-beautiful-data-listing-tool/), [RockTabulator](https://processwire.com/talk/topic/21984-rocktabulator-powerful-performant-and-versatile-data-grids-for-processwire/); As you can see I've taken many approaches to get easy and versatile data listings for the PW backend. Hopefully RockGrid2 will finally be the best solution available!

## Setup

The display part is done via the inputfield `InputfieldRockGrid2`. In a ProcessModule all you need to do is to add such a field to your form:

```php
<?php namespace ProcessWire;
class ProcessFoo extends Process {
  public static function getModuleInfo() {
    return [...];
  }

  public function execute() {
    $this->headline('...');
    $this->browserTitle('...');
    /** @var InputfieldForm $form */
    $form = $this->modules->get('InputfieldForm');

    $form->add([
      'type' => 'RockGrid2',
      'label' => 'Foo',
      'grid' => 'FooGrid',
    ]);

    return $form->render();
  }
}
```

Next, setup the `FooGrid` object by placing a file in `/site/assets/RockGrid2/`:

```php
// file /site/assets/RockGrid2/FooGrid.php
<?php namespace RockGrid2;
class FooGrid extends Grid {
}
```

Once you load your field the JS file that defines all visual and frontend logic parts will be created automatically making it really easy to setup.

## Data

Data of the grid is defined either via JavaScript or on the PHP side you define it via the `getData()` method of the grid object. The getData method can return different types of data like a plain PHP array or a RockFinder3. If using a RockFinder3 you get the benefit of quick and easy development or debugging because you can utilize RockFinder3's Tracy dumping feature:

```php
$rg = $modules->get('RockGrid2');
$grid = $rg->getGrid('ListInvoices');
$grid->dump();
```

![img](https://i.imgur.com/O9DFR7H.png)

## Loading additional libraries

For some functionality you need additional libraries to load. Do this in your grid constructor:

```php
class YourGrid extends Grid {
  public function __construct() {
    parent::__construct();
    $this->rg2->loadXLSX = true; // load excel downloader
  }
```

By default all additional scripts are NOT loaded. If you need one of the scripts, just set the flag to TRUE. Never ever set the flag to FALSE because this might overwrite the setting for another grid needing this library! The reason is that external scripts are loaded only once for all grids and the setting is based on the flag on RockGrid2 master module.

## Buttons

### XLSX Download

Example download button:

```js
// download button
$(document).on('rg.button.download', '.RockGrid2', function(e, grid) {
  grid.xls({
    name: 'baumrock',
    sheets: {
      'Invoices': {
        rowRange: 'active', // show only filtered rows in xls
        rowAdded:function(row, index) {
          if(index === 0) row.font = { name: 'Comic Sans MS', bold: true };
        }
      }
    }
  });
});
```
