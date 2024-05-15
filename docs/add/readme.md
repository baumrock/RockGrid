# Adding Grids

Grids can live in the following directories:

- /site/templates/RockGrid
- /site/modules/*/RockGrid

The namespace must match the module's folder name, eg:

/site/modules/RockCommerce/RockGrid/ProductVariations.php

```php
<?php

namespace RockCommerce;

use RockGrid\Grid;

class ProductVariations extends Grid
{
}
```