# API

## Field API

The `RockGridField` class provides a structured way to handle and manipulate the data of a RockGrid field. Below is an explanation of its key components and methods:

### Properties

- **$page**: This property holds the `Page` object associated with the RockGrid field.
- **$field**: This property holds the `Field` object that represents the RockGrid field.
- **$json**: This property is a `WireData` object that stores the JSON-decoded data of the field.

### Constructor

The constructor initializes the `RockGridField` object with a `Page`, `Field`, and an optional value. If no value is provided, it retrieves the unformatted value of the field from the page and decodes it from JSON format.

### Example

```php
$page->getFormatted('your-grid-field')->getSelectedPages();
```

See `RockGridField.php` for all available methods!
