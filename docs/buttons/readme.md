# Buttons

RockGrid makes it easy to add custom buttons to your UI. By default we have two areas for buttons:

1. buttonsLeft
2. buttonsRight

<img src=buttons.png class=blur>

## Usage

All buttons are defined in the grid's `buildUI` method and added to a `ButtonsArray` (either `buttonsLeft` or `buttonsRight`). For example:

```php
public function buildUI(): void
{
  $this->buttonsRight->add([
    'name' => 'demo',
    'icon' => 'check',
  ]);
}
```

So far this button does not do anything. There are two ways where we can define the button actions:

- PHP
- JS

### PHP

Simple buttons that only open a link can be defined solely in PHP:

```php
public function buildUI(): void
{
  $url = wire()->config->urls->admin;
  $this->buttonsRight->add([
    'name' => 'demo',
    'icon' => 'check',
    'label' => 'open foo',
    'tooltip' => 'this will open the link /foo/bar',
    'href' => $url.'foo/bar/',
  ]);
}
```

### JavaScript

Whenever a button is clicked it fires the `button:XXX` event. You can listen to this event and fire custom actions:

```js
RockGrid.on("button:refresh", (button) => {
  RockGrid.getGrid(button).reload();
});
```

This is a simplified version. For the real implementation inspect the file `scripts/buttons.js` in the `site/modules/RockGrid/` folder.

> Pro-Tip: This file has plenty of other button examples to learn from!

## Visibility

### Row Selection

You can define the visibility of your button based on row selection:

```php
$this->buttonsRight->add([
  'name' => 'trashSelected',
  'icon' => 'trash',
  'attrs' => ['show-when-selected'],
]);
```

### Filter active

You can define the visibility of your button based on whether a filter is active or not:

```php
$this->buttonsRight->add([
  'name' => 'markClaimed',
  'icon' => 'check',
  'attrs' => ['show-when-filtered'],
]);
```

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
    'class' => 'uk-button-primary',
    'href' => $url . 'page/add/?parent_id=' . $parent,
    'attrs' => ['rg-modal', 'rg-modal-reload'],
  ]);
}
```

Please note the `attrs` array! This array tells RockGrid to add the attributes `rg-modal` to open the link in a modal and `rg-modal-reload` to reload the grid when the modal is closed.

## Available Buttons

RockGrid ships with some buttons for common needs out of the box!

### Refresh

The refresh (reload) button reloads grid data via AJAX when clicked:

```php
$this->buttonsRight->add([
  'name' => 'refresh',
  'icon' => 'refresh',
]);
```

### Trash selected

```php
// trashSelected
$this->buttonsRight->add([
  'name' => 'trashSelected',
  'icon' => 'trash',
  'tooltip' => 'Markierte Einträge löschen',
  'attrs' => ['show-when-selected'],
]);
```

### Others

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
