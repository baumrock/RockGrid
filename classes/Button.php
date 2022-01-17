<?php namespace RockGrid2;

use ProcessWire\InputfieldButton;

class Button extends InputfieldButton {

  public function ___render() {
    $markup = parent::___render();
    return $this->prependMarkup.$markup.$this->appendMarkup;
  }

}
