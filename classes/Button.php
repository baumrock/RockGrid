<?php

namespace RockGrid;

use ProcessWire\WireData;

class Button extends WireData
{
  public $attrs = [];
  public $class = 'uk-button-secondary';
  public $hidden = false;
  public $href;
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

    $href = '';
    if ($this->href) {
      $href = "href='{$this->href}'";
    }

    $attrs = '';
    foreach ($this->attrs as $k => $v) {
      if (is_numeric($k)) {
        $attrs .= " $v ";
      } else {
        $attrs .= " $k='$v' ";
      }
    }

    return "<a
      $href
      data-name='{$this->name}'
      class='rockgridbutton $hidden uk-button uk-button-small {$this->class}'
      $attrs
      $title
      >
      $label
      </a>";
  }
}
