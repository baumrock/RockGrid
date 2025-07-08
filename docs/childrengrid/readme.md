# Children Grid

You can use RockGrid to display a list of all children of a page and show a page action to link directly to this grid:

<img src=https://i.imgur.com/wFAlSI5.png class=blur alt='Page List Action'>

## Setup

All you have to do to add a Grid-Action to your pagelist is to add the method `addToPageList` to your grid's php file:

```php
  public function addToPageList(Page $page)
  {
    // example based on template
    if ($page->template == 'whatever') return true;

    // example using custom page classes
    if ($page instanceof InvoiceGroup) return true;

    // on all other pages we don't add the action
    return false;
  }
```
