# Buttons

You can add buttons to your grid in three areas:

- left
- center
- right

<img src=buttons.png class="blur">

## Custom Markup

You can add custom markup to any of these areas by adding a `renderButonsXXX` method to your grid's PHP file, where `XXX` stands for either `Left`, `Center` or `Right`:

```php
public function renderButtonsLeft($markup)
{
  return $markup . "<span>FOO!</span>";
}
```
