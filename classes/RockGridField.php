<?php

namespace RockGrid;

use ProcessWire\Field;
use ProcessWire\Page;
use ProcessWire\PageArray;
use ProcessWire\WireData;
use RockCommerce\ProductPage;
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

  public function getSelectedPages(): PageArray
  {
    // make sure we only return valid pages
    // this will exclude trashed pages and also it will
    // make it impossible to request non-repeater pages
    $hasParent = $this->wire->pages->get(2)->url;
    $forField = $this->wire->fields->get(Variation::field_options)->id;
    $hasParent .= "repeaters/for-field-$forField";

    return $this->wire->pages->find([
      'id' => (array)$this->json->selected,
      'has_parent' => $hasParent,
      'include' => 'all',
    ]);
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
