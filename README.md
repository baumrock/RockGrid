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

If you want/need to place your grids in a dedicated folder somewhere else you can add that folder to RockGrid on init()

```php
/** @var RockGrid2 $rg */
$rg = $this->wire()->modules->get('RockGrid2');
$rg->addDir(__DIR__."/grids");
```

Once you load your field the JS file that defines all visual and frontend logic parts will be created automatically making it really easy to setup.

## Data

Data of the grid is defined either via JavaScript or on the PHP side you define it via the `getData()` method of the grid object.

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

The getData method can return different types of data like a plain PHP array or a RockFinder3. If using a RockFinder3 you get the benefit of quick and easy development or debugging because you can utilize RockFinder3's Tracy dumping feature:

```php
$rg = $modules->get('RockGrid2');
$grid = $rg->getGrid('ListInvoices');
$grid->dump();
```

![img](https://i.imgur.com/O9DFR7H.png)

### Dynamic Data

If you need to adjust grid data to the currently edited page, you can add an urlsegmentstring to the ajax request url:

```php
$form->add([
  'type' => 'RockGrid2',
  'label' => 'Dynamic Grid',
  'grid' => 'DynamicGridDemo',
  'urlSegmentStr' => "/$page",
]);
```

You can then access and parse this urlsegmentstring in the getData() method of your grid:

```php
// get group from urlsegmentstr
$groupid = trim($grid->urlSegmentStr, "/");
$group = $mailer->getGroup($groupid);
if(!$group->id) throw new WireException("Group not found");
if(!$group->editable()) throw new WireException("No access");
$finder = ...
```

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
      'href' => "/demo/page/add/?parent_id=123",
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

JS

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

`$button['callback']['name']` defines which callback to fire on the JS side. The `sendIDs` callback can be used by many buttons as it sends all ids of selected rows together with data that might be provided via `input` fields.

You can either set a confirm message via the `confirm` property (single string) or you can provide a css selector to fetch the html from (useful for adding inputfields to your confirm message):

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
