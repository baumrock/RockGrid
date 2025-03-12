# Autoload Grids

You can make grids autoload and trigger the `init()` method automatically (for example to attach hooks):

```php
class YourGrid extends Grid
{
  const autoload = true;

  public function init(): void
  {
    bd('init!');
  }

  // ...
}
```
