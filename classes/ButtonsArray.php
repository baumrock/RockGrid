<?php

namespace RockGrid;

use ProcessWire\WireArray;

class ButtonsArray extends WireArray
{
  public function add($button): self
  {
    if (is_array($button)) $button = new Button($button);
    parent::prepend($button);
    return $this;
  }

  public function render(): string
  {
    $out = '';
    foreach ($this as $button) $out .= $button->render();
    return $out;
  }

  public function __toString()
  {
    return $this->render();
  }
}
