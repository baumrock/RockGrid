# Dynamic Data

Retrieving data for a grid is simple, maybe like this:

```php
  public function getData()
  {
    return $this->wire->pages->findRaw(
      // pages to find
      "template=event",
      // field data to return
      [
        'id',
        'title',
        'modified',
      ],
      // options
      [
        'nulls' => true,
        'indexed' => false,
      ]
    );
  }
```

This might be all you need, but what if you wanted to show only a portion of the data based on an inputfield or based on a query parameter?

The challenge here is that RockGrid grabs data via AJAX calls, so you can't simply use PHP with variables like `$page` in the getData() method, because these variables do not exist.

Instead, we need to add parameters to our JS grid to make sure that we can consume the parameter in our `getData()` method on the server side.

Let's explain this by example!

## Show data based on url parameter

Let's say we display a grid on the backend and we have an url like /list/events/?year=2025

We now want to show a grid that only lists events of the year 2025!

In our JS file we add the following:

```js
  // build the tabulator table
  const table = grid.tabulator({
    // add the year parameter to the ajaxURL
    ajaxURL: grid.ajaxURL,
    ajaxParams: function() {
      const urlParams = new URLSearchParams(window.location.search);
      return {
        year: urlParams.get("year"),
      };
    },
    // ...
  });
```

Now every ajax request made by the grid will have the year parameter appended to the URL!

We can then consume this parameter in our `getData()` method with regular PW API:

```php
  public function getData()
  {
    $year = wire()->input->get('year', 'int');
    return $this->wire->pages->findRaw(
      // pages to find
      [
        "template" => "event",
        "year" => $year,
      ],
      // ...
    );
  }
```

<div class='uk-alert uk-alert-warning'>Please note that ajax params are unsanitized data! Be sure to sanitize them and be sure to check if the user has access to the returned data not to expose any sensitive data to the wrong eyes!</div>

