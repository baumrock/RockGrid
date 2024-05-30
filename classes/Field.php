<?php

namespace RockGrid;

use ProcessWire\WireData;

class Field extends WireData
{
  public $selected = [];

  public function __debugInfo()
  {
    return [
      'selected' => $this->selected,
    ];
  }
}
