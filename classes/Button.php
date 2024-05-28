<?php

namespace RockGrid;

use ProcessWire\WireData;

class Button extends WireData
{
  public $class = 'uk-button-secondary';
  public $hidden = false;
  public $label;
  public $name;
  public $tooltip;

  public function __construct($data = [])
  {
    foreach ($data as $k => $v) $this->$k = $v;
  }

  public function render(): string
  {
    $label = $this->label;
    if ($this->icon) {
      if ($label) {
        $label = "<span style='margin-left:7px;'>"
          . $this->wire->sanitizer->entities($label)
          . "</span>";
      }
      $label = "<i class='fa fa-{$this->icon}'></i>$label";
    }
    $title = '';
    if ($this->tooltip) {
      $title = " title='{$this->tooltip}' uk-tooltip";
    }
    $hidden = $this->hidden ? 'hidden' : '';
    return "<button
      data-name='{$this->name}'
      class='rockgridbutton $hidden uk-button uk-button-small {$this->class}'
      $title
      >
      $label
      </button>";
  }
}
