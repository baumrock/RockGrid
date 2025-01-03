# Modals

When working with RockGrid we often open links in modal windows to make sure we stay on the page that shows the grid and don't lose any filters or applied sorting.

Unfortunately ProcessWire modals are a bit limited, so RockGrid comes with a wrapper around native modals.

To open a link in a RockGrid modal all you have to do is to add the `rg-modal` attribute (not class!) to that element! If you also want to reload the grid's data when that modal is closed, add the `rg-modal-reload` attribute as well.

## Buttons

When adding buttons to the UI of your grid, you can use the `rg-modal` like so:

```php
$this->buttonsLeft->add([
  'icon' => 'plus',
  'tooltip' => 'Add a new item',
  'class' => 'uk-button-primary',
  'href' => $url . 'page/add/?parent_id=' . $parent,
  'attrs' => ['rg-modal', 'rg-modal-reload'],
]);
```