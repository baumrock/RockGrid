# ROCKGRID2

RockGrid2 is the successor of [RockDataTables](https://processwire.com/talk/topic/15524-previewdiscussion-rockdatatables/), [RockGrid](https://processwire.com/talk/topic/19539-deprecated-rockgrid-powerful-performant-and-beautiful-data-listing-tool/), [RockTabulator](https://processwire.com/talk/topic/21984-rocktabulator-powerful-performant-and-versatile-data-grids-for-processwire/); As you can see I've taken many approaches to get easy and versatile data listings for the PW backend. Hopefully RockGrid2 will finally be the best solution available!

## Do not distribute

This service/software is authorized for use only for the site it was
purchased for. It should not be distributed beyond the site you
registered it for, except for staging and/or development servers
related to the site.

![img](hr.svg)

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

If you want/need to place your grids in a dedicated folder somewhere else you can add that folder to RockGrid on init()

```php
/** @var RockGrid2 $rg */
$rg = $this->wire()->modules->get('RockGrid2');
$rg->addDir("/path/to/your/rock/grids");
```

Once you load your field the JS file that defines all visual and frontend logic parts will be created automatically making it really easy to setup.

## Data

Most likely you'll want the grid to display a set of ProcessWire pages. Simply add a `getData()` method to your PHP file that defines the grid:

```php
  /**
   * Get data for this grid
   */
  public function getData() {
    /** @var RockFinder3Master $finder */
    $finder = $this->wire->rockfinder;
    $data = $finder->find([
        'template' => 'foo',
        'sort' => '-id',
      ])->addColumnsFromTemplate('foo');
    return $data;
  }
```

The getData method can return different types of data like a plain PHP array or a RockFinder3.

Important: Make sure that the `getData` method does not echo any output otherwise the AJAX request of the grid would fail! For debugging I recommend using tracy and the `bd()` method.

### Dynamic Data

Sometimes you want to use one grid to show different chunks of the same data on different pages. This is possible in two ways:

1) Set get parameters in your URL, eg /your/grid/?course=123
2) Set the `ajaxParams` property of your field:

```php
/** @var InputfieldForm $form */
$form = $this->modules->get('InputfieldForm');
$page = $this->process->getPage();
$form->add([
  'type' => 'RockGrid2',
  'label' => false,
  'skipLabel' => Inputfield::skipLabelBlank,
  'themeBorder' => 'none',
  'grid' => 'Tickets',
  'icon' => 'ticket',
  'ajaxParams' => [
    'course' => $page->course, // get course from page data
  ],
]);
```

![img](hr.svg)

## Frontend styling

RockGrid will automatically add a JS file for your grid that helps you setting up the grid on the frontend. You can then alter any of your columns in the `autoColumnsDefinitions` section of that file. The most important parts are `cell formatters` (see http://tabulator.info/docs/5.0/format#format) and `cell mutators` (see http://tabulator.info/docs/5.0/mutators). Here is an example:

```js
else if(field == "starthour") {
  col.title = RockGrid2.icon('flag-o', "Beginn");
  col.width = 50;
  col.hozAlign = 'center';
  col.mutator = function(value, data) {
    let start = data[prefix+"start"];
    if(start) return moment(start).format('HH:mm');
  }
}
else if(field == prefix+"end") {
  col.title = RockGrid2.icon('flag-checkered', "Ende");
  col.width = 50;
  col.hozAlign = 'center';
  col.formatter = function(cell) {
    let end = cell.getValue();
    if(end) return moment(end).format('HH:mm');
  }
  col.headerFilterFunc = function(search, cell) {
    cell = moment(cell).format("HH:mm");
    return cell.indexOf(search) > -1;
  }
}
```

As you can see there are several helpers available via `RockGrid2` - in the example above we use RockGrid2.icon() to display an icon with a tooltip as column header.

![img](hr.svg)

## Loading additional libraries

For some functionality you need additional libraries to load. Do this in your grid constructor:

```php
class YourGrid extends Grid {
  public function __construct() {
    parent::__construct(); // dont forget to call the parent constructor!
    $this->rg2->loadXLSX = true; // load excel library to enable XLSX download
  }
```

By default all additional scripts are NOT loaded. If you need one of the scripts, just set the flag to TRUE. Never ever set the flag to FALSE because this might overwrite the setting for another grid needing this library! The reason is that external scripts are loaded only once for all grids and the setting is based on the flag on RockGrid2 master module.

![img](hr.svg)

## Buttons

Buttons can be added in the grid's php file:

```php
<?php namespace RockGrid2;
class Demo extends Grid {
  /**
   * Get left buttons for this grid
   * @return Buttons
   */
  public function getButtonsLeft() {
    $buttons = parent::getButtonsLeft();
    $buttons->add([
      'name' => 'add',
      'icon' => 'plus',
      'value' => 'Demo button',
      'href' => $this->admin."page/add/?parent_id=123",
      'secondary' => false,
    ])->addClass('rg-panel rg-panel-reload');
  }

  [...]

}
```

You can modify button behaviour on the frontend via JavaScript:

```js
$(document).on('rg.button.add', '.RockGrid2', function(e, grid) {
  ...
});
```

### Button callbacks

You can define callbacks for your buttons that will be fired via ajax request.

![img](https://i.imgur.com/EODtQXT.gif)

PHP

```php
public function getButtonsCenter() {
  $buttons = parent::getButtonsCenter();
  $buttons->add([
    'name' => 'markClaimed',
    'icon' => 'check',
    'tooltip' => 'Mark selected items as claimed',
    'hidden' => '!selected',
    'appendMarkup' => '<div id=markClaimedConfirm hidden>
        <p class=uk-text-bold>Do you really want to mark selected items as claimed?</p>
        <p>'.Effort::label_claimedwith.'<br>
          <input type=text name=note class=uk-input>
        </p>
      </div>',
    'callback' => [
      'name' => 'sendIDs',
      'confirmmarkup' => '#markClaimedConfirm',
      'loading' => 'Saving items...',
      'reload' => true,
      'execute' => function($input) {
        $ids = $this->wire->sanitizer->intArray($input->ids);
        foreach($this->wire->pages->findMany(["id" => $ids]) as $p) {
          $p->setAndSave(Effort::field_claimed, 1);
          $p->setAndSave(Effort::field_claimedwith, $input->note);
        }
        return [
          'success' => true,
          // 'message' => 'das ist ein test',
        ];
      },
    ],
  ]);
  return $buttons;
}
```

You can either set a confirm message via the `confirm` property (single string) or you can provide a css selector in the `confirmmarkup` property to fetch the html from (useful for adding inputfields to your confirm message).


JS

Note that if you only refer to selected IDs you need to add this JS to your project as it is already in place and you can simply use it by referencing it from within your button setup! Nonetheless it is easy to add custom callbacks if you need. For reference the implementation of `sendIDs` is shown here:

```js
grid.addCallback("sendIDs", function(grid, $button, modal) {
  let rows = grid.table.getSelectedRows();
  let ids = rows.map(row => row.getData().id);
  let data = {ids: ids}
  $(modal.$el).find('input').each(function(i, el) {
    data[$(el).attr('name')] = $(el).val();
  });
  // console.log(data);
  grid.ajax($button.attr('name'), data, $button, modal);
});
```

![img](https://i.imgur.com/qrprt0w.png)


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
