# Buttons

You can add buttons to your grid in three areas:

- left
- center
- right

<img src=buttons.png class="blur">

## Custom Markup

```php
  public function getButtonsLeft()
  {
    $buttons = parent::getButtonsLeft();
    $buttons->prependMarkup = "<div id='loading'>Data updating...</div>";
    return $buttons;
  }
```