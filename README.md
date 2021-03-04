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

Next, setup the visual representation of the grid which is done by JavaScript:

```js
// file /site/assets/RockGrid2/FooGrid.js
// the "RockGrid2" event is fired when the RockGrid2 master object is ready
// see http://tabulator.info/docs/4.9/columns#autocolumns
$(document).on('RockGrid2', function() {
  var tabledata = [
    {id:1, name:"Billy Bob", age:12, gender:"male", height:95, col:"red", dob:"14/05/2010"},
    {id:2, name:"Jenny Jane", age:42, gender:"female", height:142, col:"blue", dob:"30/07/1954"},
    {id:3, name:"Steve McAlistaire", age:35, gender:"male", height:176, col:"green", dob:"04/11/1982"},
  ];

  // Different from the example of the tabulator website we use RockGrid2.add()
  // instead of creating a new Tabulator instance directly. The reason for that
  // is that the grid is first added to RockGrid2.grids and later - when the
  // field is loaded - initialized. This happens whenever the content of the
  // inputfield is loaded (which can be a lot later - think of AJAX fields...).
  RockGrid2.add('FooGrid', {
    data:tabledata,
    autoColumns:true,
  });
});
```

![img](https://i.imgur.com/jTsuto9.png)

You see that using RockGrid2 is as simple as using tabulator, but it makes your life even easier because it ships with lots of helpers that you need often when working with grids in ProcessWire!

## Predefined table setups

You can use one of the predefined table setups like this:

```js
$(document).on('RockGrid2', function() {
  // load the default setup
  // other setups are available via name: RockGrid2.getSetup('foo');
  let setup = RockGrid2.getSetup();

  // you can then modify any property of the setup to your needs
  setup.data = [...];
  setup.columns = [...];

  // and finally add the grid to RockGrid2
  RockGrid2.add('FooGrid', setup);
});
```
