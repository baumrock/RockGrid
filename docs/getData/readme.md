# getData

You define the data (aka rows) of the grid in the grid's `getData()` method:

```php
public function getData()
{
  return wire()->pages->findRaw([
    'template' => 'yourtemplate'
  ], [
    'id',
    'title',
    'created',
  ], [
    'nulls' => true,
    'indexed' => false,
  ]);
}
```

## Flatten

When dealing with more complex Fieldtypes (like a page reference field or an options field) that data returned from the `findRaw()` call can not directly be consumed from RockGrid. In that case we need to flatten the data from a nested array to a plain string:

```php
  public function getData()
  {
    $data = $this->wire->pages->findRaw([
      'template' => RockMigrationsConstants::template_server,
    ], [
      'id',
      'title',
      RockMigrationsConstants::field_os . '.title',
      RockMigrationsConstants::field_hoster . '.title',
    ], [
      'nulls' => true,
      'indexed' => false,
    ]);

    foreach ($data as &$row) {
      $row['os'] = RockGrid::flatten($row['os']);
      $row['hoster'] = RockGrid::flatten($row['hoster']);
    }

    return $data;
  }
```
