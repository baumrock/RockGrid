<?php

namespace RockGrid;

use ProcessWire\Field;
use ProcessWire\Page;
use ProcessWire\PageArray;
use ProcessWire\WireData;

class RockGridField extends WireData
{
  public $page;
  public $field;
  public $json;

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
    return $this->wire->pages->find([
      'id' => (array)$this->json->selected,
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
