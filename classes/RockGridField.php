<?php

namespace RockGrid;

use ProcessWire\Field;
use ProcessWire\Page;
use ProcessWire\PageArray;
use ProcessWire\WireData;
use ProcessWire\WireException;
use RockCommerce\Variation;

class RockGridField extends WireData
{
  public $field;
  public $json;
  public $page;

  function __construct(Page $page, Field $field, $value = null)
  {
    $this->page = $page;
    $this->field = $field;
    $this->json = new WireData();
    $json = $value ?: $page->getUnformatted($field->name);
    $this->json->setArray(
      json_validate($json)
        ? json_decode($json, true)
        : []
    );
  }

  /**
   * Return selected pages
   * NOTE: Selected pages will be returned in no special order.
   * If you rely on a special order implement that afterwards or contact me.
   * @return PageArray
   * @throws WireException
   */
  public function getSelectedPages(
    // NOTE: limit down returned pages to avoid leaking data to the public!
    array $selector,
  ): PageArray {
    $default = ['id' => (array)$this->json->selected];
    $selector = array_merge($default, $selector);
    return $this->wire->pages->find($selector);
  }

  public function __debugInfo()
  {
    return [
      'page' => $this->page,
      'field' => $this->field,
      'json' => $this->json,
    ];
  }
}
