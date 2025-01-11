# Children Grid

You can use RockGrid to display a list of all children of a page and show a page action to link directly to this grid:

<img src=https://i.imgur.com/wFAlSI5.png class=blur alt='Page List Action'>

## Setup

The first step is to create a grid from RockGrid's UI and copy the name:

<img src=https://i.imgur.com/BpZhrUC.png class=blur alt='Copy Grid Name'>

### Custom Page Classes

When using custom page classes all you need to do to show the grid to edit children is to add the following method to your page class:

```php
<?php

namespace ProcessWire;

class TodosPage extends DefaultPage
{
  public function childrenGridSettings(): array
  {
    return [
      'grid' => 'RockGrid\Todos',
    ];
  }
}
```

### Via Hook

If you are not using custom page classes I highly recommend you start using them, because they are extremely easy to setup and extremely powerful.

If you still don't want to use them, here is how you can use a hook to tell RockGrid to show the grid for page children editing:

```php
// in site/ready.php
$wire->addHookAfter('RockGrid::getChildrenGridSettings', function ($event) {
  $p = $event->arguments(0);
  if($p->template != 'todos') return;
  $event->return = [
    'grid' => 'RockGrid\Todos',
  ];
});
```
