# RockGrid

<img src=https://i.imgur.com/EODtQXT.gif height=300>

RockGrid is the successor of [RockDataTables](https://processwire.com/talk/topic/15524-previewdiscussion-rockdatatables/), [RockGrid1](https://processwire.com/talk/topic/19539-deprecated-rockgrid-powerful-performant-and-beautiful-data-listing-tool/), [RockTabulator](https://processwire.com/talk/topic/21984-rocktabulator-powerful-performant-and-versatile-data-grids-for-processwire/); As you can see I've taken many approaches to get easy and versatile data listings for the PW backend and finally I'm very happy with the solution 😎

## Do not distribute

This service/software is authorized for use only for the site it was
purchased for. It should not be distributed beyond the site you
registered it for, except for staging and/or development servers
related to the site.

![img](hr.svg)

## How it works / Limitations

RockGrid uses https://tabulator.info/ to display data stored in the PW backend. The main difference to Lister or ListerPro is that it loads **all** the data into the grid at once. This makes it super convenient for the client to work with the data as filtering and sorting are instant. The drawback is that this has limitations in terms of scalability - though I've never hit that limit in my projects and tabulator.info states in its docs that it can easily handle thousands of rows. Nonetheless it is important for you as a developer to keep that limitation in mind!

The performance of the grid will not only depend on the number of rows but also on the complexity of the grid (columns, formatters, etc) and also the power of the clients computer!

RockGrid is at the moment NOT intended for being used on the Frontend!

### Future ideas

- get column titles from PW field labels

## Setup

After installing the module you can create a new grid by clicking "Create New Grid" in the menu:

<img src=https://i.imgur.com/zEDu3UY.png height=150>

I recommend you create two grids:

- one with the verbose JS boilerplate
- and one with the minimal JS boilerplate

Both show important concepts and have comments that will help you to understand RockGrid and get started quickly.

## Data

RockGrid can view these types of data:

- ProcessWire PageArrays
- RockFinder results
- Plain PHP arrays

Important: Make sure that the `getData` method does not echo any output otherwise the AJAX request of the grid will fail! You can use TracyDebugger and its `bd()` method.

## Formatting

The presentation side of RockGrid is done in the grid's JS file. This part is basically working with tabulator as shown in the [tabulator docs](https://tabulator.info/docs/) - make sure to read the latest quickstart guide there!

The most important concept to understand is that the grid can display data in a different way than it is stored (or received from PHP)! There are two main mechanisms:

- mutators
- formatters

Create a new grid with the verbose JavaScript boilerplate and see the difference!

### Mutators

Mutators take the cell value from the AJAX request and CHANGE the value in the grid's internal data storage. This means they do not only DISPLAY a different value but they also HOLD a different value.

This is important to understand, because filters and sorting can need different values internally than they display to the user.

In the verbose example try to filter the `created` column by `mut` --> it will show all rows, because the phrase `mutator: ...` is not only part of the presentation but also part of the internal data!

See https://tabulator.info/docs/5.4/mutators

### Formatters

Formatters on the other hand only change the way the data is PRESENTED to the user. For example you could have a `date` column with a mutator present that makes sure the date is stored internally as something like `20230221123300`. You could then have a formatter that renders that value like `21st of February 2023 @ 12:33:00`.

Having both the mutator and the formatter in place makes it possible to **sort** the column by date! Even though the presenation is showing a string value (where you would get wrong results when sorting that column) the internal sorter is using the number value that is properly setup to support simple number sorting.

In the verbose example try to filter the `modified` column by `form` --> it will show 0 results, because the phrase `formatter: ...` is only the visual representation of the column and the internal data does not contain the string `form`!

See https://tabulator.info/docs/5.4/format

## Debugging

Every grid comes with a custom endpoint that shows the raw data without the applied tabulator JS formatting instructions.

<img src=https://i.imgur.com/9yCKKpI.png height=100>

## Dynamic Data

Sometimes you want to use one grid to show different chunks of the same data on different pages. This is possible in two ways:

1. Set get parameters in your URL, eg /your/grid/?course=123
2. Set the `ajaxParams` property of your field:

```php
/** @var InputfieldForm $form */
$form = $this->modules->get('InputfieldForm');
$page = $this->process->getPage();
$form->add([
  'type' => 'RockGrid',
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

## Frontend Helpers

RockGrid comes with several helper functions that prevent reinventing the wheel for common tasks. One example is that you often want to show an edit icon instead of the id:

Before:

<img src=https://i.imgur.com/VO3YkSU.png height=130>

Code:

```js
if (name == "id") {
  col.width = 50;
  col.hozAlign = "center";
  col.formatter = function (cell) {
    let id = cell.getValue();
    return rg.link({
      icon: "edit",
      href: rg.editUrl(id),
      tooltip: "Edit this page",
      panel: true,
    });
  };
}
```

Note: We use `rg.link()` for creating the link icon and `rg.editUrl()` to get the ProcessWire url from the page id.

For all the available helper methods see `RockGrid.js` or use DevTools to inspect the `RockGrid` object and its methods:

<img src=https://i.imgur.com/U7JQYtM.png height=350>

After:

<img src=https://i.imgur.com/aiATrXQ.png height=130>

## Loading additional libraries

For some functionality you need additional libraries to load. Do this in your grid constructor:

```php
class YourGrid extends Grid {
  public function __construct() {
    parent::__construct(); // dont forget to call the parent constructor!
    $this->rg->loadXLSX = true; // load excel library to enable XLSX download
  }
```

By default all additional scripts are NOT loaded. If you need one of the scripts, just set the flag to TRUE. Never ever set the flag to FALSE because this might overwrite the setting for another grid needing this library! The reason is that external scripts are loaded only once for all grids and the setting is based on the flag on RockGrid master module.

![img](hr.svg)

## Buttons

Buttons can be added in the grid's php file:

```php
<?php namespace RockGrid;
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
$(document).on('rg.button.add', '.RockGrid', function(e, grid) {
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

Note that if you only refer to selected IDs you do not need to add this JS to your project as it is already in place and you can simply use it by referencing it from within your button setup! Nonetheless it is easy to add custom callbacks if you need. For reference the implementation of `sendIDs` is shown here:

```js
grid.addCallback("sendIDs", function (grid, $button, modal) {
  let rows = grid.table.getSelectedRows();
  let ids = rows.map((row) => row.getData().id);
  let data = { ids: ids };
  $(modal.$el)
    .find("input")
    .each(function (i, el) {
      data[$(el).attr("name")] = $(el).val();
    });
  // console.log(data);
  grid.ajax($button.attr("name"), data, $button, modal);
});
```

![img](https://i.imgur.com/qrprt0w.png)

### XLSX Download

Example download button:

```js
// download button
$(document).on("rg.button.download", ".RockGrid", function (e, grid) {
  grid.xls({
    name: "baumrock",
    sheets: {
      Invoices: {
        rowRange: "active", // show only filtered rows in xls
        rowAdded: function (row, index) {
          if (index === 0) row.font = { name: "Comic Sans MS", bold: true };
        },
      },
    },
  });
});
```
