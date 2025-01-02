# Buttons

RockGrid makes it easy to add custom buttons to your UI. By default we have two areas for buttons:

1. buttonsLeft
2. buttonsRight

<img src=buttons.png class=blur>

## ButtonsArray

All buttons are defined in the grid's `buildUI` method and added to a `ButtonsArray`:

```php
public function buildUI(): void
{
  $this->buttonsRight->add([
    'name' => 'refresh',
    'icon' => 'refresh',
  ]);
}
```

## JavaScript

Whenever a button is clicked it fires the `button:XXX` event. You can listen to this event and fire custom actions:

```js
RockGrid.on("button:refresh", (button) => {
  RockGrid.getGrid(button).reload();
});
```

This is a simplified version. For the real implementation inspect the file `scripts/buttons.js` in the `site/modules/RockGrid/` folder.

> Pro-Tip: This file has plenty of other button examples to learn from!

## Example Buttons

### Create new entry

To creat e new entry we simply use ProcessWire's internal tools. All we do is add a button and set the `href` attribute to the url that ProcessWire uses to create a page. In this example we grab the parent ID from the url and we add the `pw-modal` class to the button, which will tell ProcessWire to open the link in a modal:

```php
public function buildUI(): void
{
  // example: get parent from url parameter
  $parent = wire()->input->get('id', 'int');
  $url = wire()->config->urls->admin;
  $this->buttonsLeft->add([
    'icon' => 'plus',
    'tooltip' => 'Add a new item',
    'class' => 'uk-button-primary pw-modal',
    'href' => $url . 'page/add/?parent_id=' . $parent,
  ]);
}
```

If you want to reload the grid after the panel has been closed, you can do this in your Grid's JS file:

```js
// reload grid after a pw modal has been closed
$(document).on("pw-modal-closed", () => {
  grid.reload();
});
```

### Deleting entries

Another common use case is to delete selected rows.

## Available Buttons

Reload grid data:

```php
$this->buttonsRight->add([
  'name' => 'refresh',
  'icon' => 'refresh',
]);
```

Select/Unselect all rows:

```php
$this->buttonsRight->add([
  'name' => 'selectAll',
  'label' => '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.5 5.5L5 7l2.5-2.5m-4 7L5 13l2.5-2.5m-4 7L5 19l2.5-2.5M11 6h9m-9 6h9m-9 6h9"/></svg>',
  'tooltip' => 'Select all rows',
]);
$this->buttonsRight->add([
  'name' => 'unselectAll',
  'label' => '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5h8m-8 4h5m-5 6h8m-8 4h5M3 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zm0 10a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/></svg>',
  'tooltip' => 'Unselect all rows',
]);
```

Select/Unselect all filtered rows:

```php
$this->buttonsRight->add([
  'name' => 'selectFiltered',
  'label' => '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.18 20.274L9 21v-8.5L4.52 7.572A2 2 0 0 1 4 6.227V4h16v2.172a2 2 0 0 1-.586 1.414L15 12v3m0 4l2 2l4-4"/></svg>',
  'tooltip' => 'Select filtered rows',
]);
$this->buttonsRight->add([
  'name' => 'unselectFiltered',
  'label' => '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m12 20l-3 1v-8.5L4.52 7.572A2 2 0 0 1 4 6.227V4h16v2.172a2 2 0 0 1-.586 1.414L15 12v1.5m1 5.5a3 3 0 1 0 6 0a3 3 0 1 0-6 0m1 2l4-4"/></svg>',
  'tooltip' => 'Unselect filtered rows',
]);
```